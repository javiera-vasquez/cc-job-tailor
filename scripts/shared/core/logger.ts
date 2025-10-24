/**
 * Structured logging system for tailor toolchain
 *
 * Features:
 * - Dual output modes: human-friendly formatted text or machine-readable JSON
 * - Log levels with filtering (debug, info, warn, error)
 * - Context-aware logging (module/component identification)
 * - Timestamps on all messages
 * - Structured data support
 * - Environment variable configuration
 *
 * Configuration via .env:
 * - LOG_FORMAT: 'human' (default) or 'json'
 * - LOG_LEVEL: 'debug', 'info' (default), 'warn', 'error'
 * - LOG_TIMESTAMPS: 'true' (default) or 'false'
 * - LOG_EMOJI: 'true' (default) or 'false'
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFormat = 'human' | 'json';

export interface LoggerOptions {
  /** Context/module name for this logger instance */
  context: string;

  /** Minimum log level to output (default: from env or 'info') */
  minLevel?: LogLevel;

  /** Output format (default: from env or 'human') */
  format?: LogFormat;

  /** Include timestamps (default: from env or true) */
  timestamps?: boolean;

  /** Use emoji indicators (default: from env or true) */
  emoji?: boolean;
}

export interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

// ============================================================================
// Constants
// ============================================================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_EMOJI: Record<LogLevel, string> = {
  debug: '🔍',
  info: '✨',
  warn: '⚠️',
  error: '❌',
};

const LOG_LEVEL_COLOR: Record<LogLevel, (text: string) => string> = {
  debug: (text) => `\x1b[90m${text}\x1b[0m`, // Gray
  info: (text) => `\x1b[36m${text}\x1b[0m`, // Cyan
  warn: (text) => `\x1b[33m${text}\x1b[0m`, // Yellow
  error: (text) => `\x1b[31m${text}\x1b[0m`, // Red
};

// ============================================================================
// Logger Class
// ============================================================================

export class Logger {
  private options: Required<LoggerOptions>;

  constructor(options: LoggerOptions) {
    this.options = {
      context: options.context,
      minLevel: options.minLevel || LoggerConfig.getGlobalLevel(),
      format: options.format || LoggerConfig.getGlobalFormat(),
      timestamps: options.timestamps ?? LoggerConfig.getGlobalTimestamps(),
      emoji: options.emoji ?? LoggerConfig.getGlobalEmoji(),
    };
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    // Check if this level should be logged
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.options.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      context: this.options.context,
      message,
      timestamp: new Date(),
      data,
    };

    // Output based on format
    if (this.options.format === 'json') {
      this.outputJSON(entry);
    } else {
      this.outputHuman(entry);
    }
  }

  /**
   * Output log entry as JSON (machine-readable)
   */
  private outputJSON(entry: LogEntry): void {
    const jsonEntry = {
      level: entry.level,
      context: entry.context,
      message: entry.message,
      timestamp: entry.timestamp.toISOString(),
      ...(entry.data && { data: entry.data }),
    };

    console.log(JSON.stringify(jsonEntry));
  }

  /**
   * Output log entry as formatted text (human-readable)
   */
  private outputHuman(entry: LogEntry): void {
    const formatted = this.formatEntry(entry);

    // Use appropriate console method based on level
    const stream =
      entry.level === 'error' ? console.error : entry.level === 'warn' ? console.warn : console.log;

    stream(formatted);
  }

  /**
   * Format log entry for human-readable output
   */
  private formatEntry(entry: LogEntry): string {
    const parts: string[] = [];

    // Emoji indicator
    if (this.options.emoji) {
      parts.push(LOG_LEVEL_EMOJI[entry.level]);
    }

    // Timestamp
    if (this.options.timestamps) {
      const time = entry.timestamp.toLocaleTimeString('en-US', { hour12: false });
      parts.push(`[${time}]`);
    }

    // Context (colored based on log level)
    const contextStr = `[${entry.context}]`;
    parts.push(LOG_LEVEL_COLOR[entry.level](contextStr));

    // Message
    parts.push(entry.message);

    // Structured data (if present)
    if (entry.data && Object.keys(entry.data).length > 0) {
      parts.push('\n' + JSON.stringify(entry.data, null, 2));
    }

    return parts.join(' ');
  }

  /**
   * Logs a debug message with optional structured data
   * @param {string} message - Debug message
   * @param {Record<string, unknown>} [data] - Optional structured data
   * @returns {void}
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Logs an info message with optional structured data
   * @param {string} message - Info message
   * @param {Record<string, unknown>} [data] - Optional structured data
   * @returns {void}
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Logs a warning message with optional structured data
   * @param {string} message - Warning message
   * @param {Record<string, unknown>} [data] - Optional structured data
   * @returns {void}
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Logs an error message with Error object and optional structured data
   * @param {string} message - Error message
   * @param {Error | unknown} [error] - Error object or error value
   * @param {Record<string, unknown>} [data] - Optional additional data
   * @returns {void}
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData =
      error instanceof Error
        ? { error: error.message, stack: error.stack, ...data }
        : error
          ? { error: String(error), ...data }
          : data;

    this.log('error', message, errorData);
  }

  /**
   * Logs a success message with green checkmark emoji prefix
   * @param {string} message - Success message
   * @param {Record<string, unknown>} [data] - Optional structured data
   * @returns {void}
   */
  success(message: string, data?: Record<string, unknown>): void {
    this.info(`✅ ${message}`, data);
  }

  /**
   * Logs a loading message with loading emoji prefix
   * @param {string} message - Loading message
   * @param {Record<string, unknown>} [data] - Optional structured data
   * @returns {void}
   */
  loading(message: string, data?: Record<string, unknown>): void {
    this.info(`🔄 ${message}`, data);
  }

  /**
   * Create child logger with extended context
   * @example
   * const parent = createLogger('server');
   * const child = parent.child('watcher');
   * child.info('File changed'); // Output: [server:watcher] File changed
   */
  child(subContext: string): Logger {
    return new Logger({
      ...this.options,
      context: `${this.options.context}:${subContext}`,
    });
  }
}

// ============================================================================
// Global Configuration
// ============================================================================

/**
 * Global logger configuration
 * Reads from environment variables with sensible defaults
 */
export class LoggerConfig {
  private static globalMinLevel: LogLevel;
  private static globalFormat: LogFormat;
  private static globalTimestamps: boolean;
  private static globalEmoji: boolean;

  static {
    // Initialize from environment variables
    this.globalMinLevel = this.parseLogLevel(process.env.LOG_LEVEL) || 'info';
    this.globalFormat = this.parseLogFormat(process.env.LOG_FORMAT) || 'human';
    this.globalTimestamps = this.parseBoolean(process.env.LOG_TIMESTAMPS, true);
    this.globalEmoji = this.parseBoolean(process.env.LOG_EMOJI, true);
  }

  private static parseLogLevel(value?: string): LogLevel | null {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (['debug', 'info', 'warn', 'error'].includes(normalized)) {
      return normalized as LogLevel;
    }
    return null;
  }

  private static parseLogFormat(value?: string): LogFormat | null {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (['human', 'json'].includes(normalized)) {
      return normalized as LogFormat;
    }
    return null;
  }

  private static parseBoolean(value?: string, defaultValue: boolean = true): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * Sets the global minimum log level for all loggers
   * @param {LogLevel} level - Log level to set (debug, info, warn, error)
   * @returns {void}
   */
  static setGlobalLevel(level: LogLevel): void {
    this.globalMinLevel = level;
  }

  /**
   * Gets the current global minimum log level
   * @returns {LogLevel} Current global log level
   */
  static getGlobalLevel(): LogLevel {
    return this.globalMinLevel;
  }

  /**
   * Sets the global output format for all loggers
   * @param {LogFormat} format - Output format (human or json)
   * @returns {void}
   */
  static setGlobalFormat(format: LogFormat): void {
    this.globalFormat = format;
  }

  /**
   * Gets the current global output format
   * @returns {LogFormat} Current output format
   */
  static getGlobalFormat(): LogFormat {
    return this.globalFormat;
  }

  /**
   * Enables or disables timestamps in all loggers
   * @param {boolean} enabled - True to include timestamps, false to exclude
   * @returns {void}
   */
  static setGlobalTimestamps(enabled: boolean): void {
    this.globalTimestamps = enabled;
  }

  /**
   * Gets the current timestamp setting
   * @returns {boolean} True if timestamps are enabled, false otherwise
   */
  static getGlobalTimestamps(): boolean {
    return this.globalTimestamps;
  }

  /**
   * Enables or disables emoji indicators in all loggers
   * @param {boolean} enabled - True to include emojis, false to exclude
   * @returns {void}
   */
  static setGlobalEmoji(enabled: boolean): void {
    this.globalEmoji = enabled;
  }

  /**
   * Gets the current emoji indicator setting
   * @returns {boolean} True if emojis are enabled, false otherwise
   */
  static getGlobalEmoji(): boolean {
    return this.globalEmoji;
  }

  /**
   * Gets current configuration summary
   * @returns {Object} Configuration object with level, format, timestamps, and emoji settings
   */
  static getConfig(): {
    level: LogLevel;
    format: LogFormat;
    timestamps: boolean;
    emoji: boolean;
  } {
    return {
      level: this.globalMinLevel,
      format: this.globalFormat,
      timestamps: this.globalTimestamps,
      emoji: this.globalEmoji,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a new Logger instance with the given context and optional configuration
 * @param {string} context - Context/module name for logger identification
 * @param {Partial<LoggerOptions>} [options] - Optional configuration overrides
 * @returns {Logger} Configured logger instance
 * @example
 * const logger = createLogger('tailor-server');
 * logger.info('Server started');
 *
 * const debugLogger = createLogger('debug-module', { minLevel: 'debug' });
 */
export function createLogger(context: string, options?: Partial<LoggerOptions>): Logger {
  return new Logger({
    context,
    ...options,
  });
}

// ============================================================================
// Pre-configured Logger Instances
// ============================================================================

/**
 * Pre-configured loggers for common components
 * These are ready to use throughout the codebase
 */
export const loggers = {
  server: createLogger('tailor-server'),
  setEnv: createLogger('set-env'),
  watcher: createLogger('file-watcher'),
  validation: createLogger('validation'),
  pdf: createLogger('generate-pdf'),
  validator: createLogger('validator'),
  loader: createLogger('company-loader'),
};
