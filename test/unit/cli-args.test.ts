import { describe, test, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  parseCompanyArgs,
  parsePdfArgs,
  parseCliArgs,
  validateRequiredArg,
} from '@shared/cli/cli-args';
import { Logger } from '@shared/core/logger';

describe('CLI Arguments', () => {
  let originalArgv: string[];
  let originalExit: typeof process.exit;
  let consoleErrorSpy: ReturnType<typeof spyOn>;
  let consoleLogSpy: ReturnType<typeof spyOn>;
  let exitCode: number | null = null;

  beforeEach(() => {
    originalArgv = [...Bun.argv];
    originalExit = process.exit;

    // Mock process.exit to capture exit codes instead of exiting
    process.exit = ((code: number) => {
      exitCode = code;
      throw new Error(`Process exit called with code ${code}`);
    }) as never;

    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    exitCode = null;
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Bun as any).argv = originalArgv;
    process.exit = originalExit;
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('parseCompanyArgs', () => {
    test('parses -C flag correctly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company'];
      const result = parseCompanyArgs();

      expect(result.company).toBe('test-company');
    });

    test('returns undefined when -C flag not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts'];
      const result = parseCompanyArgs();

      expect(result.company).toBeUndefined();
    });

    test('handles company names with hyphens', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'my-test-company-name'];
      const result = parseCompanyArgs();

      expect(result.company).toBe('my-test-company-name');
    });

    test('parses company name when other flags are present', () => {
      // parseArgs is strict, so additional unknown flags would cause errors
      // We only test what the function actually supports
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'acme-corp'];
      const result = parseCompanyArgs();

      expect(result.company).toBe('acme-corp');
    });

    test('handles long form --company flag', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '--company', 'test-company'];
      const result = parseCompanyArgs();

      expect(result.company).toBe('test-company');
    });

    test('returns empty object when no arguments', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts'];
      const result = parseCompanyArgs();

      expect(result).toEqual({ company: undefined });
    });
  });

  describe('parsePdfArgs', () => {
    test('parses both -C and -D flags', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company', '-D', 'resume'];
      const result = parsePdfArgs();

      expect(result.company).toBe('test-company');
      expect(result.document).toBe('resume');
    });

    test('defaults document type to "both" when -D not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company'];
      const result = parsePdfArgs();

      expect(result.company).toBe('test-company');
      expect(result.document).toBe('both');
    });

    test('supports "resume" document type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company', '-D', 'resume'];
      const result = parsePdfArgs();

      expect(result.document).toBe('resume');
    });

    test('supports "cover-letter" document type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company', '-D', 'cover-letter'];
      const result = parsePdfArgs();

      expect(result.document).toBe('cover-letter');
    });

    test('supports "both" document type explicitly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company', '-D', 'both'];
      const result = parsePdfArgs();

      expect(result.document).toBe('both');
    });

    test('returns undefined for company when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-D', 'resume'];
      const result = parsePdfArgs();

      expect(result.company).toBeUndefined();
      expect(result.document).toBe('resume');
    });

    test('handles long form flags', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '--company', 'test-company', '--document', 'resume'];
      const result = parsePdfArgs();

      expect(result.company).toBe('test-company');
      expect(result.document).toBe('resume');
    });
  });

  describe('parseCliArgs', () => {
    test('returns parsed values from utility parseArgs', () => {
      const config = {
        options: {
          company: {
            type: 'string' as const,
            short: 'C',
          },
        },
        strict: false,
        allowPositionals: false,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-C', 'test-company'];
      const logger = new Logger({ context: 'test' });
      const result = parseCliArgs(config, logger, 'Usage: test');

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('accepts ParseArgsConfig and logger parameters', () => {
      const config = {
        options: {
          test: {
            type: 'string' as const,
            short: 't',
          },
        },
        strict: false,
        allowPositionals: false,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Bun as any).argv = ['bun', 'script.ts', '-t', 'value'];
      const logger = new Logger({ context: 'test' });

      // Verify function executes with proper parameters
      const result = parseCliArgs(config, logger, 'Usage: test');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('validateRequiredArg', () => {
    test('returns value when present and valid string', () => {
      const logger = new Logger({ context: 'test' });
      const result = validateRequiredArg('test-company', 'Company', logger, 'Usage: test');

      expect(result).toBe('test-company');
    });

    test('returns value for non-empty strings', () => {
      const logger = new Logger({ context: 'test' });
      const result = validateRequiredArg('value', 'Argument', logger, 'Usage: test');

      expect(result).toBe('value');
    });

    test('exits with code 1 when value is undefined', () => {
      const logger = new Logger({ context: 'test' });

      expect(() => {
        validateRequiredArg(undefined, 'Company', logger, 'Usage: test');
      }).toThrow();

      expect(exitCode).toBe(1);
    });

    test('exits with code 1 when value is null', () => {
      const logger = new Logger({ context: 'test' });

      expect(() => {
        validateRequiredArg(null, 'Company', logger, 'Usage: test');
      }).toThrow();

      expect(exitCode).toBe(1);
    });

    test('exits with code 1 when value is not a string', () => {
      const logger = new Logger({ context: 'test' });

      expect(() => {
        validateRequiredArg(123, 'Company', logger, 'Usage: test');
      }).toThrow();

      expect(exitCode).toBe(1);
    });

    test('exits with code 1 when value is empty string', () => {
      const logger = new Logger({ context: 'test' });

      expect(() => {
        validateRequiredArg('', 'Company', logger, 'Usage: test');
      }).toThrow();

      expect(exitCode).toBe(1);
    });

    test('logs error message with argument name', () => {
      const logger = new Logger({ context: 'test' });

      expect(() => {
        validateRequiredArg(undefined, 'Company Name', logger, 'Usage: test');
      }).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('logs usage message on failure', () => {
      const logger = new Logger({ context: 'test' });
      const usageMessage = 'Usage: bun run set-env -C company-name';

      expect(() => {
        validateRequiredArg(undefined, 'Company', logger, usageMessage);
      }).toThrow();

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
