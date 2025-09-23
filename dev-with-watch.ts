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
import { join, sep } from 'path';

interface TailorContext {
  active_company: string;
  folder_path: string;
  available_files: string[];
  position: string;
  primary_focus: string;
  last_updated: string;
  job_summary: string;
  job_details: {
    company: string;
    location: string;
    experience_level: string;
    employment_type: string;
    must_have_skills: string[];
    nice_to_have_skills: string[];
    team_context: string;
    user_scale: string;
  };
}

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
      activeCompany: null
    };
  }

  /**
   * Get the active company from tailor context file
   */
  private async getActiveCompany(): Promise<string | null> {
    if (!existsSync(this.contextPath)) {
      console.log('⚠️  No tailor context found - watching all companies');
      return null;
    }

    try {
      const contextFile = Bun.file(this.contextPath);
      const contextText = await contextFile.text();
      const context = load(contextText) as TailorContext;

      if (!context?.active_company) {
        console.log('⚠️  No active company in tailor context');
        return null;
      }

      return context.active_company;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️  Could not read tailor context:', errorMessage);
      return null;
    }
  }

  /**
   * Create the main Bun dev server process
   */
  private createDevServer(): ChildProcess {
    const devServer = spawn('bun', ['--hot', 'index.html'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    devServer.on('exit', (code) => {
      console.log(`Dev server exited with code ${code}`);
      process.exit(code || 0);
    });

    return devServer;
  }

  /**
   * Extract company name from file path
   */
  private extractCompanyFromPath(filename: string): string | null {
    const parts = filename.split(sep);
    return parts.length >= 2 ? parts[0] : null;
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
    console.log(`🔄 Regenerating data for company: ${companyName}`);

    return new Promise((resolve, reject) => {
      try {
        const generateData = spawn('bun', ['run', 'generate-data', '-C', companyName], {
          stdio: 'pipe',
          cwd: process.cwd()
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
            console.log('✅ Data regenerated successfully');
            console.log('🔥 Hot reload will pick up changes automatically\n');
            resolve();
          } else {
            console.log('❌ Data regeneration failed:');
            if (output) console.log('STDOUT:', output);
            if (errorOutput) console.log('STDERR:', errorOutput);
            reject(new Error(`Process exited with code ${code}`));
          }
        });

        generateData.on('error', (error) => {
          console.log('❌ Error spawning regeneration process:', error.message);
          reject(error);
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('❌ Error regenerating data:', errorMessage);
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

    console.log(`\n🔥 Tailor data changed: ${filename}`);

    try {
      await this.regenerateData(companyFromPath!);
    } catch (error) {
      // Error already logged in regenerateData
    }
  }

  /**
   * Set up file system watcher for tailor directory
   */
  private setupFileWatcher(): void {
    if (!existsSync(this.tailorDir)) {
      console.log('⚠️  Tailor directory not found - only basic hot reload active');
      return;
    }

    try {
      this.state.fileWatcher = watch(
        this.tailorDir,
        { recursive: true },
        this.handleFileChange.bind(this)
      );

      console.log('📁 File watcher active for resume-data/tailor/');
      console.log('✨ Edit any YAML file in tailor folders to trigger auto-regeneration\n');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️  Could not set up file watcher:', errorMessage);
    }
  }

  /**
   * Set up graceful shutdown handlers
   */
  private setupShutdownHandlers(): void {
    const shutdown = () => {
      console.log('\n🛑 Shutting down dev server and file watcher...');

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
    console.log('🚀 Starting enhanced dev server with tailor data watching...');

    // Get active company context
    this.state.activeCompany = await this.getActiveCompany();

    if (this.state.activeCompany) {
      console.log(`🎯 Watching tailor data for active company: ${this.state.activeCompany}`);
    } else {
      console.log('👀 Watching all tailor data changes');
    }

    // Set up file watcher
    this.setupFileWatcher();

    // Set up shutdown handlers
    this.setupShutdownHandlers();

    console.log('✅ Enhanced dev server is running');
    console.log('   • Bun hot reload: ✓');
    console.log('   • Tailor data watching: ✓');
    console.log('   • Auto data regeneration: ✓\n');
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