import { z } from 'zod';
import type {
  ApplicationData,
  ResumeSchema,
  JobAnalysisSchema,
  CoverLetterSchema,
  MetadataSchema
} from './types';

// Basic component schemas
export const ExpertiseSchema = z.object({
  resume_title: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1)
});

export const LanguageSchema = z.object({
  language: z.string().min(1),
  proficiency: z.string().min(1)
});

export const EducationSchema = z.object({
  institution: z.string().min(1),
  program: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1)
});

export const ContactDetailsSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  linkedin: z.string().url(),
  github: z.string().url()
});

export const ProfessionalExperienceSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1),
  company_description: z.string().min(1),
  linkedin: z.string().url().nullable(),
  achievements: z.array(z.string().min(1)).min(1)
});

export const IndependentProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  duration: z.string().min(1),
  url: z.string().url().optional(),
  achievements: z.array(z.string().min(1)).min(1),
  impact: z.string().optional()
});

// Resume schema
export const ResumeSchema = z.object({
  name: z.string().min(1),
  profile_picture: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  contact: ContactDetailsSchema,
  technical_expertise: z.array(ExpertiseSchema).min(1),
  skills: z.array(z.string().min(1)),
  languages: z.array(LanguageSchema),
  professional_experience: z.array(ProfessionalExperienceSchema),
  independent_projects: z.array(IndependentProjectSchema),
  education: z.array(EducationSchema).min(1)
});

// Job analysis enums and schemas
export const PrimaryAreaSchema = z.enum([
  'junior_engineer',
  'engineer',
  'senior_engineer',
  'staff_engineer',
  'principal_engineer',
  'tech_lead',
  'engineering_manager'
]);

export const SpecialtySchema = z.enum([
  'ai', 'ml', 'data',
  'react', 'typescript', 'node', 'python',
  'aws', 'testing', 'architecture', 'devops',
  'frontend', 'backend', 'mobile', 'security'
]);

export const JobFocusItemSchema = z.object({
  primary_area: PrimaryAreaSchema,
  specialties: z.array(SpecialtySchema),
  weight: z.number().min(0).max(1)
});

// Constraint: weights must sum to 1.0
export const JobFocusSchema = z.array(JobFocusItemSchema)
  .min(1)
  .refine(
    (items) => {
      const sum = items.reduce((acc, item) => acc + item.weight, 0);
      return Math.abs(sum - 1.0) < 0.001; // Allow small floating point errors
    },
    {
      message: "Job focus weights must sum to 1.0"
    }
  );

export const SkillWithPrioritySchema = z.object({
  skill: z.string().min(1),
  priority: z.number().min(1)
});

export const JobAnalysisRequirementsSchema = z.object({
  must_have_skills: z.array(SkillWithPrioritySchema),
  nice_to_have_skills: z.array(SkillWithPrioritySchema),
  soft_skills: z.array(z.string().min(1)),
  experience_years: z.number().min(0),
  education: z.string().min(1)
});

export const JobAnalysisResponsibilitiesSchema = z.object({
  primary: z.array(z.string().min(1)).min(1),
  secondary: z.array(z.string().min(1))
});

export const JobAnalysisRoleContextSchema = z.object({
  department: z.string().min(1),
  team_size: z.string().min(1),
  key_points: z.array(z.string().min(1))
});

export const JobAnalysisCandidateAlignmentSchema = z.object({
  strong_matches: z.array(z.string().min(1)),
  gaps_to_address: z.array(z.string().min(1)),
  transferable_skills: z.array(z.string().min(1)),
  emphasis_strategy: z.string().min(1)
});

export const JobAnalysisSectionPrioritiesSchema = z.object({
  technical_expertise: z.array(z.string().min(1)),
  experience_focus: z.string().min(1),
  project_relevance: z.string().min(1)
});

export const JobAnalysisOptimizationActionsSchema = z.object({
  LEAD_WITH: z.array(z.string().min(1)),
  EMPHASIZE: z.array(z.string().min(1)),
  QUANTIFY: z.array(z.string().min(1)),
  DOWNPLAY: z.array(z.string().min(1))
});

export const JobAnalysisApplicationInfoSchema = z.object({
  posting_url: z.string().url(),
  posting_date: z.string().min(1),
  deadline: z.string().min(1)
});

export const ATSAnalysisSchema = z.object({
  title_variations: z.array(z.string().min(1)),
  critical_phrases: z.array(z.string().min(1))
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
  ats_analysis: ATSAnalysisSchema
});

// Cover letter schemas
export const CoverLetterContentSchema = z.object({
  letter_title: z.string().min(1),
  opening_line: z.string().min(1),
  body: z.array(z.string().min(1)).min(1),
  signature: z.string().min(1)
});

export const CoverLetterSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  job_focus: JobFocusSchema,
  primary_focus: z.string().min(1),
  date: z.string().min(1),
  personal_info: ContactDetailsSchema,
  content: CoverLetterContentSchema
});

// Metadata schema
export const MetadataSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  last_updated: z.string().min(1),
  transformation_decisions: z.string().min(1),
  job_focus_used: z.string().min(1)
});

// Main application data schema
export const ApplicationDataSchema = z.object({
  metadata: MetadataSchema.nullable(),
  resume: ResumeSchema.nullable(),
  job_analysis: JobAnalysisSchema.nullable(),
  cover_letter: CoverLetterSchema.nullable()
});

// Validation functions with detailed error reporting
export function validateApplicationData(data: unknown): ApplicationData {
  try {
    return ApplicationDataSchema.parse(data);
  } catch (error) {
    // Check if it's a ZodError (can be checked by name or by issues property)
    if (error instanceof z.ZodError || (error && typeof error === 'object' && 'issues' in error)) {
      const zodError = error as z.ZodError;
      const errors = zodError.issues || zodError.errors || [];

      console.error('❌ Application data validation failed:');
      errors.forEach(err => {
        const path = err.path.join('.');
        const received = 'received' in err ? ` (received: ${err.received})` : '';
        console.error(`  • ${path}: ${err.message}${received}`);
      });

      throw new Error(`Application data validation failed with ${errors.length} error(s)`);
    } else {
      // Handle non-Zod errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Unexpected validation error:', errorMessage);
      throw new Error(`Validation error: ${errorMessage}`);
    }
  }
}

export function validateResume(data: unknown): ResumeSchema {
  try {
    return ResumeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Resume validation failed:', error.errors);
      throw new Error('Resume data validation failed');
    }
    throw error;
  }
}

export function validateJobAnalysis(data: unknown): JobAnalysisSchema {
  try {
    return JobAnalysisSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Job analysis validation failed:', error.errors);
      throw new Error('Job analysis data validation failed');
    }
    throw error;
  }
}

export function validateCoverLetter(data: unknown): CoverLetterSchema {
  try {
    return CoverLetterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Cover letter validation failed:', error.errors);
      throw new Error('Cover letter data validation failed');
    }
    throw error;
  }
}