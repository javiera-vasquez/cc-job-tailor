import type { z } from 'zod';
import { pipe } from 'remeda';
import { COMPANY_FILES, PATHS, type CompanyFileValue } from '@shared/core/config';
import { PathHelpers } from '@shared/core/path-helpers';
import { validateCompanyPath, validateFilePathsExists } from './company-validation';
import { loadYamlFilesFromPath, validateYamlFileAgainstZodSchema } from './yaml-operations';
import { chain, chainPipe } from '@shared/core/functional-utils';

import { generateApplicationData } from '@shared/data/data-generation';
import { extractMetadata, generateAndWriteTailorContext } from '@shared/data/context-operations';

// Result type for functional error handling
export type Result<
  T,
  E = { error: string; details?: string; originalError?: unknown; filePath?: string },
> = { success: true; data: T } | ({ success: false } & E);

/**
 * File metadata for validation, including schema and optional wrapper extraction
 */
export interface FileToValidate {
  /** YAML filename (e.g., 'metadata.yaml') */
  fileName: CompanyFileValue;
  /** Absolute path to the YAML file */
  path: string;
  /** Zod schema to validate the file data against */
  type: z.ZodSchema<unknown>;
  /** Key to extract nested data from YAML wrapper, or null if file is not wrapped */
  wrapperKey: string | null;
}

/** File metadata with loaded YAML data ready for validation */
export type FileToValidateWithYamlData = FileToValidate & { data: unknown };

/** Configuration for YAML files and schemas watched by the tailor server */
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
 * Pipeline flow (with short-circuit on error):
 * 1. Validates company directory exists
 * 2. Validates all required files exist
 * 3. Loads YAML files with wrapper extraction
 * 4. Validates YAML data against Zod schemas
 * 5. Generates TypeScript application data module
 * 6. Extracts metadata from validated files
 * 7. Generates and writes tailor-context.yaml
 *
 * @param {string} environmentName - Company name for context setup
 * @param {YamlFilesAndSchemasToWatch[]} yamlDocumentsToValidate - Files and schemas to validate
 * @returns {SetContextResult} Success with context metadata or error with details
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

/**
 * Validates YAML files against their associated Zod schemas using functional pipeline.
 *
 * Pipeline flow:
 * 1. Build file metadata with resolved paths
 * 2. Validate all file paths exist on filesystem
 * 3. Load YAML files with wrapper extraction
 * 4. Validate loaded data against Zod schemas
 *
 * @param {string} companyName - Company name for path resolution
 * @param {YamlFilesAndSchemasToWatch[]} filesAndSchemas - Files and schemas to validate
 * @returns {Result<FileToValidateWithYamlData[]>} Validated files or first error encountered
 */
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
 * Formats Zod validation error into human-readable multi-line string.
 *
 * Converts each Zod issue into a line with field path and error message.
 * Root-level errors display as 'root' instead of empty path.
 *
 * @param {z.ZodError} error - Zod validation error with issues array
 * @returns {string} Multi-line formatted error string (one issue per line with "  - " prefix)
 * @example
 * formatZodError(zodError)
 * // Returns: "  - name: Required\n  - age: Expected number"
 */
export const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((i) => `  - ${i.path.length > 0 ? i.path.join('.') : 'root'}: ${i.message}`)
    .join('\n');
