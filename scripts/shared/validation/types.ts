import type { z } from 'zod';
import type { CompanyFileValue } from '@shared/core/config';

// ============================================================================
// Core Result Types
// ============================================================================

/**
 * Generic error result with optional details
 */
export interface ErrorResult {
  success: false;
  error: string;
  details?: string;
  originalError?: unknown;
  filePath?: string;
}

/**
 * Generic success result
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
}

/**
 * Result type for functional error handling
 */
export type Result<
  T,
  E = { error: string; details?: string; originalError?: unknown; filePath?: string },
> = { success: true; data: T } | ({ success: false } & E);

// ============================================================================
// File Validation Types
// ============================================================================

/**
 * File metadata for validation, including schema and optional wrapper extraction
 */
export interface FileToValidate {
  /** YAML filename (e.g., 'metadata.yaml') */
  fileName: CompanyFileValue;
  /** Absolute path to the YAML file */
  path: string;
  /** Zod schema to validate the file data against */
  type: z.ZodSchema<unknown>;
  /** Key to extract nested data from YAML wrapper, or null if file is not wrapped */
  wrapperKey: string | null;
}

/**
 * File metadata with loaded YAML data ready for validation
 */
export type FileToValidateWithYamlData = FileToValidate & { data: unknown };

/**
 * Configuration for YAML files and schemas watched by the tailor server
 */
export type YamlFilesAndSchemasToWatch = Pick<
  FileToValidate,
  'fileName' | 'type' | 'wrapperKey'
> & { key: keyof typeof import('@shared/core/config').COMPANY_FILES };

// ============================================================================
// Pipeline-Specific Success Types
// ============================================================================

/**
 * Success result for tailor context setup
 */
export type SetContextSuccess = SuccessResult<{
  company: string;
  path: string;
  availableFiles: string[];
  position: string;
  primaryFocus: string;
  timestamp: string;
}>;

/**
 * Success result for PDF generation
 */
export type PdfGenerationSuccess = SuccessResult<{ files: readonly string[]; theme: string }>;

// ============================================================================
// Pipeline Result Types
// ============================================================================

/**
 * Result type for tailor context setup operations
 */
export type SetContextResult = SetContextSuccess | ErrorResult;

/**
 * Result type for PDF generation operations
 */
export type PdfGenerationResult = PdfGenerationSuccess | ErrorResult;

// ============================================================================
// Validation-Only Pipeline Types
// ============================================================================

/**
 * Validation type options for validation-only pipeline
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
export interface ResolvedPath {
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

/**
 * Result type for validation-only operations
 */
export type ValidationOnlyResult =
  | ValidationOnlySuccess
  | Extract<Result<unknown>, { success: false }>;
