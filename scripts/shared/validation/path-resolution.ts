import { pipe } from 'remeda';
import { existsSync } from 'fs';
import type { Result, PathResolutionInput, ResolvedPath } from './types';
import { PathHelpers } from '@shared/core/path-helpers';
import { chain, tryCatch } from '@shared/core/functional-utils';

/**
 * Validates that exactly one of companyName or customPath is provided.
 *
 * Ensures -C and -P flags are mutually exclusive (XOR logic).
 * Returns error if both, neither, or conflicts are detected.
 *
 * @param {PathResolutionInput} input - Path resolution input from CLI
 * @returns {Result<PathResolutionInput>} Input if valid, or error describing the conflict
 */
export const validateMutuallyExclusiveOptions = (
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
export const resolvePathString = (input: PathResolutionInput): Result<ResolvedPath> => {
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
export const validatePathExists = (resolved: ResolvedPath): Result<ResolvedPath> => {
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
export const resolveAndValidatePath = (input: PathResolutionInput): Result<ResolvedPath> => {
  return pipe(
    validateMutuallyExclusiveOptions(input),
    (r) => chain(r, resolvePathString),
    (r) => chain(r, validatePathExists),
  );
};
