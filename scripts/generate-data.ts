import type { ApplicationData } from '../src/types';
import { validateApplicationData } from '../src/zod/validation';
import { parseCompanyArgs } from './shared/cli-args';
import { getCompanyFolderPath, loadTailoredData } from './shared/company-loader';
import { throwNoCompanyError } from './shared/error-messages';
import { PATHS, SCRIPTS } from './shared/config';

console.warn('🔧 Generating application data module...');

// Parse command line arguments
const { company: companyName } = parseCompanyArgs();

if (companyName) {
  console.warn(`🎯 Target company: "${companyName}"`);
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
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Generate the data and TypeScript module
const applicationData = await loadApplicationData();

// Validate the generated data against TypeScript schema
console.warn('🔍 Validating application data...');
try {
  validateApplicationData(applicationData);
  console.warn('✅ Application data validation passed');
} catch {
  console.error('💡 Fix the data issues in the tailor files and try again.');
  process.exit(1);
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
console.warn(`📝 Writing TypeScript module to ${PATHS.GENERATED_DATA}...`);
await Bun.write(PATHS.GENERATED_DATA, tsContent);

// Format the generated file with Prettier
console.warn('🎨 Formatting generated file with Prettier...');
const prettierProcess = Bun.spawn(
  ['bun', 'run', SCRIPTS.PRETTIER, '--write', PATHS.GENERATED_DATA],
  {
    stdout: 'pipe',
    stderr: 'pipe',
  },
);

await prettierProcess.exited;

console.warn(`✅ Application data module generated successfully from ${source}`);
