import { pipe } from 'remeda';
import type { Result, FileToValidateWithYamlData } from '@shared/validation/validation-pipeline';
import { chain, chainPipe, tryCatch } from '@shared/core/functional-utils';
import {
  transformFilesToApplicationData,
  generateTypeScriptModule,
} from './application-data-generator';
import type { ApplicationData } from '@types';
import { loggers } from '@shared/core/logger';
import { PATHS } from '@shared/core/config';
import { ApplicationDataSchema } from '@/zod/schemas';

/**
 * Transforms validated YAML files to ApplicationData using fileName mapping.
 *
 * Maps each file's fileName to the corresponding ApplicationData property
 * (metadata, job_analysis, resume, cover_letter) using the transformation utility.
 *
 * @param {FileToValidateWithYamlData[]} files - Validated YAML files with extracted data
 * @returns {Result<ApplicationData>} Result containing ApplicationData object or transformation error
 */
const transformToApplicationData = (
  files: FileToValidateWithYamlData[],
): Result<ApplicationData> => {
  loggers.validation.debug('Generating application data module');
  return transformFilesToApplicationData(files);
};

/**
 * Parses and validates data structure against ApplicationData schema
 * @param {unknown} data - Data to validate
 * @returns {ApplicationData} Validated application data
 * @throws {z.ZodError} If validation fails
 */
export function validateApplicationData(data: unknown): ApplicationData {
  return ApplicationDataSchema.parse(data);
}
/**
 * Validates ApplicationData against the complete Zod schema.
 *
 * Ensures all required fields are present and properly typed before generating
 * the TypeScript module. Logs success or returns detailed validation errors.
 *
 * @param {ApplicationData} applicationData - Complete application data to validate
 * @returns {Result<ApplicationData>} Result containing validated data or Zod validation errors
 */
const validateApplicationDataSchema = (
  applicationData: ApplicationData,
): Result<ApplicationData> => {
  const result = tryCatch(
    () => validateApplicationData(applicationData),
    'Application data validation failed',
  );

  if (result.success) {
    loggers.validation.debug('Application data validation passed');
  }

  return result.success ? { success: true, data: applicationData } : result;
};

/**
 * Creates a curried function to generate TypeScript module content from ApplicationData.
 *
 * Returns a function that transforms ApplicationData into a TypeScript module string
 * with proper imports, types, and exports. Company name is baked into the closure.
 *
 * @param {string} companyName - Company name for module comments and metadata
 * @returns {Function} Function that accepts ApplicationData and returns Result with TypeScript module string
 */
const generateTypeScriptContent = (
  companyName: string,
): ((data: ApplicationData) => Result<string>) => {
  return (applicationData) => {
    const tsContent = generateTypeScriptModule(applicationData, companyName);
    return { success: true, data: tsContent };
  };
};

/**
 * Writes TypeScript module to disk at the configured path.
 *
 * Uses Bun.write for efficient file writing and logs success with file path.
 * Returns the TypeScript content on success for pipeline continuation.
 *
 * @param {string} tsContent - TypeScript module content to write
 * @returns {Result<string>} Result containing the TypeScript content or write error
 */
const writeTypeScriptModule = (tsContent: string): Result<string> => {
  const writeResult = tryCatch(
    () => Bun.write(PATHS.GENERATED_DATA, tsContent),
    'Failed to write application data',
  );

  if (writeResult.success) {
    loggers.validation.success(`Application data written to ${PATHS.GENERATED_DATA}`);
  }

  return writeResult.success ? { success: true, data: tsContent } : writeResult;
};

/**
 * Generates ApplicationData in-memory from validated files without writing to disk.
 *
 * Lightweight pipeline for scenarios that only need the data (e.g., PDF generation):
 * 1. Transforms validated files to ApplicationData object
 * 2. Validates the complete ApplicationData against Zod schema
 *
 * @param {FileToValidateWithYamlData[]} files - Validated YAML files with extracted data
 * @returns {Result<ApplicationData>} Result containing validated ApplicationData
 */
export const generateApplicationDataInMemory = (
  files: FileToValidateWithYamlData[],
): Result<ApplicationData> => {
  return chainPipe(files, transformToApplicationData, validateApplicationDataSchema);
};

/**
 * Generates ApplicationData TypeScript module from validated files using a pure functional pipeline.
 *
 * Orchestrates the complete data generation flow:
 * 1. Transforms validated files to ApplicationData object
 * 2. Validates the complete ApplicationData against Zod schema
 * 3. Generates TypeScript module content
 * 4. Writes module to disk at configured path
 *
 * Returns the original files unchanged for pipeline continuation.
 *
 * @param {string} companyName - Name of the company for module comments and metadata
 * @param {FileToValidateWithYamlData[]} files - Validated YAML files with extracted data
 * @returns {Result<FileToValidateWithYamlData[]>} Result containing the same files for pipeline continuation
 */
export const generateApplicationData = (
  companyName: string,
  files: FileToValidateWithYamlData[],
): Result<FileToValidateWithYamlData[]> => {
  return pipe(
    chainPipe(
      files,
      transformToApplicationData,
      validateApplicationDataSchema,
      generateTypeScriptContent(companyName),
      writeTypeScriptModule,
    ),
    (result) =>
      chain(result, () => ({
        success: true as const,
        data: files,
      })),
  );
};
