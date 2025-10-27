import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import { pipe } from 'remeda';
import type { z } from 'zod';
import type { Result, FileToValidate, FileToValidateWithYamlData } from './types';
import { formatZodError } from './yaml-validation';
import { chain, tryCatch, mapResults } from '@shared/core/functional-utils';

/**
 * Reads and parses a YAML file from the filesystem.
 *
 * Combines file reading and YAML parsing in a functional pipeline.
 * Returns detailed errors for both file reading and YAML parsing failures.
 *
 * @param {string} path - Absolute path to YAML file
 * @returns {Result<unknown>} Success with parsed YAML data, or error with details
 */
export const readYaml = (path: string): Result<unknown> =>
  pipe(
    tryCatch(() => readFileSync(path, 'utf-8'), `Failed to read ${path}`),
    (r) => chain(r, (content) => tryCatch(() => yaml.load(content), 'Invalid YAML')),
  );

/**
 * Validates data against a Zod schema with detailed error reporting.
 *
 * Performs schema validation using safeParse and returns formatted errors with field paths,
 * messages, and file location. Preserves original ZodError for advanced error handling.
 *
 * @template T - Type of the validated data
 * @param {z.ZodSchema<T>} schema - Zod schema to validate against
 * @param {unknown} data - Data to validate
 * @param {string} name - Display name for error messages (used in error header)
 * @param {string} filePath - File path for error context (included in result)
 * @returns {Result<T>} Success with validated data, or error with formatted details and original ZodError
 */
export const validateSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  name: string,
  filePath: string,
): Result<T> => {
  const validation = schema.safeParse(data);
  return validation.success
    ? { success: true, data: validation.data }
    : {
        success: false,
        error: `${name} validation failed`,
        details: formatZodError(validation.error),
        originalError: validation.error,
        filePath,
      };
};

/**
 * Loads YAML files and extracts nested data based on optional wrapperKey.
 *
 * Reads each YAML file and extracts the relevant data. If wrapperKey is specified,
 * extracts the nested value from that key (e.g., { job_analysis: {...} } → {...}).
 * Falls back to full YAML data if wrapper key is not found or not needed.
 *
 * @param {FileToValidate[]} pathsToValidate - Array of files to load with their metadata
 * @returns {Result<FileToValidateWithYamlData[]>} Files with loaded data, or first read/parse error
 *
 * @example
 * loadYamlFilesFromPath([
 *   { fileName: 'job_analysis.yaml', path: '/path/to/file.yaml', wrapperKey: 'job_analysis', ... }
 * ])
 * // Extracts data from { job_analysis: { ... } } wrapper structure
 */
export const loadYamlFilesFromPath = (
  pathsToValidate: FileToValidate[],
): Result<FileToValidateWithYamlData[]> => {
  return mapResults(pathsToValidate, (file) =>
    pipe(readYaml(file.path), (r) =>
      chain(r, (rawData) => {
        const extractedData = file.wrapperKey
          ? (rawData as Record<string, unknown>)?.[file.wrapperKey] || rawData
          : rawData;

        return {
          success: true as const,
          data: { ...file, data: extractedData },
        };
      }),
    ),
  );
};

/**
 * Validates loaded YAML files against their associated Zod schemas.
 *
 * Applies each file's schema validation while preserving metadata. Returns detailed errors
 * with field paths and file locations. Short-circuits on first validation failure.
 *
 * @param {FileToValidateWithYamlData[]} filesToValidate - Array of files with loaded YAML data to validate
 * @returns {Result<FileToValidateWithYamlData[]>} Validated files or first validation error with context
 *
 * @example
 * validateYamlFileAgainstZodSchema([
 *   { fileName: 'metadata.yaml', path: '/path/to/file.yaml', type: MetadataSchema, data: {...} }
 * ])
 * // Returns: { success: true, data: [...] } on success
 * // Returns: { success: false, error: 'validation failed', details: '...', filePath: '...' } on error
 */
export const validateYamlFileAgainstZodSchema = (
  filesToValidate: FileToValidateWithYamlData[],
): Result<FileToValidateWithYamlData[]> => {
  return mapResults(filesToValidate, (file) =>
    pipe(
      validateSchema(file.type as z.ZodSchema<unknown>, file.data, file.fileName, file.path),
      (r) =>
        chain(r, (validatedData) => ({
          success: true as const,
          data: { ...file, data: validatedData },
        })),
    ),
  );
};
