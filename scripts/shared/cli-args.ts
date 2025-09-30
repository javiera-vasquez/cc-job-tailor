import { parseArgs as utilParseArgs } from 'util';

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
