import type { z } from 'zod';
import type { CompanyFileValue } from './config';

// Result type for functional error handling
export type Result<
  T,
  E = { error: string; details?: string; originalError?: unknown; filePath?: string },
> = { success: true; data: T } | ({ success: false } & E);

export interface FileToValidate {
  fileName: CompanyFileValue;
  path: string;
  type: z.ZodSchema<unknown>;
  wrapperKey: string | null; // Key to extract nested data from YAML (e.g., 'job_analysis', 'resume'), or null if no wrapper
}

export type FileToValidateWithYamlData = FileToValidate & { data: unknown };

export interface SetContextSuccess {
  success: true;
  data: {
    company: string;
    path: string;
    availableFiles: string[];
    position: string;
    primaryFocus: string;
    timestamp: string;
  };
}

export interface SetContextError {
  success: false;
  error: string;
  details?: string;
  originalError?: unknown;
  filePath?: string;
}

export type SetContextResult = SetContextSuccess | SetContextError;

/**
 * Formats Zod validation error into human-readable string.
 *
 * Converts Zod error issues into formatted list with field paths and messages.
 *
 * @param {z.ZodError} error - Zod validation error
 * @returns {string} Formatted error string with one issue per line
 */
export const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((i) => `  - ${i.path.length > 0 ? i.path.join('.') : 'root'}: ${i.message}`)
    .join('\n');
