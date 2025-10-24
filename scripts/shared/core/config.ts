import path from 'path';
import { CoverLetterSchema, JobAnalysisSchema, MetadataSchema, ResumeSchema } from '@/zod/schemas';
import type { YamlFilesAndSchemasToWatch } from '@shared/validation/validation-pipeline';

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
 * Relative path from config.ts location to project root
 *
 * Directory structure:
 * - config.ts is at: scripts/shared/core/
 * - project root is at: ./
 *
 * Path traversal: scripts/shared/core -> scripts/shared -> scripts -> ./
 * Therefore we need to go up 3 directory levels
 */
const PROJECT_ROOT_RELATIVE_PATH = '../../..' as const;

/**
 * Core directory paths used throughout the application
 */
export const PATHS = {
  /** Project root directory (absolute path from scripts/shared/core/) */
  PROJECT_ROOT: path.join(import.meta.dir, PROJECT_ROOT_RELATIVE_PATH),

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
// List of supported YAML and Zod Schemas on tailor server
// ============================================================================
export const TAILOR_YAML_FILES_AND_SCHEMAS: Array<YamlFilesAndSchemasToWatch> = [
  {
    key: 'METADATA',
    fileName: COMPANY_FILES.METADATA,
    type: MetadataSchema,
    wrapperKey: null,
  },
  {
    key: 'JOB_ANALYSIS',
    fileName: COMPANY_FILES.JOB_ANALYSIS,
    type: JobAnalysisSchema,
    wrapperKey: 'job_analysis',
  },
  {
    key: 'RESUME',
    fileName: COMPANY_FILES.RESUME,
    type: ResumeSchema,
    wrapperKey: 'resume',
  },
  {
    key: 'COVER_LETTER',
    fileName: COMPANY_FILES.COVER_LETTER,
    type: CoverLetterSchema,
    wrapperKey: 'cover_letter',
  },
];

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
 * Compact mode configuration for tailor-server
 * When enabled, reduces log output to minimal essential information
 */
export const COMPACT_MODE = {
  /** Enable compact logging mode (minimal output) */
  ENABLED: (process.env.TAILOR_SERVER_COMPACT_LOGS || '').toLowerCase() === 'true',
} as const;

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type-safe exports for TypeScript consumers
 */
export type CompanyFileName = keyof typeof COMPANY_FILES;
export type CompanyFileValue = (typeof COMPANY_FILES)[keyof typeof COMPANY_FILES];
export type ScriptName = (typeof SCRIPTS)[keyof typeof SCRIPTS];
export type PathName = (typeof PATHS)[keyof typeof PATHS];
export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];
