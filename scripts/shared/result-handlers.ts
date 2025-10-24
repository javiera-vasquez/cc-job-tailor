import { z } from 'zod';
import { match } from 'ts-pattern';
import type { Result } from './validation-pipeline';
import type { SetContextSuccess } from './validation-pipeline';
import type { ValidationOnlySuccess } from './validation-only-pipeline';
import type { Logger } from './logger';

/**
 * Options for configuring pipeline error handling behavior.
 */
interface ErrorHandlerOptions {
  /** Logger instance to use for output */
  logger: Logger;
  /** Whether to exit the process after logging (default: true) */
  shouldExit?: boolean;
  /** Use compact formatting for hot reload scenarios (default: false) */
  compactMode?: boolean;
  /** Filename to display in compact mode */
  displayFilename?: string;
  /** Operation duration to display in compact mode */
  duration?: string;
  /** Pipeline stage that failed (for compact mode) */
  stage?: 'Validation' | 'Generation';
}

/**
 * Options for configuring success handler behavior.
 */
interface SuccessHandlerOptions {
  /** Logger instance to use for output */
  logger: Logger;
  /** Whether to exit the process after logging (default: true) */
  shouldExit?: boolean;
  /** Use compact formatting (default: false) */
  withContextMode?: boolean;
  /** Additional context for compact mode (e.g., debounce delay) */
  additionalInfo?: string;
}

/**
 * Options for validation success handler
 */
interface ValidationSuccessOptions {
  logger: Logger;
  shouldExit?: boolean;
}

/**
 * Formats ZodError issues for display.
 *
 * Pure function that extracts and formats validation errors from a ZodError.
 * Returns structured error information for consistent display across handlers.
 *
 * @param {z.ZodError} zodError - Zod validation error
 * @param {string} [filePath] - Optional file path where error occurred
 * @returns {Array} Array of formatted error objects
 */
const formatZodErrorIssues = (
  zodError: z.ZodError,
  filePath?: string,
): Array<{ path: string; message: string; received?: string; filePath?: string }> => {
  return zodError.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    received: 'received' in err ? String(err.received) : undefined,
    filePath,
  }));
};

/**
 * Logs ZodError issues with consistent formatting.
 *
 * Displays each validation error with field path, message, and optional received value.
 * Includes file path context when available.
 *
 * @param {z.ZodError} zodError - Zod validation error
 * @param {Logger} logger - Logger instance
 * @param {string} [filePath] - Optional file path where error occurred
 */
const logZodErrorIssues = (zodError: z.ZodError, logger: Logger, filePath?: string): void => {
  const issues = formatZodErrorIssues(zodError, filePath);

  issues.forEach(({ path, message, received, filePath: fp }) => {
    const receivedStr = received ? ` (received: ${received})` : '';
    logger.error(`  • ${path}: ${message}${receivedStr}`);
    if (fp) logger.error(`    → in ${fp}`);
  });
};

/**
 * Logs generic error with details and file context.
 *
 * Displays error message, optional multi-line details, and file path when available.
 *
 * @param {Extract<Result<unknown>, { success: false }>} error - Failed result with error details
 * @param {Logger} logger - Logger instance
 */
const logGenericError = (
  error: Extract<Result<unknown>, { success: false }>,
  logger: Logger,
): void => {
  logger.error(error.error);

  if (error.details) {
    error.details.split('\n').forEach((line) => logger.error(`  ${line}`));
  }

  if ('filePath' in error && error.filePath) {
    logger.error(`    → in ${error.filePath}`);
  }
};

/**
 * Logs error in compact format for hot reload scenarios.
 *
 * Shows emoji indicator, filename, stage, and duration on first line,
 * followed by error message and optional details.
 *
 * @param {Extract<Result<unknown>, { success: false }>} error - Failed result with error details
 * @param {Logger} logger - Logger instance
 * @param {string} displayFilename - Filename for display
 * @param {string} duration - Operation duration
 * @param {'Validation' | 'Generation'} stage - Pipeline stage that failed
 */
const logCompactError = (
  error: Extract<Result<unknown>, { success: false }>,
  logger: Logger,
  displayFilename: string,
  duration: string,
  stage: 'Validation' | 'Generation',
): void => {
  logger.info(`❌ ${displayFilename} → ${stage} failed (${duration}s)`);
  logger.info(`${error.error}`);

  if (error.details) {
    logger.info(error.details);
  }
};

/**
 * Logs error in verbose format for startup scenarios.
 *
 * Provides specialized formatting for ZodError with detailed field information.
 * Falls back to generic error formatting for other error types.
 *
 * @param {Extract<Result<unknown>, { success: false }>} error - Failed result with error details
 * @param {Logger} logger - Logger instance
 * @param {string} headerMessage - Header message to display before errors
 */
const logVerboseError = (
  error: Extract<Result<unknown>, { success: false }>,
  logger: Logger,
  headerMessage: string,
): void => {
  match(error.originalError)
    .when(
      (err): err is z.ZodError => err instanceof z.ZodError,
      (zodError) => {
        logger.error(headerMessage);
        logZodErrorIssues(zodError, logger, 'filePath' in error ? error.filePath : undefined);
      },
    )
    .otherwise(() => {
      logGenericError(error, logger);
    });
};

/**
 * Logs success message in compact format.
 *
 * Shows emoji indicator, company name, and file count on first line,
 * with optional additional context (e.g., debounce settings).
 *
 * @param {SetContextSuccess['data']} data - Context setup success data
 * @param {Logger} logger - Logger instance
 * @param {boolean} isServerMode - Whether running in server mode
 * @param {string} [additionalInfo] - Additional context to display
 */
const oneLineContextLog = (
  data: SetContextSuccess['data'],
  logger: Logger,
  isServerMode: boolean,
  additionalInfo?: string,
): void => {
  const fileCount = data.availableFiles.length || 0;
  const extra = additionalInfo ? ` • ${additionalInfo}` : '';
  logger.success(
    `${isServerMode ? `Tailor server ready` : 'Tailor context created'} • ${data.company} • ${fileCount} file(s)${extra}`,
  );
};

/**
 * Logs success message in verbose format.
 *
 * Displays detailed context information including company, path,
 * position, focus area, and available files.
 *
 * @param {SetContextSuccess['data']} data - Context setup success data
 * @param {Logger} logger - Logger instance
 */
const provideTailorEnvLogs = (data: SetContextSuccess['data'], logger: Logger): void => {
  const filesList = data.availableFiles.join(', ') || 'none';

  logger.info(`Tailor context created • ${data.company}`);
  logger.info(`   -Path: ${data.path}`);
  logger.info(`   -Position: ${data.position || 'Not specified'}`);
  logger.info(`   -Focus: ${data.primaryFocus || 'Not specified'}`);
  logger.info(`   -Files: ${filesList}`);
};

/**
 * Unified pipeline error handler for consistent error formatting across the application.
 *
 * Handles both ZodError validation failures and generic errors with support for:
 * - Compact mode: Concise single-line format for hot reload scenarios
 * - Verbose mode: Detailed multi-line format for startup scenarios
 * - Optional process exit for startup errors
 * - Specialized ZodError formatting with field paths and received values
 *
 * @param {Extract<Result<unknown>, { success: false }>} error - Failed result from pipeline
 * @param {ErrorHandlerOptions} options - Configuration options
 * @returns {void}
 *
 * @example
 * // Startup validation error (exits process)
 * handlePipelineError(error, {
 *   logger: loggers.server,
 *   shouldExit: true,
 * });
 *
 * @example
 * // Hot reload error (keeps server running)
 * handlePipelineError(error, {
 *   logger: loggers.server,
 *   shouldExit: false,
 *   compactMode: true,
 *   displayFilename: 'resume.yaml',
 *   duration: '1.2',
 *   stage: 'Validation',
 * });
 */
export const handlePipelineError = (
  error: Extract<Result<unknown>, { success: false }>,
  options: ErrorHandlerOptions,
): void => {
  const {
    logger,
    shouldExit = true,
    compactMode = false,
    displayFilename = 'file',
    duration = '0',
    stage = 'Validation',
  } = options;

  // Log error based on mode
  match(compactMode)
    .with(true, () => {
      logCompactError(error, logger, displayFilename, duration, stage);
    })
    .with(false, () => {
      const headerMessage = shouldExit
        ? 'Validation failed - cannot start server'
        : 'Pipeline error occurred';
      logVerboseError(error, logger, headerMessage);
    })
    .exhaustive();

  // Show helpful tip
  logger.info('💡 Fix the errors above and save to retry');

  // Exit if requested
  if (shouldExit) {
    process.exit(1);
  } else {
    logger.info(''); // Add blank line for readability in watch mode
  }
};

/**
 * Unified success handler for consistent success formatting across the application.
 *
 * Handles context setup success with support for:
 * - Compact mode: Concise single-line format for server startup
 * - Verbose mode: Detailed multi-line format with all context information
 * - Optional process exit for CLI scripts
 * - Flexible logging for different use cases (server vs CLI)
 *
 * @param {SetContextSuccess['data']} data - Context setup success data
 * @param {SuccessHandlerOptions} options - Configuration options
 * @returns {void}
 *
 * @example
 * // CLI script (verbose, exits)
 * handlePipelineSuccess(data, {
 *   logger: loggers.setEnv,
 *   shouldExit: true,
 * });
 *
 * @example
 * // Server startup (compact, doesn't exit)
 * handlePipelineSuccess(data, {
 *   logger: loggers.server,
 *   shouldExit: false,
 *   withContextMode: true,
 *   additionalInfo: 'Debounce: 300ms',
 * });
 */
export const handlePipelineSuccess = (
  data: SetContextSuccess['data'],
  options: SuccessHandlerOptions,
): void => {
  const { logger, shouldExit = true, withContextMode = false, additionalInfo } = options;

  // Log success based on mode
  match(withContextMode)
    .with(true, () => {
      provideTailorEnvLogs(data, logger);
      oneLineContextLog(data, logger, withContextMode, additionalInfo);
    })
    .with(false, () => {
      oneLineContextLog(data, logger, withContextMode, additionalInfo);
    })
    .exhaustive();

  // Exit if requested (CLI mode)
  if (shouldExit) {
    process.exit(0);
  }
};

/**
 * Handles successful validation by logging validated files.
 *
 * @param data - Validation success data
 * @param options - Handler options
 */
export const handleValidationSuccess = (
  data: ValidationOnlySuccess['data'],
  options: ValidationSuccessOptions,
): void => {
  const { logger, shouldExit = true } = options;

  const fileList = data.validatedFiles.map((f) => f.displayName).join(', ');

  logger.success(`Validation passed • ${data.validatedFiles.length} file(s): ${fileList}`);
  logger.info(`Path: ${data.path}`);

  if (shouldExit) {
    process.exit(0);
  }
};
