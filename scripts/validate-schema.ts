import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import { validateTailorFilesPipeline } from '@shared/validation/tailor-check-pipeline';
import type { ValidationType, PathResolutionInput } from '@shared/validation/types';
import { loggers } from '@shared/core/logger';
import { parseCliArgs } from '@shared/cli/cli-args';
import { handlePipelineError, handleValidationSuccess } from '@shared/handlers/result-handlers';

// ============================================================================
// CLI Configuration
// ============================================================================

const USAGE_MESSAGE = `Usage:
  bun run validate:all (-C company-name | -P path)
  bun run validate:metadata (-C company-name | -P path)
  bun run validate:resume (-C company-name | -P path)
  bun run validate:job-analysis (-C company-name | -P path)
  bun run validate:cover-letter (-C company-name | -P path)`;

const VALID_TYPES: ValidationType[] = ['all', 'metadata', 'resume', 'job-analysis', 'cover-letter'];

// ============================================================================
// Parse CLI Arguments
// ============================================================================

// Parse with positional argument for validation type
const values = parseCliArgs(
  {
    args: Bun.argv.slice(2),
    options: {
      C: {
        type: 'string',
        short: 'C',
      },
      P: {
        type: 'string',
        short: 'P',
      },
    },
    strict: true,
    allowPositionals: true,
  },
  loggers.validation,
  USAGE_MESSAGE,
);

// Extract validation type from positional args
const validationType = Bun.argv[2] as ValidationType;

// Validate type argument
if (!validationType || !VALID_TYPES.includes(validationType)) {
  loggers.validation.error('Invalid validation type', null, {
    received: validationType,
    validTypes: VALID_TYPES,
  });
  loggers.validation.info(USAGE_MESSAGE);
  process.exit(1);
}

// ============================================================================
// Execute Validation Pipeline
// ============================================================================

const pathInput: PathResolutionInput = {
  companyName: values.C as string | undefined,
  customPath: values.P as string | undefined,
};

// Run pipeline and handle result
pipe(validateTailorFilesPipeline(pathInput, validationType), (result) =>
  match(result)
    .with({ success: true }, ({ data }) => {
      handleValidationSuccess(data, {
        logger: loggers.validation,
        shouldExit: true,
      });
    })
    .with({ success: false }, (error) => {
      handlePipelineError(error, {
        logger: loggers.validation,
        shouldExit: true,
      });
    })
    .exhaustive(),
);
