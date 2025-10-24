import { spawn, type ChildProcess } from 'child_process';
import { watch, type FSWatcher } from 'fs';
import { basename } from 'path';
import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import { generateApplicationData } from './shared/data-generation';
import { chain, tryCatch } from './shared/functional-utils';
import {
  validateAndSetTailorEnvPipeline,
  validateYamlFilesAgainstSchemasPipeline,
  type Result,
  type SetContextSuccess,
} from './shared/validation-pipeline';
import { parseCliArgs, validateRequiredArg } from './shared/cli-args';
import {
  PATTERNS,
  SCRIPTS,
  TIMEOUTS,
  COMPACT_MODE,
  TAILOR_YAML_FILES_AND_SCHEMAS,
} from './shared/config';
import { PathHelpers } from './shared/path-helpers';
import { loggers } from './shared/logger';
import { handlePipelineError, handlePipelineSuccess } from './shared/result-handlers';

/**
 * Enhanced dev server with tailor data watching
 * Usage: bun run tailor-server -C company-name
 *
 * This script provides:
 * - Type safety for file operations and process management
 * - Intelligent company-aware file watching
 * - Automatic data regeneration on YAML changes
 * - Integration with Bun's native hot reload
 */

const USAGE_MESSAGE = 'Usage: bun run tailor-server -C company-name';

// Parse and validate command-line arguments
const values = parseCliArgs(
  {
    options: {
      C: {
        type: 'string',
        short: 'C',
        required: true,
      },
    },
  },
  loggers.server,
  USAGE_MESSAGE,
);

const companyName = validateRequiredArg(values.C, 'Company name', loggers.server, USAGE_MESSAGE);

interface WatcherState {
  devServer: ChildProcess;
  fileWatcher?: FSWatcher;
  activeCompany: string;
  debounceTimer?: NodeJS.Timeout;
  currentFilename?: string | null;
}

/**
 * Enhanced dev server with tailor data watching
 */
class EnhancedDevServer {
  private state: WatcherState;
  private readonly compactMode = COMPACT_MODE.ENABLED;
  private readonly filesToWatch = TAILOR_YAML_FILES_AND_SCHEMAS;
  private readonly debounceDelay = TIMEOUTS.FILE_WATCH_DEBOUNCE;

  constructor(companyName: string) {
    this.state = {
      devServer: this.createDevServer(),
      activeCompany: companyName,
    };
  }

  /**
   * Create the main Vite dev server process
   */
  private createDevServer(): ChildProcess {
    const devServer = spawn('bun', ['run', SCRIPTS.DEV_VITE], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    // Consume output to prevent buffer overflow but don't log it
    devServer.stdout?.on('data', () => {});
    devServer.stderr?.on('data', () => {});

    devServer.on('exit', (code) => {
      loggers.server.warn(`Dev server exited with code ${code}`);
      process.exit(code || 0);
    });

    return devServer;
  }

  public start(): void {
    // Validate environment using functional pipeline
    const result = validateAndSetTailorEnvPipeline(this.state.activeCompany, this.filesToWatch);

    // Early exit for validation errors
    if (!result.success) {
      this.onValidationError(result.error, result.details, result.originalError, result.filePath);
      return;
    }

    // Initialize services with sequential side effects
    this.createFileWatcher(PathHelpers.getCompanyPath(this.state.activeCompany));
    this.setupShutdownHandlers();
    this.onServerReady(result.data);
  }

  private createFileWatcher(directoryPath: string): void {
    const result = tryCatch(() => {
      const handler = this.createFileChangeHandler(this.state.activeCompany);
      return watch(directoryPath, { recursive: true }, handler);
    }, 'Could not set up file watcher');

    match(result)
      .with({ success: true }, (r) => {
        this.state.fileWatcher = r.data;
        if (!this.compactMode) loggers.server.info('File watcher initialized successfully');
      })
      .with({ success: false }, (e) => {
        loggers.server.error('Failed to create file watcher', e.error);
      })
      .exhaustive();
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = () => {
      loggers.server.info('Shutting down dev server and file watcher...');

      // Clear any pending debounce timer
      if (this.state.debounceTimer) {
        clearTimeout(this.state.debounceTimer);
      }

      if (this.state.fileWatcher) {
        this.state.fileWatcher.close();
      }

      if (this.state.devServer && !this.state.devServer.killed) {
        this.state.devServer.kill('SIGTERM');
      }

      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  /**
   * Creates file change handler with validation and debouncing.
   *
   * Returns event handler function that:
   * 1. Validates file change event
   * 2. Updates state with current filename
   * 3. Clears existing debounce timer
   * 4. Triggers immediate or debounced regeneration
   *
   * @param {string} companyName - Company name for regeneration context
   * @returns {(eventType: string, filename: string | null) => void} Handler function
   */
  private createFileChangeHandler(companyName: string) {
    return (eventType: string, filename: string | null) => {
      // Validate early and return if invalid
      const validation = this.validateFileChangeEvent(eventType, filename);
      if (!validation.success) {
        return;
      }

      const validFilename = validation.data;

      // Store for logging
      this.state.currentFilename = validFilename;

      // Clear existing debounce timer
      if (this.state.debounceTimer) {
        clearTimeout(this.state.debounceTimer);
      }

      // Execute based on debounce configuration
      if (this.debounceDelay === 0) {
        this.regenerateDataWithPipeline(companyName, validFilename);
      } else {
        this.state.debounceTimer = setTimeout(() => {
          this.regenerateDataWithPipeline(companyName, validFilename);
        }, this.debounceDelay);
      }
    };
  }

  /**
   * Validates file change event to ensure it's a YAML file worth processing.
   *
   * Pure function that checks if filename exists and matches YAML pattern.
   * Returns Result type for functional composition.
   *
   * @param {string} eventType - File system event type (change, rename, etc.)
   * @param {string | null} filename - Name of changed file
   * @returns {Result<string>} Success with filename if valid YAML, error otherwise
   */
  private validateFileChangeEvent(eventType: string, filename: string | null): Result<string> {
    if (!filename || !PATTERNS.YAML.test(filename)) {
      return { success: false, error: 'Ignored: not a YAML file' };
    }
    return { success: true, data: filename };
  }

  /**
   * Regenerate data using functional validation and generation pipelines.
   *
   * Uses railway-oriented programming to compose validation and generation operations.
   * Pipeline flow:
   * 1. Validates all required company files exist
   * 2. Loads and validates YAML files against schemas
   * 3. Generates application data TypeScript module
   * 4. Handles success/error outcomes via pattern matching
   *
   * @param {string} companyName - Name of the company for context
   * @param {string | null} filename - Changed filename for logging
   * @returns {void}
   */
  private regenerateDataWithPipeline(companyName: string, filename: string | null): void {
    const startTime = Date.now();
    const displayFilename = filename ? basename(filename) : 'file';

    return pipe(
      validateYamlFilesAgainstSchemasPipeline(companyName, this.filesToWatch),
      (validationResult) =>
        chain(validationResult, (validatedFiles) =>
          generateApplicationData(companyName, validatedFiles),
        ),
      (r) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        return match(r)
          .with({ success: true }, () => this.onRegenerationSuccess(displayFilename, duration))
          .with({ success: false }, (error) =>
            this.onRegenerationError(error, displayFilename, duration),
          )
          .exhaustive();
      },
    );
  }

  /**
   * Handles successful regeneration by logging appropriate success message.
   *
   * Displays compact (emoji + filename) or verbose (detailed success) output
   * based on compact mode setting.
   *
   * @param {string} displayFilename - Filename for display in compact mode
   * @param {string} duration - Operation duration for display
   * @returns {void}
   */
  private onRegenerationSuccess(displayFilename: string, duration: string): void {
    match(this.compactMode)
      .with(true, () => {
        loggers.server.info(`✅ ${displayFilename} → Regenerated (${duration}s)`);
      })
      .with(false, () => {
        loggers.server.success('Data regenerated successfully');
        loggers.server.info(`✅ ${displayFilename} → Regenerated (${duration}s)`);
      })
      .exhaustive();
  }

  /**
   * Handles regeneration errors by determining error stage and logging appropriately.
   *
   * Uses shared error handler with compact mode for hot reload scenarios.
   * Determines pipeline stage based on error context (validation vs generation).
   * Server continues running after logging error.
   *
   * @param {Extract<Result<unknown>, { success: false }>} error - Failed result from validation or generation
   * @param {string} displayFilename - Filename for display in compact mode
   * @param {string} duration - Operation duration for display
   * @returns {void}
   */
  private onRegenerationError(
    error: Extract<Result<unknown>, { success: false }>,
    displayFilename: string,
    duration: string,
  ): void {
    // Determine stage based on error context
    // Validation errors typically have filePath, generation errors don't
    const stage: 'Validation' | 'Generation' = 'filePath' in error ? 'Validation' : 'Generation';

    handlePipelineError(error, {
      logger: loggers.server,
      shouldExit: false,
      compactMode: this.compactMode,
      displayFilename,
      duration,
      stage,
    });
  }

  /**
   * Handles validation errors by logging details and exiting the process.
   *
   * Uses shared error handler for consistent formatting with specialized
   * ZodError handling. Process exits with code 1 after logging.
   *
   * @param {string} error - Primary error message
   * @param {string} [details] - Additional error details
   * @param {unknown} [originalError] - Original error object (checked for ZodError)
   * @param {string} [filePath] - Path to file where error occurred
   * @returns {void} Exits process with code 1
   */
  private onValidationError(
    error: string,
    details?: string,
    originalError?: unknown,
    filePath?: string,
  ): void {
    handlePipelineError(
      { success: false, error, details, originalError, filePath },
      {
        logger: loggers.server,
        shouldExit: true,
      },
    );
  }

  /**
   * Logs server ready message with context information.
   *
   * Uses shared success handler to display startup information including
   * company, files, position, and focus area. Supports both compact and
   * verbose modes.
   *
   * @param {SetContextSuccess['data']} data - Context setup success data
   * @returns {void}
   */
  private onServerReady(data: SetContextSuccess['data']): void {
    handlePipelineSuccess(data, {
      logger: loggers.server,
      shouldExit: false,
      withContextMode: true,
      additionalInfo: `Debounce: ${this.debounceDelay}ms`,
    });
  }
}

// Start the enhanced dev server with the specified company
const devServer = new EnhancedDevServer(companyName);
devServer.start();
