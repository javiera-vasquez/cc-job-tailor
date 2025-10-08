import { z } from 'zod';
import { existsSync } from 'fs';
import { themes } from '../templates';

// This is the single source of truth for TailorContext
// All types and YAML generation should derive from this schema
export const TailorContextSchema = z.object({
  // Core required fields for tailor operation
  active_company: z.string().min(1, 'Company name is required'),
  company: z.string().min(1, 'Display company name is required'),
  active_template: z.string().min(1, 'Template name is required'),
  folder_path: z.string().min(1, 'Folder path is required'),
  available_files: z.array(z.string().min(1), {
    required_error: 'Available files list is required',
  }),
  position: z.string().min(1, 'Position is required'),
  primary_focus: z.string().min(1, 'Primary focus is required'),
  job_summary: z.string().optional(),
  job_details: z.object({
    company: z.string(),
    location: z.string(),
    experience_level: z.string(),
    employment_type: z.string(),
    must_have_skills: z.array(z.string()),
    nice_to_have_skills: z.array(z.string()),
    team_context: z.string(),
    user_scale: z.string(),
  }),
  last_updated: z.string().datetime('Must be valid ISO datetime'),

  // Optional display cache (deprecated - fields moved to top level)
  _display_cache: z
    .object({
      position: z.string().optional(),
      primary_focus: z.string().optional(),
      job_summary: z.string().max(100).optional(),
      job_details: z
        .object({
          company: z.string(),
          location: z.string(),
          experience_level: z.string(),
          employment_type: z.string(),
          must_have_skills: z.array(z.string()),
          nice_to_have_skills: z.array(z.string()),
          team_context: z.string(),
          user_scale: z.string(),
        })
        .optional(),
    })
    .optional(),
});

// Core required fields schema (for strict validation)
const TailorContextRequiredSchema = z.object({
  active_company: z.string().min(1, 'Company name is required'),
  active_template: z.string().min(1, 'Template name is required'),
  folder_path: z.string().min(1, 'Folder path is required'),
  available_files: z.array(z.string().min(1), {
    required_error: 'Available files list is required',
  }),
  last_updated: z.string().datetime('Must be valid ISO datetime'),
});

export type TailorContext = z.infer<typeof TailorContextSchema>;
export type TailorContextRequired = z.infer<typeof TailorContextRequiredSchema>;

// Validation result type
export type ValidationResult = {
  success: boolean;
  data?: TailorContext;
  errors: string[];
  warnings?: string[];
};

/**
 * Validates tailor context with both schema and business logic validation
 *
 * Validation layers:
 * 1. Zod schema validation (structure and types)
 * 2. File system validation (folder exists)
 * 3. Theme registry validation (template exists)
 * 4. Business logic validation (path matches company name)
 */
export function validateTailorContext(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Layer 1: Zod schema validation
  const parseResult = TailorContextSchema.safeParse(data);
  if (!parseResult.success) {
    errors.push(...parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`));
    return { success: false, errors, warnings };
  }

  const context = parseResult.data;

  // Layer 2: Validate active_company folder exists
  if (!existsSync(context.folder_path)) {
    errors.push(`Company folder does not exist: ${context.folder_path}`);
  }

  // Layer 3: Validate active_template exists in themes registry
  if (!(context.active_template in themes)) {
    const available = Object.keys(themes).join(', ');
    errors.push(`Template '${context.active_template}' not found. Available themes: ${available}`);
  }

  // Layer 4: Validate folder_path matches active_company
  const expectedPath = `resume-data/tailor/${context.active_company.toLowerCase().replace(/\s+/g, '-')}`;
  if (!context.folder_path.includes(expectedPath)) {
    warnings.push(
      `folder_path '${context.folder_path}' may not match active_company '${context.active_company}'. Expected path to include: ${expectedPath}`,
    );
  }

  // Layer 5: Validate available_files is not empty
  if (context.available_files.length === 0) {
    warnings.push('available_files is empty - no files found in company folder');
  }

  return {
    success: errors.length === 0,
    data: context,
    errors,
    warnings,
  };
}

/**
 * Strict validation - only validates required fields
 * Used by operations that only need core fields
 */
export function validateTailorContextStrict(data: unknown): ValidationResult {
  const errors: string[] = [];

  // ONLY validate required fields
  const requiredResult = TailorContextRequiredSchema.safeParse(data);

  if (!requiredResult.success) {
    errors.push('CRITICAL: Required fields missing or invalid');
    errors.push(...requiredResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`));
    return { success: false, errors };
  }

  const context = requiredResult.data;

  // Business logic validation
  if (!existsSync(context.folder_path)) {
    errors.push(`Company folder does not exist: ${context.folder_path}`);
  }

  if (!(context.active_template in themes)) {
    const available = Object.keys(themes).join(', ');
    errors.push(`Template '${context.active_template}' not found. Available themes: ${available}`);
  }

  return {
    success: errors.length === 0,
    data: context as TailorContext,
    errors,
  };
}
