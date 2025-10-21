#!/usr/bin/env bun

import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import {
  validateCompanyPath,
  validateFilePathsExists,
  loadYamlFilesFromPath,
  validateYamlFileAgainstZodSchema,
  extractMetadata,
  generateAndWriteTailorContext,
  generateApplicationData,
  chain,
  chainPipe,
  type FileToValidate,
} from './utils/tailor-context';
import { parseCliArgs, validateRequiredArg } from './shared/cli-args';
import {
  MetadataSchema,
  JobAnalysisSchema,
  ResumeSchema,
  CoverLetterSchema,
} from '../src/zod/schemas';

import { loggers } from './shared/logger';
import { PathHelpers, PATHS, COMPANY_FILES } from './shared/config';
import { z } from 'zod';

/**
 * CLI script to set tailor environment context
 * Usage: bun run set-env -C company-name
 *
 * This script validates company files, generates application data, and writes
 * the tailor context configuration for PDF generation.
 *
 * Exit codes:
 * - 0: Success (context set successfully)
 * - 1: Failure (validation or processing error)
 */

const USAGE_MESSAGE = 'Usage: bun run set-env -C company-name';

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
  loggers.setEnv,
  USAGE_MESSAGE,
);

const companyName = validateRequiredArg(values.C, 'Company name', loggers.setEnv, USAGE_MESSAGE);

// Initialize ref to yaml data and schema to validate
const pathsAndSchemaToValidate: FileToValidate[] = [
  {
    fileName: COMPANY_FILES.METADATA,
    path: PathHelpers.getCompanyFile(companyName, 'METADATA'),
    type: MetadataSchema,
    wrapperKey: null,
  },
  {
    fileName: COMPANY_FILES.JOB_ANALYSIS,
    path: PathHelpers.getCompanyFile(companyName, 'JOB_ANALYSIS'),
    type: JobAnalysisSchema,
    wrapperKey: 'job_analysis',
  },
  {
    fileName: COMPANY_FILES.RESUME,
    path: PathHelpers.getCompanyFile(companyName, 'RESUME'),
    type: ResumeSchema,
    wrapperKey: 'resume',
  },
  {
    fileName: COMPANY_FILES.COVER_LETTER,
    path: PathHelpers.getCompanyFile(companyName, 'COVER_LETTER'),
    type: CoverLetterSchema,
    wrapperKey: 'cover_letter',
  },
];

const contextPath = PATHS.CONTEXT_FILE;

/**
 * Executes the complete tailor context setup pipeline using functional composition.
 *
 * Pipeline flow:
 * 1. Validates company directory exists
 * 2. Validates all required files exist
 * 3. Loads YAML files with wrapper extraction
 * 4. Validates YAML data against Zod schemas
 * 5. Generates TypeScript application data module
 * 6. Extracts metadata from validated files
 * 7. Generates and writes tailor-context.yaml
 *
 * @returns {void} Exits process with code 0 on success, 1 on failure
 */
const initTailorContext = () => {
  return pipe(
    validateCompanyPath(PathHelpers.getCompanyPath(companyName)),
    (r) =>
      chain(r, () =>
        chainPipe(
          pathsAndSchemaToValidate,
          validateFilePathsExists,
          loadYamlFilesFromPath,
          validateYamlFileAgainstZodSchema,
        ),
      ),
    (r) =>
      chain(r, (yamlFiles) =>
        chainPipe(
          yamlFiles,
          (data) => generateApplicationData(companyName, data),
          (data) => extractMetadata(data, COMPANY_FILES.METADATA),
          (metadata) => generateAndWriteTailorContext(companyName, metadata, contextPath),
        ),
      ),
    (result) =>
      match(result)
        .with({ success: true }, ({ data }) => onSuccess(data))
        .with({ success: false }, ({ error, details, originalError, filePath }) =>
          onError(error, details, originalError, filePath),
        )
        .exhaustive(),
  );
};

/**
 * Handles successful context setup by logging results and exiting with success code.
 *
 * Displays a formatted summary including company name, file count, position,
 * primary focus, and available files. Prompts user to start the tailor-server.
 *
 * @param {Object} data - Success data from context generation
 * @param {string} data.company - Company name
 * @param {string} data.path - Company folder path
 * @param {string[]} data.availableFiles - List of available files
 * @param {string} data.position - Job position
 * @param {string} data.primaryFocus - Primary focus area
 * @param {string} data.timestamp - ISO timestamp of context creation
 * @returns {void} Exits process with code 0
 */
const onSuccess = (data: {
  company: string;
  path: string;
  availableFiles: string[];
  position: string;
  primaryFocus: string;
  timestamp: string;
}): void => {
  const fileCount = data.availableFiles?.length || 0;
  const filesList = data.availableFiles?.join(', ') || 'none';

  loggers.setEnv.success(`Context set • ${data.company} • ${fileCount} file(s)`);
  loggers.setEnv.info(`   -Path: ${data.path}`);
  loggers.setEnv.info(`   -Position: ${data.position || 'Not specified'}`);
  loggers.setEnv.info(`   -Focus: ${data.primaryFocus || 'Not specified'}`);
  loggers.setEnv.info(`   -Files: ${filesList}`);
  loggers.setEnv.info('🚀 All good, please start the tailor-server');

  process.exit(0);
};

/**
 * Handles pipeline errors by formatting and logging error details, then exits with error code.
 *
 * Provides specialized formatting for Zod validation errors with field paths and received values.
 * Falls back to generic error formatting for other error types.
 *
 * @param {string} error - Primary error message
 * @param {string} [details] - Additional error details
 * @param {unknown} [originalError] - Original error object (checked for ZodError)
 * @param {string} [filePath] - Path to file where error occurred
 * @returns {void} Exits process with code 1
 */
const onError = (
  error: string,
  details?: string,
  originalError?: unknown,
  filePath?: string,
): void => {
  match(originalError)
    .when(
      (err): err is z.ZodError => err instanceof z.ZodError,
      (zodError) => {
        loggers.setEnv.error('Application data validation failed:');

        zodError.issues.forEach((err) => {
          const path = err.path.join('.');
          const received = 'received' in err ? String(err.received) : undefined;
          const receivedStr = received ? ` (received: ${received})` : '';

          loggers.setEnv.error(`  • ${path}: ${err.message}${receivedStr}`);

          if (filePath) {
            loggers.setEnv.error(`    → in ${filePath}`);
          }
        });

        loggers.setEnv.info('💡 Fix the data issues in the tailor files and try again');
        process.exit(1);
      },
    )
    .otherwise(() => {
      loggers.setEnv.error(error);

      if (details) {
        details.split('\n').forEach((line) => {
          loggers.setEnv.error(`  ${line}`);
        });
      }

      if (filePath) {
        loggers.setEnv.error(`    → in ${filePath}`);
      }

      loggers.setEnv.info('💡 Check the error details above and try again');
      process.exit(1);
    });
};

// Run pipeline
initTailorContext();
