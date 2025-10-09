#!/usr/bin/env bun
/**
 * Enhanced dev server with tailor data watching
 *
 * This TypeScript version provides:
 * - Type safety for file operations and process management
 * - Intelligent company-aware file watching
 * - Automatic data regeneration on YAML changes
 * - Integration with Bun's native hot reload
 */

import { spawn, type ChildProcess } from 'child_process';
import { watch, existsSync, type FSWatcher } from 'fs';
import { load } from 'js-yaml';
import { sep } from 'path';
import { validateTailorContext, type TailorContext } from '../src/zod/tailor-context-schema';
import { validateApplicationData } from '../src/zod/validation';
import { getCompanyFolderPath, loadTailoredData } from './shared/company-loader';
import { handleValidationError } from './shared/validation-error-handler';
import { PATHS, PATTERNS, SCRIPTS } from './shared/config';
import { loggers } from './shared/logger';

interface WatcherState {
  devServer: ChildProcess;
  fileWatcher?: FSWatcher;
  activeCompany: string | null;
}

class EnhancedDevServer {
  private state: WatcherState;
  private readonly tailorDir = PATHS.TAILOR_BASE;
  private readonly contextPath = PATHS.CONTEXT_FILE;

  constructor() {
    this.state = {
      devServer: this.createDevServer(),
      activeCompany: null,
    };
  }

  /**
   * Get the active company from tailor context file
   */
  private async getActiveCompany(): Promise<string | null> {
    if (!existsSync(this.contextPath)) {
      loggers.server.warn('No tailor context found - watching all companies');
      return null;
    }

    try {
      const contextFile = Bun.file(this.contextPath);
      const contextText = await contextFile.text();
      const context = load(contextText) as TailorContext;

      // Validate tailor context
      const validation = validateTailorContext(context);

      if (!validation.success) {
        loggers.server.error('Invalid tailor context', null, {
          errors: validation.errors,
        });
        loggers.server.warn('Watching all companies due to validation errors');
        return null;
      }

      // Show warnings if any
      if (validation.warnings && validation.warnings.length > 0) {
        loggers.server.warn('Tailor context warnings', {
          warnings: validation.warnings,
        });
      }

      if (!validation.data?.active_company) {
        loggers.server.warn('No active company in tailor context');
        return null;
      }

      return validation.data.active_company;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      loggers.server.warn('Could not read tailor context', {
        error: err.message,
        stack: err.stack,
      });
      return null;
    }
  }

  /**
   * Validate company data before starting the server
   */
  private async validateCompanyData(companyName: string): Promise<void> {
    loggers.server.info(`Validating data for company: ${companyName}`);

    try {
      const companyPath = getCompanyFolderPath(companyName);

      if (!companyPath) {
        loggers.server.error(
          `Company folder not found for: ${companyName}`,
          new Error('Company folder not found'),
        );
        throw new Error(`Company folder not found: ${companyName}`);
      }

      // Load and validate the tailored data
      const applicationData = await loadTailoredData(companyPath);
      validateApplicationData(applicationData);

      loggers.server.success('Application data validation passed');
    } catch (error) {
      handleValidationError(error, {
        context: 'tailor-server',
        companyName,
        exitOnError: true,
        showHelpHint: true,
      });
    }
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

  /**
   * Extract company name from file path
   */
  private extractCompanyFromPath(filename: string): string | null {
    const parts = filename.split(sep);
    return parts.length >= 2 ? parts[0] || null : null;
  }

  /**
   * Check if file change should trigger regeneration
   */
  private shouldProcessChange(filename: string | null, companyFromPath: string | null): boolean {
    if (!filename || !PATTERNS.YAML.test(filename)) {
      return false;
    }

    if (!companyFromPath) {
      return false;
    }

    // If we have an active company, only process changes for that company
    if (this.state.activeCompany && companyFromPath !== this.state.activeCompany) {
      return false;
    }

    return true;
  }

  /**
   * Regenerate data for the specified company
   */
  private async regenerateData(companyName: string): Promise<void> {
    loggers.server.loading(`Regenerating data for company: ${companyName}`);

    return new Promise((resolve, reject) => {
      try {
        const generateData = spawn('bun', ['run', SCRIPTS.GENERATE_DATA, '-C', companyName], {
          stdio: 'inherit', // Let subprocess errors flow through naturally
          cwd: process.cwd(),
        });

        generateData.on('close', (code) => {
          if (code === 0) {
            loggers.server.success('Data regenerated successfully');
            loggers.server.info('Hot reload will pick up changes automatically');
            resolve();
          } else {
            // Subprocess already displayed the error - just show recovery hint
            loggers.server.info(
              '💡 Fix the data issues in the tailor files and save again to retry',
            );
            loggers.server.info(
              'File watcher is still active - auto-regeneration will resume on next save',
            );

            // Don't reject - just continue watching
            // This keeps the dev server running even with validation failures
            resolve();
          }
        });

        generateData.on('error', (error) => {
          loggers.server.error('Error spawning regeneration process', error);
          reject(error);
        });
      } catch (error) {
        loggers.server.error('Error regenerating data', error);
        reject(error);
      }
    });
  }

  /**
   * Handle file system change events
   */
  private async handleFileChange(eventType: string, filename: string | null): Promise<void> {
    const companyFromPath = filename ? this.extractCompanyFromPath(filename) : null;

    if (!this.shouldProcessChange(filename, companyFromPath)) {
      return;
    }

    // At this point, companyFromPath is guaranteed to be non-null because shouldProcessChange checks for it
    if (!companyFromPath) {
      return; // This should never happen due to shouldProcessChange logic, but satisfies TypeScript
    }

    loggers.watcher.info(`Tailor data changed: ${filename}`);

    try {
      await this.regenerateData(companyFromPath);
    } catch {
      // Error already logged in regenerateData method
      // File watcher continues running regardless of validation failures
      loggers.watcher.info('File watcher remains active for continued development');
    }
  }

  /**
   * Set up file system watcher for tailor directory
   */
  private setupFileWatcher(): void {
    if (!existsSync(this.tailorDir)) {
      loggers.watcher.warn('Tailor directory not found - only basic hot reload active');
      return;
    }

    try {
      this.state.fileWatcher = watch(
        this.tailorDir,
        { recursive: true },
        this.handleFileChange.bind(this),
      );

      loggers.watcher.info('File watcher active for resume-data/tailor/');
      loggers.watcher.info('Edit any YAML file in tailor folders to trigger auto-regeneration');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      loggers.watcher.warn('Could not set up file watcher', {
        error: err.message,
        stack: err.stack,
      });
    }
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = () => {
      loggers.server.info('Shutting down dev server and file watcher...');

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
   * Start the enhanced development server
   */
  public async start(): Promise<void> {
    loggers.server.info('Starting enhanced dev server with tailor data watching');

    // Get active company context
    this.state.activeCompany = await this.getActiveCompany();

    if (this.state.activeCompany) {
      loggers.server.info(`Watching tailor data for active company: ${this.state.activeCompany}`);

      // Validate company data before starting the server
      await this.validateCompanyData(this.state.activeCompany);
    } else {
      loggers.server.info('Watching all tailor data changes');
      loggers.server.warn('Skipping initial validation - no active company specified');
    }

    // Set up file watcher
    this.setupFileWatcher();

    // Set up shutdown handlers
    this.setupShutdownHandlers();

    loggers.server.success('Enhanced dev server is running', {
      features: {
        bunHotReload: true,
        tailorDataWatching: true,
        autoDataRegeneration: true,
      },
    });
  }
}

// Start the enhanced dev server
const devServer = new EnhancedDevServer();

try {
  await devServer.start();
} catch (error) {
  loggers.server.error('Failed to start enhanced dev server', error);
  process.exit(1);
}
