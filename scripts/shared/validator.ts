import { z, type ZodSchema } from 'zod';
import { getCompanyFolderPath, loadYamlFile } from './company-loader';
import { throwNoCompanyError } from './error-messages';
import { loggers } from './logger';

export interface ValidationConfig {
  companyName: string | undefined;
  fileName: string;
  extractKey?: string;
  schema: ZodSchema;
  displayName: string;
}

/**
 * Generic validation function for company data files
 * Handles loading, extraction, validation, and error reporting
 */
export async function validateDataFile(config: ValidationConfig): Promise<void> {
  const { companyName, fileName, extractKey, schema, displayName } = config;

  loggers.validator.info(`Validating ${displayName.toLowerCase()}`);

  if (!companyName) {
    throwNoCompanyError();
  }

  loggers.validator.info(`Target company: "${companyName}"`);

  try {
    const companyPath = getCompanyFolderPath(companyName);

    if (!companyPath) {
      throwNoCompanyError();
    }

    // Load YAML file
    const yamlFile = await loadYamlFile(companyPath, fileName);

    if (!yamlFile) {
      throw new Error(`${fileName} not found in ${companyPath}`);
    }

    loggers.validator.info(`Loaded ${fileName}`);

    // Extract data if needed (some files have wrapper keys like 'resume', 'job_analysis')
    let dataToValidate: unknown = yamlFile;
    if (extractKey) {
      dataToValidate = yamlFile[extractKey];

      if (!dataToValidate) {
        throw new Error(`${fileName} does not contain a "${extractKey}" key`);
      }
    }

    // Validate against schema
    schema.parse(dataToValidate);

    loggers.validator.success(`${displayName} validation passed`);
    process.exit(0);
  } catch (error) {
    if (error instanceof z.ZodError) {
      loggers.validator.error(`${displayName} validation failed`, null, {
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
      loggers.validator.info(`💡 Fix the issues in ${fileName} and try again`);
    } else {
      loggers.validator.error('Validation error', error);
    }
    process.exit(1);
  }
}
