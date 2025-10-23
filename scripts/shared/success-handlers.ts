import { match } from 'ts-pattern';
import type { SetContextSuccess } from './validation-pipeline';
import type { Logger } from './logger';

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
 * Logs success message in compact format.
 *
 * Shows emoji indicator, company name, and file count on first line,
 * with optional additional context (e.g., debounce settings).
 *
 * @param {SetContextSuccess['data']} data - Context setup success data
 * @param {Logger} logger - Logger instance
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
 * @param {boolean} isServerMode - Whether running in server mode
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
 * handleContextSuccess(data, {
 *   logger: loggers.setEnv,
 *   shouldExit: true,
 * });
 *
 * @example
 * // Server startup (compact, doesn't exit)
 * handleContextSuccess(data, {
 *   logger: loggers.server,
 *   shouldExit: false,
 *   compactMode: true,
 *   additionalInfo: 'Debounce: 300ms',
 * });
 */
export const handleContextSuccess = (
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
