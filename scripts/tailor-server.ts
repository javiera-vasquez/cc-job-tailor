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

interface WatcherState {
  devServer: ChildProcess;
  fileWatcher?: FSWatcher;
  activeCompany: string | null;
}

class EnhancedDevServer {
  private state: WatcherState;
  private readonly tailorDir = './resume-data/tailor';
  private readonly contextPath = './.claude/tailor-context.yaml';

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
      console.warn('⚠️  No tailor context found - watching all companies');
      return null;
    }

    try {
      const contextFile = Bun.file(this.contextPath);
      const contextText = await contextFile.text();
      const context = load(contextText) as TailorContext;

      // Validate tailor context
      const validation = validateTailorContext(context);

      if (!validation.success) {
        console.error('❌ Invalid tailor context:');
        validation.errors.forEach((err) => console.error(`  - ${err}`));
        console.warn('⚠️  Watching all companies due to validation errors');
        return null;
      }

      // Show warnings if any
      if (validation.warnings && validation.warnings.length > 0) {
        console.warn('⚠️  Tailor context warnings:');
        validation.warnings.forEach((warn) => console.warn(`  - ${warn}`));
      }

      if (!validation.data?.active_company) {
        console.warn('⚠️  No active company in tailor context');
        return null;
      }

      return validation.data.active_company;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️  Could not read tailor context:', errorMessage);
      return null;
    }
  }

  /**
   * Create the main Vite dev server process
   */
  private createDevServer(): ChildProcess {
    const devServer = spawn('bun', ['run', 'dev:vite'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    // Consume output to prevent buffer overflow but don't log it
    devServer.stdout?.on('data', () => {});
    devServer.stderr?.on('data', () => {});

    devServer.on('exit', (code) => {
      console.warn(`Dev server exited with code ${code}`);
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
    if (!filename || !filename.endsWith('.yaml')) {
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
    console.warn(`🔄 Regenerating data for company: ${companyName}`);

    return new Promise((resolve, reject) => {
      try {
        const generateData = spawn('bun', ['run', 'generate-data', '-C', companyName], {
          stdio: 'pipe',
          cwd: process.cwd(),
        });

        let output = '';
        let errorOutput = '';

        generateData.stdout?.on('data', (data: Buffer) => {
          output += data.toString();
        });

        generateData.stderr?.on('data', (data: Buffer) => {
          errorOutput += data.toString();
        });

        generateData.on('close', (code) => {
          if (code === 0) {
            console.warn('✅ Data regenerated successfully');
            console.warn('🔥 Hot reload will pick up changes automatically\n');
            resolve();
          } else {
            console.error('❌ Data regeneration failed (validation or other error):');
            if (errorOutput) {
              console.error(errorOutput.trim());
            } else if (output) {
              console.error(output.trim());
            }
            console.error('💡 Fix the data issues in the tailor files and save again to retry');
            console.error(
              '🔄 File watcher is still active - auto-regeneration will resume on next save\n',
            );

            // Don't reject - just log the error and continue watching
            // This keeps the dev server running even with validation failures
            resolve();
          }
        });

        generateData.on('error', (error) => {
          console.error('❌ Error spawning regeneration process:', error.message);
          reject(error);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error regenerating data:', errorMessage);
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

    console.warn(`\n🔥 Tailor data changed: ${filename}`);

    try {
      await this.regenerateData(companyFromPath);
    } catch {
      // Error already logged in regenerateData method
      // File watcher continues running regardless of validation failures
      console.warn('📁 File watcher remains active for continued development\n');
    }
  }

  /**
   * Set up file system watcher for tailor directory
   */
  private setupFileWatcher(): void {
    if (!existsSync(this.tailorDir)) {
      console.warn('⚠️  Tailor directory not found - only basic hot reload active');
      return;
    }

    try {
      this.state.fileWatcher = watch(
        this.tailorDir,
        { recursive: true },
        this.handleFileChange.bind(this),
      );

      console.warn('📁 File watcher active for resume-data/tailor/');
      console.warn('✨ Edit any YAML file in tailor folders to trigger auto-regeneration\n');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️  Could not set up file watcher:', errorMessage);
    }
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = () => {
      console.warn('\n🛑 Shutting down dev server and file watcher...');

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
    console.warn('🚀 Starting enhanced dev server with tailor data watching...');

    // Get active company context
    this.state.activeCompany = await this.getActiveCompany();

    if (this.state.activeCompany) {
      console.warn(`🎯 Watching tailor data for active company: ${this.state.activeCompany}`);
    } else {
      console.warn('👀 Watching all tailor data changes');
    }

    // Set up file watcher
    this.setupFileWatcher();

    // Set up shutdown handlers
    this.setupShutdownHandlers();

    console.warn('✅ Enhanced dev server is running');
    console.warn('   • Bun hot reload: ✓');
    console.warn('   • Tailor data watching: ✓');
    console.warn('   • Auto data regeneration: ✓\n');
  }
}

// Start the enhanced dev server
const devServer = new EnhancedDevServer();

try {
  await devServer.start();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('❌ Failed to start enhanced dev server:', errorMessage);
  process.exit(1);
}
