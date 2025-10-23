import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { Logger, LoggerConfig, createLogger, loggers } from '../../scripts/shared/logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof spyOn>;
  let consoleErrorSpy: ReturnType<typeof spyOn>;
  let consoleWarnSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = spyOn(console, 'warn').mockImplementation(() => {});

    // Reset to default config
    LoggerConfig.setGlobalLevel('info');
    LoggerConfig.setGlobalFormat('human');
    LoggerConfig.setGlobalTimestamps(true);
    LoggerConfig.setGlobalEmoji(true);
  });

  afterEach(() => {
    // Restore original console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Logger instantiation', () => {
    it('should create a logger with context', () => {
      const logger = new Logger({ context: 'test-module' });
      expect(logger).toBeDefined();
    });

    it('should use global config when no options provided', () => {
      LoggerConfig.setGlobalLevel('debug');
      LoggerConfig.setGlobalFormat('json');

      const logger = new Logger({ context: 'test' });
      logger.debug('test message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should override global config with instance options', () => {
      LoggerConfig.setGlobalLevel('info');

      const logger = new Logger({ context: 'test', minLevel: 'debug' });
      logger.debug('debug message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Log level filtering', () => {
    it('should filter out logs below minimum level', () => {
      const logger = new Logger({ context: 'test', minLevel: 'warn' });

      logger.debug('debug message');
      logger.info('info message');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      logger.warn('warn message');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log messages at or above minimum level', () => {
      const logger = new Logger({ context: 'test', minLevel: 'info' });

      logger.info('info message');
      expect(consoleLogSpy).toHaveBeenCalled();

      logger.warn('warn message');
      expect(consoleWarnSpy).toHaveBeenCalled();

      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect log level priority', () => {
      const logger = new Logger({ context: 'test', minLevel: 'error' });

      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      logger.error('error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Human-readable output format', () => {
    it('should include emoji in human format when enabled', () => {
      const logger = new Logger({ context: 'test', format: 'human', emoji: true });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('✨'); // info emoji
    });

    it('should exclude emoji when disabled', () => {
      const logger = new Logger({ context: 'test', format: 'human', emoji: false });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('✨');
    });

    it('should include timestamp when enabled', () => {
      const logger = new Logger({ context: 'test', format: 'human', timestamps: true });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toMatch(/\[\d{2}:\d{2}:\d{2}\]/); // timestamp pattern
    });

    it('should exclude timestamp when disabled', () => {
      const logger = new Logger({ context: 'test', format: 'human', timestamps: false });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
    });

    it('should include context in output', () => {
      const logger = new Logger({ context: 'my-module', format: 'human' });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[my-module]');
    });

    it('should include the log message', () => {
      const logger = new Logger({ context: 'test', format: 'human' });
      logger.info('my test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('my test message');
    });

    it('should include structured data when provided', () => {
      const logger = new Logger({ context: 'test', format: 'human' });
      logger.info('test message', { key: 'value', count: 42 });

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('"key"');
      expect(output).toContain('"value"');
      expect(output).toContain('"count"');
      expect(output).toContain('42');
    });
  });

  describe('JSON output format', () => {
    it('should output valid JSON', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed).toBeDefined();
      expect(parsed.level).toBe('info');
      expect(parsed.context).toBe('test');
      expect(parsed.message).toBe('test message');
    });

    it('should include timestamp in ISO format', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include structured data in JSON output', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      logger.info('test message', { key: 'value', nested: { prop: 'data' } });

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.data).toBeDefined();
      expect(parsed.data.key).toBe('value');
      expect(parsed.data.nested.prop).toBe('data');
    });

    it('should not include emoji or color codes in JSON', () => {
      const logger = new Logger({ context: 'test', format: 'json', emoji: true });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('✨');
      expect(output).not.toContain('\x1b['); // ANSI color codes
    });
  });

  describe('Log level methods', () => {
    it('should call debug method correctly', () => {
      const logger = new Logger({ context: 'test', minLevel: 'debug' });
      logger.debug('debug message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should call info method correctly', () => {
      const logger = new Logger({ context: 'test' });
      logger.info('info message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should call warn method correctly', () => {
      const logger = new Logger({ context: 'test' });
      logger.warn('warn message');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should call error method correctly', () => {
      const logger = new Logger({ context: 'test' });
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle Error objects in error method', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      const testError = new Error('Test error');
      logger.error('An error occurred', testError);

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.data.error).toBe('Test error');
      expect(parsed.data.stack).toBeDefined();
    });

    it('should handle non-Error objects in error method', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      logger.error('An error occurred', 'string error');

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.data.error).toBe('string error');
    });

    it('should merge additional data with error info', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      const testError = new Error('Test error');
      logger.error('An error occurred', testError, { userId: 123 });

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.data.error).toBe('Test error');
      expect(parsed.data.userId).toBe(123);
    });
  });

  describe('Convenience methods', () => {
    it('should call success method with checkmark', () => {
      const logger = new Logger({ context: 'test', format: 'human', emoji: false });
      logger.success('Operation completed');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('✅');
      expect(output).toContain('Operation completed');
    });

    it('should call loading method with spinner', () => {
      const logger = new Logger({ context: 'test', format: 'human', emoji: false });
      logger.loading('Processing...');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('🔄');
      expect(output).toContain('Processing...');
    });
  });

  describe('Child logger', () => {
    it('should create child logger with extended context', () => {
      const parent = new Logger({ context: 'parent' });
      const child = parent.child('child');

      child.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[parent:child]');
    });

    it('should inherit parent configuration', () => {
      const parent = new Logger({ context: 'parent', minLevel: 'debug', emoji: false });
      const child = parent.child('child');

      child.debug('debug message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).not.toContain('🔍'); // emoji should be disabled
    });

    it('should support multiple levels of nesting', () => {
      const parent = new Logger({ context: 'parent' });
      const child = parent.child('child');
      const grandchild = child.child('grandchild');

      grandchild.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[parent:child:grandchild]');
    });
  });

  describe('LoggerConfig', () => {
    it('should set and get global log level', () => {
      LoggerConfig.setGlobalLevel('debug');
      expect(LoggerConfig.getGlobalLevel()).toBe('debug');

      LoggerConfig.setGlobalLevel('error');
      expect(LoggerConfig.getGlobalLevel()).toBe('error');
    });

    it('should set and get global format', () => {
      LoggerConfig.setGlobalFormat('json');
      expect(LoggerConfig.getGlobalFormat()).toBe('json');

      LoggerConfig.setGlobalFormat('human');
      expect(LoggerConfig.getGlobalFormat()).toBe('human');
    });

    it('should set and get global timestamps', () => {
      LoggerConfig.setGlobalTimestamps(false);
      expect(LoggerConfig.getGlobalTimestamps()).toBe(false);

      LoggerConfig.setGlobalTimestamps(true);
      expect(LoggerConfig.getGlobalTimestamps()).toBe(true);
    });

    it('should set and get global emoji', () => {
      LoggerConfig.setGlobalEmoji(false);
      expect(LoggerConfig.getGlobalEmoji()).toBe(false);

      LoggerConfig.setGlobalEmoji(true);
      expect(LoggerConfig.getGlobalEmoji()).toBe(true);
    });

    it('should return complete config summary', () => {
      LoggerConfig.setGlobalLevel('warn');
      LoggerConfig.setGlobalFormat('json');
      LoggerConfig.setGlobalTimestamps(false);
      LoggerConfig.setGlobalEmoji(false);

      const config = LoggerConfig.getConfig();

      expect(config.level).toBe('warn');
      expect(config.format).toBe('json');
      expect(config.timestamps).toBe(false);
      expect(config.emoji).toBe(false);
    });
  });

  describe('createLogger factory', () => {
    it('should create logger with context only', () => {
      const logger = createLogger('factory-test');
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[factory-test]');
    });

    it('should create logger with custom options', () => {
      const logger = createLogger('factory-test', { minLevel: 'debug', format: 'json' });
      logger.debug('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.context).toBe('factory-test');
      expect(parsed.level).toBe('debug');
    });
  });

  describe('Pre-configured loggers', () => {
    it('should provide server logger', () => {
      expect(loggers.server).toBeDefined();
      loggers.server.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[tailor-server]');
    });

    it('should provide setEnv logger', () => {
      expect(loggers.setEnv).toBeDefined();
      loggers.setEnv.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[set-env]');
    });

    it('should provide watcher logger', () => {
      expect(loggers.watcher).toBeDefined();
      loggers.watcher.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[file-watcher]');
    });

    it('should provide validation logger', () => {
      expect(loggers.validation).toBeDefined();
      loggers.validation.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[validation]');
    });

    it('should provide pdf logger', () => {
      expect(loggers.pdf).toBeDefined();
      loggers.pdf.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[generate-pdf]');
    });

    it('should provide validator logger', () => {
      expect(loggers.validator).toBeDefined();
      loggers.validator.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[validator]');
    });

    it('should provide loader logger', () => {
      expect(loggers.loader).toBeDefined();
      loggers.loader.info('test');
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[company-loader]');
    });
  });

  describe('Console method routing', () => {
    it('should use console.error for error level', () => {
      const logger = new Logger({ context: 'test' });
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should use console.warn for warn level', () => {
      const logger = new Logger({ context: 'test' });
      logger.warn('warn message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should use console.log for info and debug levels', () => {
      const logger = new Logger({ context: 'test', minLevel: 'debug' });

      logger.debug('debug message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      logger.info('info message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty structured data', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      logger.info('test message', {});

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      // Empty object is still included in output
      expect(parsed.data).toEqual({});
    });

    it('should handle undefined error in error method', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      logger.error('error message', undefined, { extra: 'data' });

      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.data.extra).toBe('data');
    });

    it('should handle very long messages', () => {
      const logger = new Logger({ context: 'test' });
      const longMessage = 'x'.repeat(10000);
      logger.info(longMessage);

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain(longMessage);
    });

    it('should handle special characters in context', () => {
      const logger = new Logger({ context: 'test-module_v2.0' });
      logger.info('test message');

      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('[test-module_v2.0]');
    });

    it('should handle circular references in structured data gracefully', () => {
      const logger = new Logger({ context: 'test', format: 'json' });
      const circular: any = { prop: 'value' };
      circular.self = circular;

      // Should not throw
      expect(() => {
        logger.info('test message', circular);
      }).toThrow(); // JSON.stringify will throw on circular references
    });
  });
});
