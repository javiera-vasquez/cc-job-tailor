import { z } from 'zod';

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

export const ExpertiseSchema = z.object({
  resume_title: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
});

export const LanguageSchema = z.object({
  language: z.string().min(1),
  proficiency: z.string().min(1),
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  program: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1),
});

export const ContactDetailsSchema = z.object({
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1).optional(),
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
});

export const ProfessionalExperienceSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1),
  company_description: z.string().min(1).optional(),
  linkedin: z.string().url().nullish(),
  achievements: z.array(z.string().min(1)).optional().default([]),
});

export const IndependentProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1).optional(),
  duration: z.string().min(1).optional(),
  url: z.string().url().optional(),
  achievements: z.array(z.string().min(1)).optional().default([]),
  impact: z.string().optional(),
});

export const ResumeSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  contact: ContactDetailsSchema,
  professional_experience: z.array(ProfessionalExperienceSchema).min(1),
  education: z.array(EducationSchema).min(1),
  profile_picture: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  technical_expertise: z.array(ExpertiseSchema).optional().default([]),
  skills: z.array(z.string().min(1)).optional().default([]),
  languages: z.array(LanguageSchema).optional().default([]),
  independent_projects: z.array(IndependentProjectSchema).optional().default([]),
});

// Common primary area examples (not exhaustive):
// 'junior_engineer', 'engineer', 'senior_engineer', 'staff_engineer',
// 'principal_engineer', 'tech_lead', 'engineering_manager'
export const PrimaryAreaSchema = z.string().min(1);

// Common specialty examples (not exhaustive):
// 'ai', 'ml', 'data', 'react', 'typescript', 'node', 'python',
// 'aws', 'testing', 'architecture', 'devops', 'frontend', 'backend',
// 'mobile', 'security'
export const SpecialtySchema = z.string().min(1);

export const JobFocusItemSchema = z.object({
  primary_area: PrimaryAreaSchema,
  specialties: z.array(SpecialtySchema),
  weight: z.number().min(0).max(1),
});

// Constraint: weights must sum to 1.0
export const JobFocusSchema = z
  .array(JobFocusItemSchema)
  .min(1)
  .refine(
    (items) => {
      const sum = items.reduce((acc, item) => acc + item.weight, 0);
      return Math.abs(sum - 1.0) < 0.001; // Allow small floating point errors
    },
    {
      message: 'Job focus weights must sum to 1.0',
    },
  );

export const SkillWithPrioritySchema = z.object({
  skill: z.string().min(1),
  priority: z.number().min(1),
});

export const JobAnalysisRequirementsSchema = z.object({
  must_have_skills: z.array(SkillWithPrioritySchema),
  nice_to_have_skills: z.array(SkillWithPrioritySchema),
  soft_skills: z.array(z.string().min(1)),
  experience_years: z.number().min(0),
  education: z.string().min(1),
});

export const JobAnalysisResponsibilitiesSchema = z.object({
  primary: z.array(z.string().min(1)).min(1),
  secondary: z.array(z.string().min(1)),
});

export const JobAnalysisRoleContextSchema = z.object({
  department: z.string().min(1),
  team_size: z.string().min(1),
  key_points: z.array(z.string().min(1)),
});

export const JobAnalysisCandidateAlignmentSchema = z.object({
  strong_matches: z.array(z.string().min(1)),
  gaps_to_address: z.array(z.string().min(1)),
  transferable_skills: z.array(z.string().min(1)),
  emphasis_strategy: z.string().min(1),
});

export const JobAnalysisSectionPrioritiesSchema = z.object({
  technical_expertise: z.array(z.string().min(1)),
  experience_focus: z.string().min(1),
  project_relevance: z.string().min(1),
});

export const JobAnalysisOptimizationActionsSchema = z.object({
  LEAD_WITH: z.array(z.string().min(1)),
  EMPHASIZE: z.array(z.string().min(1)),
  QUANTIFY: z.array(z.string().min(1)),
  DOWNPLAY: z.array(z.string().min(1)),
});

export const JobAnalysisApplicationInfoSchema = z.object({
  posting_url: z.string().url(),
  posting_date: z.string().min(1),
  deadline: z.string().min(1),
});

export const ATSAnalysisSchema = z.object({
  title_variations: z.array(z.string().min(1)),
  critical_phrases: z.array(z.string().min(1)),
});

export const JobAnalysisSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  job_focus: JobFocusSchema,
  location: z.string().min(1),
  employment_type: z.string().min(1),
  experience_level: z.string().min(1),
  requirements: JobAnalysisRequirementsSchema,
  responsibilities: JobAnalysisResponsibilitiesSchema,
  role_context: JobAnalysisRoleContextSchema,
  application_info: JobAnalysisApplicationInfoSchema,
  candidate_alignment: JobAnalysisCandidateAlignmentSchema,
  section_priorities: JobAnalysisSectionPrioritiesSchema,
  optimization_actions: JobAnalysisOptimizationActionsSchema,
  ats_analysis: ATSAnalysisSchema,
});

export const CoverLetterContentSchema = z.object({
  letter_title: z.string().min(1),
  opening_line: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
  signature: z.string().min(1),
});

export const CoverLetterSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  position: z.string().min(1).optional(),
  job_focus: JobFocusSchema.optional(),
  primary_focus: z.string().min(1).optional(),
  date: z.string().min(1),
  personal_info: ContactDetailsSchema,
  content: CoverLetterContentSchema,
});

export const JobDetailsSchema = z.object({
  company: z.string().min(1),
  location: z.string().min(1),
  experience_level: z.string().min(1),
  employment_type: z.string().min(1),
  must_have_skills: z.array(z.string().min(1)),
  nice_to_have_skills: z.array(z.string().min(1)),
  team_context: z.string().min(1),
  user_scale: z.string().min(1),
});

export const MetadataSchema = z.object({
  company: z.string().min(1),
  folder_path: z.string().min(1),
  available_files: z.array(z.string().min(1)),
  position: z.string().min(1),
  primary_focus: z.string().min(1),
  job_summary: z.string().min(1),
  job_details: JobDetailsSchema,
  active_template: TemplateThemeEnum,
  last_updated: z.string().min(1),
});

// Main application data schema
export const ApplicationDataSchema = z.object({
  metadata: MetadataSchema.nullable(),
  resume: ResumeSchema.nullable(),
  job_analysis: JobAnalysisSchema.nullable(),
  cover_letter: CoverLetterSchema.nullable(),
});
