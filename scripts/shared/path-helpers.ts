import { COMPANY_FILES, PATHS, PATTERNS } from './config';

/**
 * Utility functions for path manipulation and validation
 */
export const PathHelpers = {
  /**
   * Get project root directory (absolute path)
   * @example getProjectRoot() → '/Users/javi/Develop/cc-resume-manager'
   */
  getProjectRoot: (): string => {
    return PATHS.PROJECT_ROOT;
  },

  /**
   * Get full path to company folder
   * @example getCompanyPath('tech-corp') → 'resume-data/tailor/tech-corp'
   */
  getCompanyPath: (companyName: string): string => {
    return `${PATHS.TAILOR_BASE}/${companyName}`;
  },

  /**
   * Get path to specific company file
   * @example getCompanyFile('tech-corp', 'METADATA') → 'resume-data/tailor/tech-corp/metadata.yaml'
   */
  getCompanyFile: (companyName: string, fileName: keyof typeof COMPANY_FILES): string => {
    return `${PATHS.TAILOR_BASE}/${companyName}/${COMPANY_FILES[fileName]}`;
  },

  /**
   * Extract company name from file path
   * @example extractCompany('tech-corp/metadata.yaml') → 'tech-corp'
   * @example extractCompany('invalid') → null
   */
  extractCompany: (filePath: string): string | null => {
    const match = filePath.match(PATTERNS.COMPANY_FROM_PATH);
    return match?.[1] ?? null;
  },

  /**
   * Validate company name format
   * Company names must be lowercase, alphanumeric with hyphens only
   * @example isValidCompanyName('tech-corp') → true
   * @example isValidCompanyName('Tech Corp') → false
   */
  isValidCompanyName: (name: string): boolean => {
    return PATTERNS.VALID_COMPANY_NAME.test(name);
  },

  /**
   * Normalize company name to standard format
   * Converts to lowercase and replaces spaces with hyphens
   * @example normalizeCompanyName('Tech Corp') → 'tech-corp'
   * @example normalizeCompanyName('ACME Inc.') → 'acme-inc.'
   */
  normalizeCompanyName: (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-');
  },

  /**
   * Build expected folder path for a company
   * Used for validation in schemas
   * @example getExpectedPath('Tech Corp') → 'resume-data/tailor/tech-corp'
   */
  getExpectedPath: (companyName: string): string => {
    return `${PATHS.TAILOR_BASE}/${PathHelpers.normalizeCompanyName(companyName)}`;
  },
} as const;
