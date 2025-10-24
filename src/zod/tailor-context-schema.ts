import { z } from 'zod';

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

export type TailorContext = z.infer<typeof TailorContextSchema>;
