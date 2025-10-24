import type { z } from 'zod';
import { pipe } from 'remeda';
import { COMPANY_FILES, PATHS, type CompanyFileValue } from './config';
import { PathHelpers } from './path-helpers';
import { validateCompanyPath, validateFilePathsExists } from './company-validation';
import { loadYamlFilesFromPath, validateYamlFileAgainstZodSchema } from './yaml-operations';
import { chain, chainPipe } from './functional-utils';

import { generateApplicationData } from './data-generation';
import { extractMetadata, generateAndWriteTailorContext } from './context-operations';

// Result type for functional error handling
export type Result<
  T,
  E = { error: string; details?: string; originalError?: unknown; filePath?: string },
> = { success: true; data: T } | ({ success: false } & E);

export interface FileToValidate {
  fileName: CompanyFileValue;
  path: string;
  type: z.ZodSchema<unknown>;
  wrapperKey: string | null; // Key to extract nested data from YAML (e.g., 'job_analysis', 'resume'), or null if no wrapper
}

export type FileToValidateWithYamlData = FileToValidate & { data: unknown };
export type YamlFilesAndSchemasToWatch = Pick<
  FileToValidate,
  'fileName' | 'type' | 'wrapperKey'
> & { key: keyof typeof COMPANY_FILES };

/**
 * Generic success result type used across all pipelines
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
}

/**
 * Generic error result type used across all pipelines
 */
export interface ErrorResult {
  success: false;
  error: string;
  details?: string;
  originalError?: unknown;
  filePath?: string;
}

export type SetContextSuccess = SuccessResult<{
  company: string;
  path: string;
  availableFiles: string[];
  position: string;
  primaryFocus: string;
  timestamp: string;
}>;

export type PdfGenerationSuccess = SuccessResult<{ files: readonly string[]; theme: string }>;

export type SetContextResult = SetContextSuccess | ErrorResult;
export type PdfGenerationResult = PdfGenerationSuccess | ErrorResult;

/**
 * Executes the complete tailor context setup pipeline using functional composition.
 *
 * Pipeline flow:
 * 1. Validates company directory exists
 * 2. Validates all required files exist
 * 3. Loads YAML files with wrapper extraction
 * 4. Validates YAML data against Zod schemas
 * 5. Generates TypeScript application data module
 * 6. Extracts metadata from validated files
 * 7. Generates and writes tailor-context.yaml
 *
 * @returns {void} Exits process with code 0 on success, 1 on failure
 */
export const validateAndSetTailorEnvPipeline = (
  environmentName: string,
  yamlDocumentsToValidate: YamlFilesAndSchemasToWatch[],
): SetContextResult => {
  return pipe(
    validateCompanyPath(PathHelpers.getCompanyPath(environmentName)),
    (r) =>
      chain(r, () =>
        validateYamlFilesAgainstSchemasPipeline(environmentName, yamlDocumentsToValidate),
      ),
    (r) =>
      chain(r, (yamlFiles) =>
        chainPipe(
          yamlFiles,
          (files) => generateApplicationData(environmentName, files),
          (files) => extractMetadata(files, COMPANY_FILES.METADATA),
          (metadata) =>
            generateAndWriteTailorContext(environmentName, metadata, PATHS.CONTEXT_FILE),
        ),
      ),
  );
};

export const validateYamlFilesAgainstSchemasPipeline = (
  companyName: string,
  filesAndSchemas: YamlFilesAndSchemasToWatch[],
): Result<FileToValidateWithYamlData[]> =>
  chainPipe(
    filesAndSchemas.map(({ key, fileName, type, wrapperKey }) => ({
      fileName,
      path: PathHelpers.getCompanyFile(companyName, key),
      type,
      wrapperKey,
    })),
    validateFilePathsExists,
    loadYamlFilesFromPath,
    validateYamlFileAgainstZodSchema,
  );

/**
 * Formats Zod validation error into human-readable string.
 *
 * Converts Zod error issues into formatted list with field paths and messages.
 *
 * @param {z.ZodError} error - Zod validation error
 * @returns {string} Formatted error string with one issue per line
 */
export const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((i) => `  - ${i.path.length > 0 ? i.path.join('.') : 'root'}: ${i.message}`)
    .join('\n');
