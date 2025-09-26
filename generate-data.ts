import { load } from 'js-yaml';
import { existsSync, readdirSync } from 'fs';
import { parseArgs } from 'util';
import type { ApplicationData } from './src/types';
import { validateApplicationData } from './src/zod/validation';

console.warn('🔧 Generating application data module...');

// Parse command line arguments
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    company: {
      type: 'string',
      short: 'C',
      multiple: false,
    },
  },
  strict: true,
  allowPositionals: false,
});

const companyName = values.company;

if (companyName) {
  console.warn(`🎯 Target company: "${companyName}"`);
}

// Function to provide error guidance when no company is specified
function throwNoCompanyError(): never {
  throw new Error(
    `No company specified. Resume data must be tailored for specific job applications.\n\n` +
    `To get started:\n` +
    `1. Use Claude Code to analyze a job posting\n` +
    `2. Run: @agent-job-tailor analyze job [file|url]\n` +
    `3. Then use -C flag with the company name to generate tailored resume\n\n` +
    `Example: bun run generate-data.ts -C "company-name"`
  );
}

// Function to validate and get company folder path
function getCompanyFolderPath(company: string | undefined): string | null {
  if (!company) {
    return null;
  }

  const tailorPath = './resume-data/tailor';
  const companyPath = `${tailorPath}/${company}`;

  // Check if tailor directory exists
  if (!existsSync(tailorPath)) {
    throw new Error(`Tailor directory does not exist at: ${tailorPath}`);
  }

  // Check if company folder exists
  if (!existsSync(companyPath)) {
    // List available companies
    const availableCompanies = readdirSync(tailorPath)
      .filter(name => existsSync(`${tailorPath}/${name}/resume.yaml`) ||
                      existsSync(`${tailorPath}/${name}/job_analysis.yaml`) ||
                      existsSync(`${tailorPath}/${name}/cover_letter.yaml`));

    if (availableCompanies.length > 0) {
      throw new Error(
        `Company "${company}" not found in ${tailorPath}.\n` +
        `Available companies: ${availableCompanies.join(', ')}`
      );
    } else {
      throw new Error(
        `Company "${company}" not found and no companies available in ${tailorPath}`
      );
    }
  }

  return companyPath;
}

// Load tailored data from company folder
async function loadTailoredData(companyPath: string): Promise<ApplicationData> {
  const resumePath = `${companyPath}/resume.yaml`;
  const jobAnalysisPath = `${companyPath}/job_analysis.yaml`;
  const coverLetterPath = `${companyPath}/cover_letter.yaml`;

  console.warn(`📂 Loading tailored data from: ${companyPath}`);

  const resumeFile = existsSync(resumePath)
    ? load(await Bun.file(resumePath).text())
    : null;

  const jobAnalysis = existsSync(jobAnalysisPath)
    ? load(await Bun.file(jobAnalysisPath).text())
    : null;

  const coverLetter = existsSync(coverLetterPath)
    ? load(await Bun.file(coverLetterPath).text())
    : null;

  // Log what was found
  const foundFiles = [];
  if (resumeFile) foundFiles.push('resume.yaml');
  if (jobAnalysis) foundFiles.push('job_analysis.yaml');
  if (coverLetter) foundFiles.push('cover_letter.yaml');

  if (foundFiles.length > 0) {
    console.warn(`✅ Found ${foundFiles.length} file(s): ${foundFiles.join(', ')}`);
  } else {
    console.warn(`⚠️  No data files found in ${companyPath}`);
  }

  return {
    metadata: (resumeFile as Record<string, unknown>)?.metadata,
    resume: (resumeFile as Record<string, unknown>)?.resume,
    job_analysis: (jobAnalysis as Record<string, unknown>)?.job_analysis,
    cover_letter: (coverLetter as Record<string, unknown>)?.cover_letter,
  };
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
const source = companyName
  ? `company-specific data for "${companyName}"`
  : "default source files";

const tsContent = `// @ts-nocheck
// Auto-generated application data - TypeScript validation disabled
// Company: ${companyName || 'default (merged source files)'}
// Generated at: ${new Date().toISOString()}

import type { ApplicationData } from '../types';

const applicationData: ApplicationData = ${JSON.stringify(applicationData, null, 2)};

export default applicationData;
`;

// Write the generated module
console.warn(`📝 Writing TypeScript module to src/data/application.ts...`);
await Bun.write("./src/data/application.ts", tsContent);

console.warn(`✅ Application data module generated successfully from ${source}`);