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

// Function to merge source files into complete resume data
async function mergeSourceFiles() {
  console.log('Merging source files...');

  const sourcePath = "./data/sources";
  const resumePath = `${sourcePath}/resume.yaml`;
  const experiencePath = `${sourcePath}/professional-experience.yaml`;

  // Check if source files exist
  const missingFiles: string[] = [];
  if (!existsSync(resumePath)) {
    missingFiles.push(resumePath);
  }
  if (!existsSync(experiencePath)) {
    missingFiles.push(experiencePath);
  }

  if (missingFiles.length > 0) {
    throw new Error(
      `Required source files not found:\n${missingFiles.map(file => `- Missing: ${file}`).join('\n')}\n\n` +
      `Please ensure source files exist or use -C flag to specify a company folder.`
    );
  }

  try {
    // Load all source files
    const resumeText = await Bun.file(resumePath).text();
    const experienceText = await Bun.file(experiencePath).text();

    const resumeData = load(resumeText);
    const experienceData = load(experienceText);

    // Validate YAML parsing results
    if (!resumeData || !experienceData) {
      throw new Error("Source files contain invalid or empty YAML data");
    }

    // Merge professional experience into resume data
    (resumeData as any).professional_experience = (experienceData as any).professional_experience;

    return resumeData;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Required source files not found')) {
      // Re-throw our custom error
      throw error;
    }
    // Handle YAML parsing or file reading errors
    throw new Error(
      `Error processing source files:\n${(error as Error).message}\n\n` +
      `Please check that source files contain valid YAML data or use -C flag to specify a company folder.`
    );
  }
}

// Function to validate and get company folder path
function getCompanyFolderPath(company: string | undefined): string | null {
  if (!company) {
    return null;
  }

  const tailorPath = './data/tailor';
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

  // Extract metadata and resume data from the tailored resume file
  const metadata = resumeFile ? (resumeFile as any).metadata : null;
  const resume = resumeFile ? (resumeFile as any).resume : null;

  return {
    metadata,
    resume: resume as ResumeSchema,
    job_analysis: jobAnalysis as any,
    cover_letter: coverLetter as any
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
      // Fall back to source files (resume only)
      console.log('No company specified, using default source files...');
      const resumeData = await mergeSourceFiles();
      return {
        metadata: null,
        resume: resumeData as ResumeSchema,
        job_analysis: null,
        cover_letter: null
      };
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