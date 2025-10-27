import { z } from 'zod';

export const TailorContextSchema = z.object({
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
});

export type TailorContext = z.infer<typeof TailorContextSchema>;

export const DocumentTypeSchema = z.enum(['resume', 'cover-letter']);

export const ThemeComponentsSchema = z.object({
  resume: z.any(),
  coverLetter: z.any(),
});

export const TailorThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  documents: z.array(DocumentTypeSchema).readonly(),
  components: ThemeComponentsSchema,
  initialize: z.function().optional(),
});

export const ThemeRegistrySchema = z.record(z.string(), TailorThemeSchema);

export const TemplateThemeEnum = z.enum(['modern', 'classic']).default('modern');
