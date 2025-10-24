import { pipe } from 'remeda';
import { match } from 'ts-pattern';

import {
  validateAndSetTailorEnvPipeline,
  type YamlFilesAndSchemasToWatch,
} from '@shared/validation/validation-pipeline';
import { parseCliArgs, validateRequiredArg } from '@shared/cli/cli-args';
import { loggers } from '@shared/core/logger';
import { TAILOR_YAML_FILES_AND_SCHEMAS } from '@shared/core/config';
import { handlePipelineError, handlePipelineSuccess } from '@shared/handlers/result-handlers';

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
const initTailorContext = (
  environmentName: string,
  yamlDocumentsToValidate: YamlFilesAndSchemasToWatch[],
): void => {
  return pipe(validateAndSetTailorEnvPipeline(environmentName, yamlDocumentsToValidate), (r) =>
    match(r)
      .with({ success: true }, ({ data }) => onSuccess(data))
      .with({ success: false }, ({ error, details, originalError, filePath }) =>
        onError(error, details, originalError, filePath),
      )
      .exhaustive(),
  );
};

/**
 * Handles successful context setup by delegating to shared success handler.
 *
 * Uses shared success handler for consistent formatting with detailed
 * context information. Process exits with code 0 after logging.
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
  handlePipelineSuccess(data, {
    logger: loggers.setEnv,
    shouldExit: true,
  });
};

/**
 * Handles pipeline errors by delegating to shared error handler.
 *
 * Uses shared error handler for consistent formatting with specialized
 * ZodError handling. Process exits with code 1 after logging.
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
  handlePipelineError(
    { success: false, error, details, originalError, filePath },
    {
      logger: loggers.setEnv,
      shouldExit: true,
    },
  );
};

// Run pipeline
initTailorContext(companyName, TAILOR_YAML_FILES_AND_SCHEMAS);
