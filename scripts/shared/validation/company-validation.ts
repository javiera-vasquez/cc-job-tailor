import { existsSync, readdirSync } from 'fs';
import type { Result, FileToValidate } from './validation-pipeline';
import { PATHS } from '@shared/core/config';

/**
 * Gets list of available company directories in the tailor base path.
 *
 * Reads directory contents and filters for directories only.
 * Returns empty array gracefully if path doesn't exist or on read error.
 *
 * @param {string} base - Base path containing company directories
 * @returns {string[]} Array of company directory names (empty array if path missing or error)
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
 * Returns error with list of available companies if path is not found.
 *
 * @param {string} companyPath - Absolute path to the company folder
 * @returns {Result<void>} Success if directory exists, error with available companies if not found
 * @example
 * validateCompanyPath('/path/to/resume-data/tailor/acme-corp')
 * → { success: true, data: undefined }
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
 * Returns detailed error message listing missing files if any not found.
 *
 * @param {FileToValidate[]} pathsToValidate - Array of file metadata with paths to validate
 * @returns {Result<FileToValidate[]>} Files array if all exist, error with missing file list otherwise
 * @example
 * validateFilePathsExists([
 *   { fileName: 'metadata.yaml', path: '/path/to/metadata.yaml', type: MetadataSchema, wrapperKey: null }
 * ])
 * → { success: true, data: [...] }
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
