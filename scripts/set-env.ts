#!/usr/bin/env bun

import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import {
  validateCompanyPath,
  validateFilePathsExists,
  loadYamlFilesFromPath,
  validateYamlFileAgainstZodSchema,
  extractMetadata,
  generateAndWriteInitialTailorContext,
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
    wrapperKey: null, // No wrapper for metadata
  },
  {
    fileName: COMPANY_FILES.JOB_ANALYSIS,
    path: PathHelpers.getCompanyFile(companyName, 'JOB_ANALYSIS'),
    type: JobAnalysisSchema,
    wrapperKey: 'job_analysis', // Extract from { job_analysis: {...} }
  },
  {
    fileName: COMPANY_FILES.RESUME,
    path: PathHelpers.getCompanyFile(companyName, 'RESUME'),
    type: ResumeSchema,
    wrapperKey: 'resume', // Extract from { resume: {...} }
  },
  {
    fileName: COMPANY_FILES.COVER_LETTER,
    path: PathHelpers.getCompanyFile(companyName, 'COVER_LETTER'),
    type: CoverLetterSchema,
    wrapperKey: 'cover_letter', // Extract from { cover_letter: {...} }
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
      chain(r, (data) =>
        chainPipe(
          data,
          (files) => generateApplicationData(companyName, files),
          (files) => extractMetadata(files, COMPANY_FILES.METADATA),
          (metadata) => generateAndWriteInitialTailorContext(companyName, metadata, contextPath),
        ),
      ),
    (result) =>
      match(result)
        .with({ success: true }, ({ data }) => onSuccess(data))
        .with({ success: false }, ({ error, details }) => onError(error, details))
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

const onError = (error: string, details?: string): void => {
  loggers.setEnv.error(error, null, details ? { details } : undefined);
  process.exit(1);
};

// Run pipeline
setTailorContextPipeline();
