import { load } from 'js-yaml';
import { existsSync, readdirSync } from 'fs';
import type { ApplicationData } from '../../src/types';
import {
  throwCompanyNotFoundError,
  throwMissingTailorDirectoryError,
  throwNoFilesFoundError,
} from './error-messages';
import { PATHS, COMPANY_FILES, PathHelpers } from './config';
import { loggers } from './logger';

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

  const companyPath = PathHelpers.getCompanyPath(company);

  // Check if tailor directory exists
  if (!existsSync(PATHS.TAILOR_BASE)) {
    throwMissingTailorDirectoryError(PATHS.TAILOR_BASE);
  }

  // Check if company folder exists
  if (!existsSync(companyPath)) {
    // List available companies
    const availableCompanies = readdirSync(PATHS.TAILOR_BASE).filter(
      (name) =>
        existsSync(PathHelpers.getCompanyFile(name, 'METADATA')) ||
        existsSync(PathHelpers.getCompanyFile(name, 'RESUME')) ||
        existsSync(PathHelpers.getCompanyFile(name, 'JOB_ANALYSIS')) ||
        existsSync(PathHelpers.getCompanyFile(name, 'COVER_LETTER')),
    );

    throwCompanyNotFoundError(company, availableCompanies, PATHS.TAILOR_BASE);
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
  loggers.loader.info(`Loading tailored data from: ${companyPath}`);

  const metadata = await loadYamlFile(companyPath, COMPANY_FILES.METADATA);
  const resumeFile = await loadYamlFile(companyPath, COMPANY_FILES.RESUME);
  const jobAnalysis = await loadYamlFile(companyPath, COMPANY_FILES.JOB_ANALYSIS);
  const coverLetter = await loadYamlFile(companyPath, COMPANY_FILES.COVER_LETTER);

  // Log what was found
  const foundFiles = [];
  if (metadata) foundFiles.push(COMPANY_FILES.METADATA);
  if (resumeFile) foundFiles.push(COMPANY_FILES.RESUME);
  if (jobAnalysis) foundFiles.push(COMPANY_FILES.JOB_ANALYSIS);
  if (coverLetter) foundFiles.push(COMPANY_FILES.COVER_LETTER);

  if (foundFiles.length > 0) {
    loggers.loader.success(`Found ${foundFiles.length} file(s): ${foundFiles.join(', ')}`);
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
  if (!existsSync(PATHS.TAILOR_BASE)) {
    return [];
  }

  return readdirSync(PATHS.TAILOR_BASE).filter(
    (name) =>
      existsSync(PathHelpers.getCompanyFile(name, 'METADATA')) ||
      existsSync(PathHelpers.getCompanyFile(name, 'RESUME')) ||
      existsSync(PathHelpers.getCompanyFile(name, 'JOB_ANALYSIS')) ||
      existsSync(PathHelpers.getCompanyFile(name, 'COVER_LETTER')),
  );
}
