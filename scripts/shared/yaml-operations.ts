import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import { pipe } from 'remeda';
import type { z } from 'zod';
import type { Result, FileToValidate, FileToValidateWithYamlData } from './validation-pipeline';
import { formatZodError } from './validation-pipeline';
import { chain, tryCatch, mapResults } from './functional-utils';

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
 * Performs Zod schema validation and returns formatted errors including field paths,
 * messages, and file location for debugging.
 *
 * @template T - Type of the validated data
 * @param {z.ZodSchema<T>} schema - Zod schema to validate against
 * @param {unknown} data - Data to validate
 * @param {string} name - Display name for error messages
 * @param {string} filePath - File path for error context
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
 * Loads YAML files from the given paths and extracts nested data based on wrapperKey.
 *
 * Handles files with wrapper structures (e.g., `{ job_analysis: {...} }`) by extracting
 * the nested data when wrapperKey is specified. Data is loaded but not yet validated.
 *
 * @param {FileToValidate[]} pathsToValidate - Array of files to load with their metadata and optional wrapperKey
 * @returns {Result<FileToValidateWithYamlData[]>} Result containing files with loaded YAML data, or first error encountered
 *
 * @example
 * loadYamlFilesFromPath([
 *   { fileName: 'job-analysis.yaml', path: '/path/to/file.yaml', type: JobAnalysisSchema, wrapperKey: 'job_analysis' }
 * ])
 * // Extracts data from { job_analysis: { ... } } structure
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
 * Preserves the file metadata while validating the data. Returns detailed validation
 * errors including field paths and file locations on failure.
 *
 * @param {FileToValidateWithYamlData[]} filesToValidate - Array of files with loaded YAML data to validate
 * @returns {Result<FileToValidateWithYamlData[]>} Result containing validated files or first validation error
 *
 * @example
 * validateYamlFileAgainstZodSchema([
 *   { fileName: 'metadata.yaml', path: '/path/to/file.yaml', type: MetadataSchema, wrapperKey: null, data: {...} }
 * ])
 * // => { success: true, data: [...] } if valid
 * // => { success: false, error: '...', details: '...', filePath: '...' } if invalid
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
