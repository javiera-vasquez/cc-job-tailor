import { existsSync, readdirSync } from 'fs';
import type { Result, FileToValidate } from './validation-pipeline';
import { PATHS } from '@shared/core/config';

/**
 * Gets list of available company directories in the tailor base path.
 *
 * @param {string} base - Base path containing company directories
 * @returns {string[]} Array of company directory names, or empty array if path doesn't exist or on error
 */
const getAvailableCompanies = (base: string): string[] => {
  if (!existsSync(base)) return [];
  try {
    return readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
};

/**
 * Validates that the company directory exists in the tailor base path.
 *
 * @param {string} companyPath - Absolute path to the company folder
 * @returns {Result<void>} Success if directory exists, error with available companies list if not
 *
 * @example
 * validateCompanyPath('/path/to/resume-data/tailor/acme-corp')
 * // => { success: true, data: undefined }
 */
export const validateCompanyPath = (companyPath: string): Result<void> => {
  return existsSync(companyPath)
    ? { success: true, data: void 0 }
    : {
        success: false,
        error: `Company folder not found: ${companyPath}`,
        details: `Available companies: ${getAvailableCompanies(PATHS.TAILOR_BASE).join(', ') || 'none'}`,
      };
};

/**
 * Validates that all required company files exist on the filesystem.
 *
 * Checks each file path and returns a detailed error message listing all missing files
 * if any are not found. Returns the original array on success for pipeline continuation.
 *
 * @param {FileToValidate[]} pathsToValidate - Array of file metadata with paths to validate
 * @returns {Result<FileToValidate[]>} Success with files array, or error with missing files details
 *
 * @example
 * validateFilePathsExists([
 *   { fileName: 'metadata.yaml', path: '/path/to/metadata.yaml', type: MetadataSchema, wrapperKey: null }
 * ])
 * // => { success: true, data: [...] }
 */
export const validateFilePathsExists = (
  pathsToValidate: FileToValidate[],
): Result<FileToValidate[]> => {
  const missingFiles = pathsToValidate.filter((item) => !existsSync(item.path));

  if (missingFiles.length > 0) {
    const expectedFiles = pathsToValidate.map((f) => f.fileName);
    const foundFiles = pathsToValidate.filter((f) => existsSync(f.path)).map((f) => f.fileName);
    const missingFileNames = missingFiles.map((f) => f.fileName);

    const errorLines = [
      `Missing ${missingFiles.length} required file(s):`,
      ...missingFileNames.map((name) => `  - ${name}`),
      `Expected files: ${expectedFiles.join(', ')}`,
      `Found files: ${foundFiles.length > 0 ? foundFiles.join(', ') : 'none'}`,
    ];

    return {
      success: false,
      error: errorLines[0] || 'Missing required files',
      details: errorLines.slice(1).join('\n'),
    };
  }

  return { success: true, data: pathsToValidate };
};
