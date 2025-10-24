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
 * Parse CLI arguments for company name (-C flag)
 * Used by generate-data, generate-pdf, and validation scripts
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
 * Parse CLI arguments for PDF generation (-C company, -D document type)
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
