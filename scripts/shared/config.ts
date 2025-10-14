/**
 * Centralized configuration for tailor system
 *
 * This is the single source of truth for all paths, script names,
 * file patterns, and constants used across the tailor toolchain.
 *
 * Benefits:
 * - Change paths in one place
 * - Type-safe configuration with TypeScript
 * - Consistent behavior across all scripts
 * - Easy to mock for testing
 * - Support for environment-specific overrides
 */

// ============================================================================
// Directory Paths
// ============================================================================

/**
 * Core directory paths used throughout the application
 */
export const PATHS = {
  /** Base directory for company-specific tailor data */
  TAILOR_BASE: 'resume-data/tailor',

  /** Source YAML files (not company-specific) */
  SOURCES: 'resume-data/sources',

  /** Claude Code context file for active company */
  CONTEXT_FILE: '.claude/tailor-context.yaml',

  /** Generated TypeScript data module */
  GENERATED_DATA: 'src/data/application.ts',

  /** Temporary directory for generated PDFs */
  TEMP_PDF: 'tmp',
} as const;

// ============================================================================
// Company Folder Structure
// ============================================================================

/**
 * Standard file names expected in each company folder
 */
export const COMPANY_FILES = {
  METADATA: 'metadata.yaml',
  RESUME: 'resume.yaml',
  JOB_ANALYSIS: 'job_analysis.yaml',
  COVER_LETTER: 'cover_letter.yaml',
} as const;

// ============================================================================
// Script Names
// ============================================================================

/**
 * Script names used for spawning child processes
 * These correspond to package.json scripts
 */
export const SCRIPTS = {
  GENERATE_DATA: 'generate-data',
  DEV_VITE: 'dev:vite',
  SET_ENV: 'set-env',
  SAVE_PDF: 'save-to-pdf',
  PRETTIER: 'prettier',
} as const;

// ============================================================================
// Document Types
// ============================================================================

/**
 * Valid document types for PDF generation
 */
export const DOCUMENT_TYPES = {
  RESUME: 'resume',
  COVER_LETTER: 'cover-letter',
  BOTH: 'both',
} as const;

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values used across the system
 */
export const DEFAULTS = {
  /** Default document type for PDF generation */
  DOCUMENT_TYPE: 'both' as const,

  /** Default template/theme name */
  TEMPLATE: 'modern' as const,
} as const;

// ============================================================================
// File Patterns and Regex
// ============================================================================

/**
 * Regular expressions and patterns for file matching and validation
 */
export const PATTERNS = {
  /** Match .yaml or .yml files */
  YAML: /\.ya?ml$/i,

  /** Extract company name from path: company-name/file.yaml */
  COMPANY_FROM_PATH: /^([^/\\]+)[/\\]/,

  /** Valid company name format: lowercase, alphanumeric, hyphens only */
  VALID_COMPANY_NAME: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// ============================================================================
// Timing and Performance
// ============================================================================

/**
 * Timeouts and timing-related configuration
 */
export const TIMEOUTS = {
  /** Debounce period for file watching (ms) - set to 0 to disable */
  FILE_WATCH_DEBOUNCE: parseInt(process.env.FILE_WATCH_DEBOUNCE_MS || '300', 10),

  /** Cooldown before process restart (ms) */
  PROCESS_RESTART_COOLDOWN: 5000,

  /** Maximum time for data generation (ms) */
  GENERATE_DATA_TIMEOUT: 30000,
} as const;

// ============================================================================
// Process Management Limits
// ============================================================================

/**
 * Limits for process management and recovery
 */
export const LIMITS = {
  /** Maximum automatic restart attempts */
  MAX_RESTART_ATTEMPTS: 3,

  /** Maximum pending file changes before batch processing */
  MAX_PENDING_CHANGES: 10,
} as const;

// ============================================================================
// Logging Configuration
// ============================================================================

/**
 * Helper function to parse boolean environment variables
 */
const parseBoolean = (value?: string, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Compact mode configuration for tailor-server
 * When enabled, reduces log output to minimal essential information
 */
export const COMPACT_MODE = {
  /** Enable compact logging mode (minimal output) */
  ENABLED: parseBoolean(process.env.TAILOR_SERVER_COMPACT_LOGS, false),
} as const;

// ============================================================================
// Path Helper Functions
// ============================================================================

/**
 * Utility functions for path manipulation and validation
 */
export const PathHelpers = {
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

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type-safe exports for TypeScript consumers
 */
export type CompanyFileName = keyof typeof COMPANY_FILES;
export type ScriptName = (typeof SCRIPTS)[keyof typeof SCRIPTS];
export type PathName = (typeof PATHS)[keyof typeof PATHS];
export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

// ============================================================================
// Environment-Specific Overrides (Future Enhancement)
// ============================================================================

/**
 * Environment variable configuration
 * Can be used to override defaults based on NODE_ENV
 */
export const getEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  // Base configuration (current values)
  const baseConfig = {
    PATHS,
    COMPANY_FILES,
    SCRIPTS,
    DOCUMENT_TYPES,
    DEFAULTS,
    PATTERNS,
    TIMEOUTS,
    LIMITS,
  };

  // Environment-specific overrides
  const envOverrides: Record<string, Partial<typeof baseConfig>> = {
    test: {
      // Test environment could use different paths
      // PATHS: {
      //   ...PATHS,
      //   TAILOR_BASE: 'test/fixtures/tailor',
      //   CONTEXT_FILE: '.test/tailor-context.yaml',
      // },
    },
    production: {
      // Production environment overrides
    },
  };

  return {
    ...baseConfig,
    ...envOverrides[env],
  };
};
