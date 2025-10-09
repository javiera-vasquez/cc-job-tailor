/**
 * Centralized validation error handler
 *
 * Provides consistent error formatting and handling for Zod validation errors
 * across all scripts (generate-data, generate-pdf, tailor-server).
 *
 * Benefits:
 * - Single source of truth for error formatting
 * - No duplicate error logging
 * - Clean output without stack traces for user-fixable validation errors
 * - Context-aware behavior (exit vs continue)
 */

import { z } from 'zod';
import { loggers } from './logger';

export type ErrorContext = 'generate-data' | 'generate-pdf' | 'tailor-server';

export interface ValidationErrorOptions {
  /** Context/script where the error occurred */
  context: ErrorContext;

  /** Whether to exit the process after logging (default: true) */
  exitOnError?: boolean;

  /** Whether to show helpful hint for fixing errors (default: true) */
  showHelpHint?: boolean;
}

/**
 * Centralized handler for validation errors
 *
 * Formats Zod validation errors consistently and manages process exit.
 * This function should be used in all scripts that perform data validation.
 *
 * @param error - The error to handle (typically from validateApplicationData)
 * @param options - Configuration for error handling behavior
 *
 * @example
 * ```typescript
 * try {
 *   validateApplicationData(data);
 * } catch (error) {
 *   handleValidationError(error, {
 *     context: 'generate-data',
 *     exitOnError: true,
 *     showHelpHint: true,
 *   });
 * }
 * ```
 */
export function handleValidationError(error: unknown, options: ValidationErrorOptions): void {
  const { context, exitOnError = true, showHelpHint = true } = options;

  const logger = getLoggerForContext(context);

  // Check if it's a Zod validation error
  if (error instanceof z.ZodError || (error && typeof error === 'object' && 'issues' in error)) {
    const zodError = error as z.ZodError;

    logger.error('Application data validation failed:');
    zodError.issues.forEach((err) => {
      const path = err.path.join('.');
      const received = 'received' in err ? ` (received: ${err.received})` : '';
      logger.error(`  • ${path}: ${err.message}${received}`);
    });
  } else if (error instanceof Error) {
    // Handle other Error types (don't show stack trace for validation errors)
    logger.error(error.message);
  } else {
    // Unknown error type
    logger.error('An unexpected error occurred');
    console.error(error);
  }

  // Show help hint
  if (showHelpHint) {
    logger.info('💡 Fix the data issues in the tailor files and try again');
  }

  // Exit or return
  if (exitOnError) {
    process.exit(1);
  }
}

/**
 * Get appropriate logger for the context
 */
function getLoggerForContext(context: ErrorContext) {
  switch (context) {
    case 'generate-data':
      return loggers.generate;
    case 'generate-pdf':
      return loggers.pdf;
    case 'tailor-server':
      return loggers.server;
  }
}
