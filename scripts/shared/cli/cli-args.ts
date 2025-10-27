import { parseArgs as utilParseArgs } from 'util';
import type { ParseArgsConfig } from 'util';
import type { Logger } from '@shared/core/logger';

export interface CompanyCliArgs {
  company?: string;
}

export interface PdfCliArgs extends CompanyCliArgs {
  document?: string;
}

/**
 * Parse CLI arguments for company name (-C flag).
 * Used by generate-data, generate-pdf, and validation scripts.
 *
 * @returns {CompanyCliArgs} Parsed arguments with optional company name
 * @example parseCompanyArgs() → { company: 'acme-corp' }
 *
 * @todo REFACTOR: This function reads from global readonly Bun.argv, making it hard to test
 * without type casting. Consider refactoring to accept argv as optional parameter:
 * `export function parseCompanyArgs(argv: string[] = Bun.argv): CompanyCliArgs`
 * This would improve testability, remove need for (Bun as any) casts in tests,
 * and follow dependency injection principles. See test/unit/cli-args.test.ts for details.
 */
export function parseCompanyArgs(): CompanyCliArgs {
  const { values } = utilParseArgs({
    args: Bun.argv.slice(2),
    options: {
      company: {
        type: 'string',
        short: 'C',
        multiple: false,
      },
    },
    strict: true,
    allowPositionals: false,
  });

  return {
    company: values.company,
  };
}

/**
 * Parse CLI arguments for PDF generation (-C company, -D document type).
 *
 * @returns {PdfCliArgs} Parsed arguments with optional company and document type
 * @example parsePdfArgs() → { company: 'acme-corp', document: 'resume' }
 *
 * @todo REFACTOR: Like parseCompanyArgs(), this reads from readonly Bun.argv.
 * Should accept argv as optional parameter for better testability and type safety.
 */
export function parsePdfArgs(): PdfCliArgs {
  const { values } = utilParseArgs({
    args: Bun.argv.slice(2),
    options: {
      company: {
        type: 'string',
        short: 'C',
        multiple: false,
      },
      document: {
        type: 'string',
        short: 'D',
        multiple: false,
      },
    },
    strict: true,
    allowPositionals: false,
  });

  return {
    company: values.company,
    document: values.document || 'both',
  };
}

/**
 * Parse command-line arguments with graceful error handling
 *
 * @param config - ParseArgs configuration object
 * @param logger - Logger instance for error messages
 * @param usageMessage - Custom usage message to display on error
 * @returns Parsed values object
 *
 * @example
 * ```ts
 * const values = parseCliArgs(
 *   {
 *     options: {
 *       C: { type: 'string', short: 'C', required: true },
 *     },
 *   },
 *   loggers.setEnv,
 *   'Usage: bun run set-env -C company-name'
 * );
 * ```
 *
 * @todo REFACTOR: This function's config parameter relies on implicit default argv handling.
 * Consider making argv explicit: accept it as optional parameter in config or as separate param
 * `export function parseCliArgs<T extends ParseArgsConfig>(config: T, logger: Logger, usageMessage: string, argv?: string[])`
 * This would improve testability and make argv source explicit rather than relying on default.
 */
export function parseCliArgs<T extends ParseArgsConfig>(
  config: T,
  logger: Logger,
  usageMessage: string,
): Record<string, unknown> {
  try {
    const parsed = utilParseArgs(config);
    return parsed.values;
  } catch (error) {
    // Handle missing or invalid argument
    if (error instanceof Error && error.message.includes('argument missing')) {
      logger.error('Required argument missing');
      logger.info(usageMessage);
      process.exit(1);
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Validate that a required string argument is present
 *
 * @param value - The value to validate
 * @param argumentName - Name of the argument for error messages
 * @param logger - Logger instance for error messages
 * @param usageMessage - Custom usage message to display on error
 *
 * @example
 * ```ts
 * const companyName = validateRequiredArg(
 *   values.C,
 *   'Company name',
 *   loggers.setEnv,
 *   'Usage: bun run set-env -C company-name'
 * );
 * ```
 */
export function validateRequiredArg(
  value: unknown,
  argumentName: string,
  logger: Logger,
  usageMessage: string,
): string {
  if (!value || typeof value !== 'string') {
    logger.error(`${argumentName} required`);
    logger.info(usageMessage);
    process.exit(1);
  }
  return value;
}
