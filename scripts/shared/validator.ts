import { z, type ZodSchema } from 'zod';
import { getCompanyFolderPath, loadYamlFile } from './company-loader';
import { throwNoCompanyError } from './error-messages';

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

  console.warn(`🔍 Validating ${displayName.toLowerCase()}...`);

  if (!companyName) {
    throwNoCompanyError();
  }

  console.warn(`🎯 Target company: "${companyName}"`);

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

    console.warn(`📂 Loaded ${fileName}`);

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

    console.warn(`✅ ${displayName} validation passed`);
    process.exit(0);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`❌ ${displayName} validation failed:`);
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        console.error(`  • ${path}: ${issue.message}`);
      });
      console.error(`\n💡 Fix the issues in ${fileName} and try again.`);
    } else {
      console.error(`Error: ${(error as Error).message}`);
    }
    process.exit(1);
  }
}
