import { pipe } from 'remeda';
import type {
  ValidationType,
  PathResolutionInput,
  ResolvedPath,
  ValidationOnlySuccess,
  ValidationOnlyResult,
  YamlFilesAndSchemasToWatch,
  Result,
} from './types';
import { validateYamlFilesAgainstSchemasPipeline } from './yaml-validation';
import { resolveAndValidatePath } from './path-resolution';
import { TAILOR_YAML_FILES_AND_SCHEMAS, COMPANY_FILES } from '@shared/core/config';
import { chain, tryCatch } from '@shared/core/functional-utils';

// ============================================================================
// Schema Selection
// ============================================================================

/**
 * Validation type to schema configuration mapping
 */
const VALIDATION_TYPE_MAP: Record<ValidationType, YamlFilesAndSchemasToWatch[]> = {
  all: TAILOR_YAML_FILES_AND_SCHEMAS,
  metadata: TAILOR_YAML_FILES_AND_SCHEMAS.filter((s) => s.key === 'METADATA'),
  resume: TAILOR_YAML_FILES_AND_SCHEMAS.filter((s) => s.key === 'RESUME'),
  'job-analysis': TAILOR_YAML_FILES_AND_SCHEMAS.filter((s) => s.key === 'JOB_ANALYSIS'),
  'cover-letter': TAILOR_YAML_FILES_AND_SCHEMAS.filter((s) => s.key === 'COVER_LETTER'),
};

/**
 * Display names for file types
 */
const FILE_DISPLAY_NAMES: Record<keyof typeof COMPANY_FILES, string> = {
  METADATA: 'Metadata',
  RESUME: 'Resume',
  JOB_ANALYSIS: 'Job analysis',
  COVER_LETTER: 'Cover letter',
};

// ============================================================================
// Schema Selection Pipeline Step
// ============================================================================

/**
 * Selects schema configurations based on validation type.
 *
 * Filters schema array by validation type: 'all' returns all, others filter by key.
 * Validates selected schemas are not empty.
 *
 * @param {ValidationType} type - Validation type to filter by ('all', 'metadata', 'resume', 'job-analysis', 'cover-letter')
 * @returns {Result<YamlFilesAndSchemasToWatch[]>} Filtered schema configurations or error if type invalid
 */
const selectSchemasForValidationType = (
  type: ValidationType,
): Result<YamlFilesAndSchemasToWatch[]> => {
  return tryCatch(() => {
    const schemas = VALIDATION_TYPE_MAP[type];

    if (!schemas || schemas.length === 0) {
      throw new Error(`Invalid validation type: ${type}`);
    }

    return schemas;
  }, 'Schema selection failed');
};

// ============================================================================
// Result Formatting
// ============================================================================

/**
 * Formats validation result into success response data.
 *
 * Maps fileName to displayName for each validated file using COMPANY_FILES lookup.
 * Returns final success data structure (not wrapped in Result).
 *
 * @param {ResolvedPath} resolved - Resolved path information
 * @param {Array<{ fileName: string }>} validatedFiles - Successfully validated files with YAML data
 * @returns {ValidationOnlySuccess['data']} Formatted success data with path, files, and display names
 */
const formatValidationSuccess = (
  resolved: ResolvedPath,
  validatedFiles: Array<{ fileName: string }>,
): ValidationOnlySuccess['data'] => {
  return {
    path: resolved.path,
    validatedFiles: validatedFiles.map((file) => {
      // Find the key for this filename
      const fileKey = Object.keys(COMPANY_FILES).find(
        (key) => COMPANY_FILES[key as keyof typeof COMPANY_FILES] === file.fileName,
      ) as keyof typeof COMPANY_FILES | undefined;

      return {
        fileName: file.fileName,
        displayName: fileKey ? FILE_DISPLAY_NAMES[fileKey] : file.fileName,
      };
    }),
  };
};

// ============================================================================
// Main Validation Pipeline
// ============================================================================

/**
 * Executes validation-only pipeline for tailor files using functional composition.
 *
 * Pipeline flow:
 * 1. Resolve and validate path from -C or -P option
 * 2. Select schemas based on validation type
 * 3. Validate YAML files against schemas
 * 4. Format success result
 *
 * @param pathInput - Path resolution input
 * @param validationType - Type of validation to perform
 * @returns ValidationOnlyResult with validated files or error
 *
 * @example
 * ```ts
 * validateTailorFilesPipeline(
 *   { companyName: 'acme-corp' },
 *   'all'
 * )
 * ```
 */
export const validateTailorFilesPipeline = (
  pathInput: PathResolutionInput,
  validationType: ValidationType,
): ValidationOnlyResult => {
  return pipe(
    // Step 1: Resolve and validate path
    resolveAndValidatePath(pathInput),

    // Step 2: Select schemas and validate files
    (pathResult) =>
      chain(pathResult, (resolved) =>
        pipe(
          selectSchemasForValidationType(validationType),
          (schemaResult) =>
            chain(schemaResult, (schemas) =>
              // Step 3: Run validation pipeline
              validateYamlFilesAgainstSchemasPipeline(resolved.companyName, schemas),
            ),
          // Step 4: Format success result
          (validationResult) =>
            chain(validationResult, (validatedFiles) =>
              tryCatch(
                () => formatValidationSuccess(resolved, validatedFiles),
                'Result formatting failed',
              ),
            ),
        ),
      ),
  );
};
