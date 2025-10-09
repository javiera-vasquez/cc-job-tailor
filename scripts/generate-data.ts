import type { ApplicationData } from '../src/types';
import { validateApplicationData } from '../src/zod/validation';
import { parseCompanyArgs } from './shared/cli-args';
import { getCompanyFolderPath, loadTailoredData } from './shared/company-loader';
import { throwNoCompanyError } from './shared/error-messages';
import { handleValidationError } from './shared/validation-error-handler';
import { PATHS, SCRIPTS } from './shared/config';
import { loggers } from './shared/logger';

loggers.generate.info('Generating application data module');

// Parse command line arguments
const { company: companyName } = parseCompanyArgs();

if (companyName) {
  loggers.generate.info(`Target company: "${companyName}"`);
}

// Main data loading logic
async function loadApplicationData(): Promise<ApplicationData> {
  try {
    const companyPath = getCompanyFolderPath(companyName);

    if (companyPath) {
      // Load tailored data for specific company
      return await loadTailoredData(companyPath);
    } else {
      // No fallback - require company-specific tailored data
      throwNoCompanyError();
    }
  } catch (error) {
    loggers.generate.error('Error loading application data', error);
    process.exit(1);
  }
}

// Generate the data and TypeScript module
const applicationData = await loadApplicationData();

// Validate the generated data against TypeScript schema
loggers.generate.info('Validating application data');
try {
  validateApplicationData(applicationData);
  loggers.generate.success('Application data validation passed');
} catch (error) {
  handleValidationError(error, {
    context: 'generate-data',
    companyName: companyName || undefined,
    exitOnError: true,
    showHelpHint: true,
  });
}

// Generate TypeScript module with proper imports
const source = companyName ? `company-specific data for "${companyName}"` : 'default source files';

const tsContent = `// @ts-nocheck
// Auto-generated application data - TypeScript validation disabled
// Company: ${companyName || 'default (merged source files)'}
// Generated at: ${new Date().toISOString()}

import type { ApplicationData } from '@types';

const applicationData: ApplicationData = ${JSON.stringify(applicationData, null, 2)};

export default applicationData;
`;

// Write the generated module
loggers.generate.info(`Writing TypeScript module to ${PATHS.GENERATED_DATA}`);
await Bun.write(PATHS.GENERATED_DATA, tsContent);

// Format the generated file with Prettier
loggers.generate.info('Formatting generated file with Prettier');
const prettierProcess = Bun.spawn(
  ['bun', 'run', SCRIPTS.PRETTIER, '--write', PATHS.GENERATED_DATA],
  {
    stdout: 'pipe',
    stderr: 'pipe',
  },
);

await prettierProcess.exited;

loggers.generate.success(`Application data module generated successfully from ${source}`);
