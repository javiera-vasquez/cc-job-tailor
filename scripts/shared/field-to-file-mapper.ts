/**
 * Field-to-file mapping utility
 *
 * Maps validation error field paths to their source YAML files.
 * This helps users quickly identify which file to edit when validation fails.
 *
 * Example: "resume.contact.email" → "resume.yaml"
 */

import { COMPANY_FILES } from './config';

/**
 * Map of top-level field paths to their corresponding YAML files
 */
const FIELD_TO_FILE_MAP: Record<string, string> = {
  metadata: COMPANY_FILES.METADATA,
  resume: COMPANY_FILES.RESUME,
  job_analysis: COMPANY_FILES.JOB_ANALYSIS,
  cover_letter: COMPANY_FILES.COVER_LETTER,
};

/**
 * Get the YAML filename for a given field path
 *
 * @param fieldPath - Dot-separated field path from Zod error (e.g., "resume.contact.email")
 * @returns The YAML filename (e.g., "resume.yaml") or null if not mappable
 *
 * @example
 * ```typescript
 * getFileForField("resume.contact.email") // → "resume.yaml"
 * getFileForField("metadata.company") // → "metadata.yaml"
 * getFileForField("unknown.field") // → null
 * ```
 */
export function getFileForField(fieldPath: string): string | null {
  if (!fieldPath) return null;

  // Extract the top-level field (first segment of the path)
  const topLevelField = fieldPath.split('.')[0];

  return FIELD_TO_FILE_MAP[topLevelField] || null;
}

/**
 * Get a relative file path for display in error messages
 *
 * @param companyName - The company name
 * @param fileName - The YAML filename
 * @returns Relative path for display (e.g., "resume-data/tailor/tech-corp/resume.yaml")
 */
export function getDisplayPath(companyName: string, fileName: string): string {
  return `resume-data/tailor/${companyName}/${fileName}`;
}

/**
 * Format a validation error with file location
 *
 * @param fieldPath - Dot-separated field path from Zod error
 * @param message - Error message from Zod
 * @param companyName - Company name for path display
 * @param received - Value that was received (optional)
 * @returns Formatted error message with file location
 *
 * @example
 * ```typescript
 * formatErrorWithFile(
 *   "resume.contact.email",
 *   "Required",
 *   "tech-corp",
 *   "undefined"
 * )
 * // → "  • resume.contact.email: Required (received: undefined)"
 * //    "    → in resume-data/tailor/tech-corp/resume.yaml"
 * ```
 */
export function formatErrorWithFile(
  fieldPath: string,
  message: string,
  companyName: string,
  received?: string,
): string[] {
  const lines: string[] = [];

  // Main error line
  const receivedStr = received ? ` (received: ${received})` : '';
  lines.push(`  • ${fieldPath}: ${message}${receivedStr}`);

  // File location line
  const fileName = getFileForField(fieldPath);
  if (fileName) {
    const displayPath = getDisplayPath(companyName, fileName);
    lines.push(`    → in ${displayPath}`);
  }

  return lines;
}
