import { load } from 'js-yaml';
import { existsSync, readdirSync } from 'fs';
import type { ApplicationData } from '../../src/types';
import {
  throwCompanyNotFoundError,
  throwMissingTailorDirectoryError,
  throwNoFilesFoundError,
} from './error-messages';

const TAILOR_PATH = './resume-data/tailor';

/**
 * Get the file path for a company's tailor directory
 * @param company Company name
 * @returns Company folder path or null if company is undefined
 * @throws Error if tailor directory doesn't exist or company not found
 */
export function getCompanyFolderPath(company: string | undefined): string | null {
  if (!company) {
    return null;
  }

  const companyPath = `${TAILOR_PATH}/${company}`;

  // Check if tailor directory exists
  if (!existsSync(TAILOR_PATH)) {
    throwMissingTailorDirectoryError(TAILOR_PATH);
  }

  // Check if company folder exists
  if (!existsSync(companyPath)) {
    // List available companies
    const availableCompanies = readdirSync(TAILOR_PATH).filter(
      (name) =>
        existsSync(`${TAILOR_PATH}/${name}/metadata.yaml`) ||
        existsSync(`${TAILOR_PATH}/${name}/resume.yaml`) ||
        existsSync(`${TAILOR_PATH}/${name}/job_analysis.yaml`) ||
        existsSync(`${TAILOR_PATH}/${name}/cover_letter.yaml`),
    );

    throwCompanyNotFoundError(company, availableCompanies, TAILOR_PATH);
  }

  return companyPath;
}

/**
 * Load a specific YAML file from company folder
 * @param companyPath Path to company folder
 * @param fileName Name of YAML file (e.g., 'metadata.yaml')
 * @returns Parsed YAML data or undefined if file doesn't exist
 */
export async function loadYamlFile(
  companyPath: string,
  fileName: string,
): Promise<Record<string, unknown> | undefined> {
  const filePath = `${companyPath}/${fileName}`;

  if (!existsSync(filePath)) {
    return undefined;
  }

  const content = await Bun.file(filePath).text();
  return load(content) as Record<string, unknown>;
}

/**
 * Load all tailored data files from company folder
 * @param companyPath Path to company folder
 * @returns ApplicationData object with loaded data
 */
export async function loadTailoredData(companyPath: string): Promise<ApplicationData> {
  console.warn(`📂 Loading tailored data from: ${companyPath}`);

  const metadata = await loadYamlFile(companyPath, 'metadata.yaml');
  const resumeFile = await loadYamlFile(companyPath, 'resume.yaml');
  const jobAnalysis = await loadYamlFile(companyPath, 'job_analysis.yaml');
  const coverLetter = await loadYamlFile(companyPath, 'cover_letter.yaml');

  // Log what was found
  const foundFiles = [];
  if (metadata) foundFiles.push('metadata.yaml');
  if (resumeFile) foundFiles.push('resume.yaml');
  if (jobAnalysis) foundFiles.push('job_analysis.yaml');
  if (coverLetter) foundFiles.push('cover_letter.yaml');

  if (foundFiles.length > 0) {
    console.warn(`✅ Found ${foundFiles.length} file(s): ${foundFiles.join(', ')}`);
  } else {
    throwNoFilesFoundError(companyPath.split('/').pop() || 'unknown', companyPath);
  }

  return {
    metadata: (metadata as ApplicationData['metadata']) || null,
    resume: (resumeFile?.resume as ApplicationData['resume']) || null,
    job_analysis: (jobAnalysis?.job_analysis as ApplicationData['job_analysis']) || null,
    cover_letter: (coverLetter?.cover_letter as ApplicationData['cover_letter']) || null,
  };
}

/**
 * Get available companies from tailor directory
 * @returns Array of company names
 */
export function getAvailableCompanies(): string[] {
  if (!existsSync(TAILOR_PATH)) {
    return [];
  }

  return readdirSync(TAILOR_PATH).filter(
    (name) =>
      existsSync(`${TAILOR_PATH}/${name}/metadata.yaml`) ||
      existsSync(`${TAILOR_PATH}/${name}/resume.yaml`) ||
      existsSync(`${TAILOR_PATH}/${name}/job_analysis.yaml`) ||
      existsSync(`${TAILOR_PATH}/${name}/cover_letter.yaml`),
  );
}
