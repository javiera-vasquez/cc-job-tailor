import type { Logger } from './logger';
import type { ValidationOnlySuccess } from './validation-only-pipeline';

/**
 * Options for validation success handler
 */
interface ValidationSuccessOptions {
  logger: Logger;
  shouldExit?: boolean;
}

/**
 * Handles successful validation by logging validated files.
 *
 * @param data - Validation success data
 * @param options - Handler options
 */
export const handleValidationSuccess = (
  data: ValidationOnlySuccess['data'],
  options: ValidationSuccessOptions,
): void => {
  const { logger, shouldExit = true } = options;

  const fileList = data.validatedFiles.map((f) => f.displayName).join(', ');

  logger.success(`Validation passed • ${data.validatedFiles.length} file(s): ${fileList}`);
  logger.info(`Path: ${data.path}`);

  if (shouldExit) {
    process.exit(0);
  }
};
