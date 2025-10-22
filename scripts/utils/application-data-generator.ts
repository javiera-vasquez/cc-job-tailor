import type { ApplicationData } from '../../src/types';
import type { CompanyFileValue } from '../shared/config';
import type { FileToValidateWithYamlData, Result } from '../shared/validation-pipeline';

/**
 * Derives the ApplicationData key from a YAML file name
 * Pure function: fileName → data key
 *
 * @example
 * fileNameToDataKey('metadata.yaml') → 'metadata'
 * fileNameToDataKey('resume.yaml') → 'resume'
 * fileNameToDataKey('job_analysis.yaml') → 'job_analysis'
 */
const fileNameToDataKey = (fileName: CompanyFileValue): keyof ApplicationData => {
  // Remove .yaml extension to get the ApplicationData key
  return fileName.replace('.yaml', '') as keyof ApplicationData;
};

/**
 * Transforms validated YAML files into ApplicationData structure
 * Pure function - uses fileName as single source of truth
 *
 * @param files - Array of validated files with loaded YAML data
 * @returns Result containing ApplicationData object
 *
 * @example
 * transformFilesToApplicationData([
 *   { fileName: 'metadata.yaml', data: {...}, ... },
 *   { fileName: 'resume.yaml', data: {...}, ... },
 * ])
 * → { success: true, data: { metadata: {...}, resume: {...}, ... } }
 */
export const transformFilesToApplicationData = (
  files: FileToValidateWithYamlData[],
): Result<ApplicationData> => {
  // Build ApplicationData from files using fileName as the mapping key
  const applicationData = files.reduce((acc, file) => {
    const key = fileNameToDataKey(file.fileName);
    return { ...acc, [key]: file.data };
  }, {} as ApplicationData);

  return { success: true, data: applicationData };
};

/**
 * Generates TypeScript module content with ApplicationData
 * Pure function - no side effects
 *
 * @param data - Validated ApplicationData object
 * @param companyName - Company name for comments
 * @returns TypeScript module content as string
 */
export const generateTypeScriptModule = (data: ApplicationData, companyName: string): string => {
  return `// @ts-nocheck
// Auto-generated application data - TypeScript validation disabled
// Company: ${companyName}
// Generated at: ${new Date().toISOString()}

import type { ApplicationData } from '@types';

const applicationData: ApplicationData = ${JSON.stringify(data, null, 2)};

export default applicationData;
`;
};
