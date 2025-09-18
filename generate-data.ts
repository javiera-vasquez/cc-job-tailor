import { load } from 'js-yaml';
import { existsSync, readdirSync } from 'fs';
import { parseArgs } from 'util';
import type { ApplicationData, ResumeSchema } from './src/types';

console.log('Generating application data module...');

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

  console.log(`Loading tailored data from: ${companyPath}`);

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
  console.log(`Found files:`);
  if (resumeFile) console.log(`  - resume.yaml`);
  if (jobAnalysis) console.log(`  - job_analysis.yaml`);
  if (coverLetter) console.log(`  - cover_letter.yaml`);

  return {
    metadata: (resumeFile as any).metadata,
    resume: (resumeFile as any).resume,
    job_analysis: (jobAnalysis as any).job_analysis,
    cover_letter: (coverLetter as any).cover_letter,
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

// Generate TypeScript module with proper imports
const source = companyName
  ? `company-specific data for "${companyName}"`
  : "default source files";

const tsContent = `// Auto-generated application data
// Company: ${companyName || 'default (merged source files)'}
// Generated at: ${new Date().toISOString()}

import type { ApplicationData } from '../types';

const applicationData: ApplicationData = ${JSON.stringify(applicationData, null, 2)};

export default applicationData;
export const { metadata, resume, job_analysis, cover_letter } = applicationData;
`;

// Write the generated module
await Bun.write("./src/data/application.ts", tsContent);

console.log(`Application data module generated successfully from ${source}`);