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
 * Exit codes:
 * 0 - Success (stdout contains JSON data)
 * 1 - Failure (stderr contains error message)
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

// ============================================================================
// Initialize Paths to Validate
// ============================================================================

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

// ============================================================================
// Execute context setup using functional pipe composition
// ============================================================================

const setTailorContextPipeline = () => {
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

// ============================================================================
// Success/Error Handler
// ============================================================================

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

  // Success header with emoji and key info
  loggers.setEnv.success(`Context set • ${data.company} • ${fileCount} file(s)`);

  // Display key details in a compact, scannable format
  loggers.setEnv.info(`   -Path: ${data.path}`);
  loggers.setEnv.info(`   -Position: ${data.position || 'Not specified'}`);
  loggers.setEnv.info(`   -Focus: ${data.primaryFocus || 'Not specified'}`);
  loggers.setEnv.info(`   -Files: ${filesList}`);

  // Display next action
  loggers.setEnv.info('🚀 All good, please start the tailor-server');

  process.exit(0);
};

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
        // Format Zod validation errors with detailed output
        loggers.setEnv.error('Application data validation failed:');

        zodError.issues.forEach((err) => {
          const path = err.path.join('.');
          const received = 'received' in err ? String(err.received) : undefined;
          const receivedStr = received ? ` (received: ${received})` : '';

          // Display field error
          loggers.setEnv.error(`  • ${path}: ${err.message}${receivedStr}`);

          // Display file location if available
          if (filePath) {
            loggers.setEnv.error(`    → in ${filePath}`);
          }
        });

        // Show help hint
        loggers.setEnv.info('💡 Fix the data issues in the tailor files and try again');
        process.exit(1);
      },
    )
    .otherwise(() => {
      // Fallback for other error types
      loggers.setEnv.error(error);

      // Display details if available (formatted like Zod errors)
      if (details) {
        details.split('\n').forEach((line) => {
          loggers.setEnv.error(`  ${line}`);
        });
      }

      // Display file location if available
      if (filePath) {
        loggers.setEnv.error(`    → in ${filePath}`);
      }

      // Show help hint for consistency
      loggers.setEnv.info('💡 Check the error details above and try again');
      process.exit(1);
    });
};

// Run pipeline
setTailorContextPipeline();
