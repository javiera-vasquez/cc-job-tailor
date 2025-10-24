import { pipe } from 'remeda';
import { existsSync } from 'fs';
import type { Result, YamlFilesAndSchemasToWatch } from './validation-pipeline';
import { validateYamlFilesAgainstSchemasPipeline } from './validation-pipeline';
import { TAILOR_YAML_FILES_AND_SCHEMAS, COMPANY_FILES } from '@shared/core/config';
import { PathHelpers } from '@shared/core/path-helpers';
import { chain, tryCatch } from '@shared/core/functional-utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Validation type options
 */
export type ValidationType = 'all' | 'metadata' | 'resume' | 'job-analysis' | 'cover-letter';

/**
 * Path resolution input from CLI args
 */
export interface PathResolutionInput {
  companyName?: string;
  customPath?: string;
}

/**
 * Resolved path with metadata
 */
interface ResolvedPath {
  path: string;
  companyName: string; // Either from -C flag or extracted from path
}

/**
 * Success result for validation-only pipeline
 */
export interface ValidationOnlySuccess {
  success: true;
  data: {
    path: string;
    validatedFiles: Array<{
      fileName: string;
      displayName: string;
    }>;
  };
}

export type ValidationOnlyResult =
  | ValidationOnlySuccess
  | Extract<Result<unknown>, { success: false }>;

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
// Path Resolution Pipeline Steps
// ============================================================================

/**
 * Validates that exactly one of companyName or customPath is provided.
 *
 * Ensures -C and -P flags are mutually exclusive (XOR logic).
 * Returns error if both, neither, or conflicts are detected.
 *
 * @param {PathResolutionInput} input - Path resolution input from CLI
 * @returns {Result<PathResolutionInput>} Input if valid, or error describing the conflict
 */
const validateMutuallyExclusiveOptions = (
  input: PathResolutionInput,
): Result<PathResolutionInput> => {
  return tryCatch(() => {
    const { companyName, customPath } = input;

    if (!companyName && !customPath) {
      throw new Error('Either -C (company name) or -P (path) must be provided');
    }

    if (companyName && customPath) {
      throw new Error('Cannot use both -C and -P options together');
    }

    return input;
  }, 'Path option validation failed');
};

/**
 * Resolves path string from company name or custom path.
 *
 * If companyName provided, builds path using getCompanyPath helper.
 * If customPath provided, extracts company name from last directory segment.
 *
 * @param {PathResolutionInput} input - Validated path resolution input
 * @returns {Result<ResolvedPath>} Resolved path and company name, or resolution error
 */
const resolvePathString = (input: PathResolutionInput): Result<ResolvedPath> => {
  return tryCatch(() => {
    const { companyName, customPath } = input;

    if (companyName) {
      return {
        path: PathHelpers.getCompanyPath(companyName),
        companyName,
      };
    }

    // Custom path: extract company name from last directory
    const normalizedPath = customPath!.replace(/\/$/, ''); // Remove trailing slash
    const extractedCompany = normalizedPath.split('/').pop() || 'unknown';

    return {
      path: normalizedPath,
      companyName: extractedCompany,
    };
  }, 'Path resolution failed');
};

/**
 * Validates that the resolved path exists on filesystem.
 *
 * Uses existsSync to check for directory presence. Returns error if path not found.
 *
 * @param {ResolvedPath} resolved - Resolved path object with path and company name
 * @returns {Result<ResolvedPath>} Resolved path if exists, error with helpful message if not
 */
const validatePathExists = (resolved: ResolvedPath): Result<ResolvedPath> => {
  return existsSync(resolved.path)
    ? { success: true, data: resolved }
    : {
        success: false,
        error: `Path does not exist: ${resolved.path}`,
        details: 'Ensure the company folder or custom path exists',
      };
};

/**
 * Complete path resolution pipeline using functional composition.
 *
 * Pipeline flow (with short-circuit on error):
 * 1. Validate mutually exclusive options (-C xor -P)
 * 2. Resolve path string from option
 * 3. Validate path exists on filesystem
 *
 * @param {PathResolutionInput} input - Path resolution input from CLI
 * @returns {Result<ResolvedPath>} Resolved path and company name, or first error encountered
 */
const resolveAndValidatePath = (input: PathResolutionInput): Result<ResolvedPath> => {
  return pipe(
    validateMutuallyExclusiveOptions(input),
    (r) => chain(r, resolvePathString),
    (r) => chain(r, validatePathExists),
  );
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
