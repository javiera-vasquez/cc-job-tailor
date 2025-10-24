import { COMPANY_FILES, PATHS, PATTERNS } from '@shared/core/config';

/**
 * Path manipulation utilities for company folders and files.
 * Handles path resolution, extraction, and validation.
 */
export const PathHelpers = {
  /**
   * Get absolute project root directory.
   * @returns {string} Absolute path to project root
   * @example getProjectRoot() → '/Users/javi/Develop/cc-resume-manager'
   */
  getProjectRoot: (): string => {
    return PATHS.PROJECT_ROOT;
  },

  /**
   * Get path to company folder.
   * @param {string} companyName - Company name (kebab-case)
   * @returns {string} Relative path to company folder
   * @example getCompanyPath('tech-corp') → 'resume-data/tailor/tech-corp'
   */
  getCompanyPath: (companyName: string): string => {
    return `${PATHS.TAILOR_BASE}/${companyName}`;
  },

  /**
   * Get path to specific company file.
   * @param {string} companyName - Company name (kebab-case)
   * @param {keyof typeof COMPANY_FILES} fileName - File type key
   * @returns {string} Relative path to company file
   * @example getCompanyFile('tech-corp', 'METADATA') → 'resume-data/tailor/tech-corp/metadata.yaml'
   */
  getCompanyFile: (companyName: string, fileName: keyof typeof COMPANY_FILES): string => {
    return `${PATHS.TAILOR_BASE}/${companyName}/${COMPANY_FILES[fileName]}`;
  },

  /**
   * Extract company name from file path.
   * @param {string} filePath - Path containing company folder
   * @returns {string | null} Company name if found, null if path format is invalid
   * @example extractCompany('tech-corp/metadata.yaml') → 'tech-corp'
   */
  extractCompany: (filePath: string): string | null => {
    const match = filePath.match(PATTERNS.COMPANY_FROM_PATH);
    return match?.[1] ?? null;
  },

  /**
   * Validate company name format (lowercase, alphanumeric, hyphens only).
   * @param {string} name - Company name to validate
   * @returns {boolean} True if valid format, false otherwise
   * @example isValidCompanyName('tech-corp') → true
   */
  isValidCompanyName: (name: string): boolean => {
    return PATTERNS.VALID_COMPANY_NAME.test(name);
  },

  /**
   * Normalize company name to standard format (lowercase, space→hyphen).
   * @param {string} name - Company name to normalize
   * @returns {string} Normalized name in kebab-case
   * @example normalizeCompanyName('Tech Corp') → 'tech-corp'
   */
  normalizeCompanyName: (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-');
  },

  /**
   * Build expected folder path for a company (normalized).
   * @param {string} companyName - Company name (any case)
   * @returns {string} Expected relative path with normalized company name
   * @example getExpectedPath('Tech Corp') → 'resume-data/tailor/tech-corp'
   */
  getExpectedPath: (companyName: string): string => {
    return `${PATHS.TAILOR_BASE}/${PathHelpers.normalizeCompanyName(companyName)}`;
  },
} as const;
