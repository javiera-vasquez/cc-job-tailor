import type { ApplicationData } from '@/types';
import type { CompanyFileValue } from '@shared/core/config';
import type { FileToValidateWithYamlData, Result } from '@shared/validation/validation-pipeline';

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
 * Transforms validated YAML files into ApplicationData structure.
 *
 * Maps each file's fileName to ApplicationData property using fileNameToDataKey.
 * fileName 'metadata.yaml' → 'metadata', 'resume.yaml' → 'resume', etc.
 * Pure function - no side effects.
 *
 * @param {FileToValidateWithYamlData[]} files - Array of validated files with loaded YAML data
 * @returns {Result<ApplicationData>} Result containing ApplicationData object
 *
 * @example
 * transformFilesToApplicationData([
 *   { fileName: 'metadata.yaml', data: {...}, ... },
 *   { fileName: 'resume.yaml', data: {...}, ... },
 * ])
 * // Returns: { success: true, data: { metadata: {...}, resume: {...}, ... } }
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
 * Generates TypeScript module content with ApplicationData.
 *
 * Creates a valid TypeScript module string with imports, typed export, and metadata comments.
 * Disables TypeScript checking (@ts-nocheck) since data is JSON serialized.
 * Pure function - no side effects.
 *
 * @param {ApplicationData} data - Validated ApplicationData object
 * @param {string} companyName - Company name for metadata comment
 * @returns {string} TypeScript module content with ApplicationData export
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
