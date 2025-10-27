import type { z } from 'zod';
import { PathHelpers } from '@shared/core/path-helpers';
import { validateFilePathsExists } from './company-validation';
import { loadYamlFilesFromPath, validateYamlFileAgainstZodSchema } from './yaml-operations';
import { chainPipe } from '@shared/core/functional-utils';

// Import centralized types
import type { Result, FileToValidateWithYamlData, YamlFilesAndSchemasToWatch } from './types';

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
