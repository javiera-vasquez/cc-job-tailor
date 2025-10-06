import type { PageSize, Orientation, Bookmark } from '@react-pdf/types';
import { z } from 'zod';

import {
  ExpertiseSchema,
  LanguageSchema,
  EducationSchema,
  ContactDetailsSchema,
  ProfessionalExperienceSchema,
  IndependentProjectSchema,
  ResumeSchema as ResumeSchemaZod,
  PrimaryAreaSchema,
  SpecialtySchema,
  JobFocusItemSchema,
  JobFocusSchema,
  SkillWithPrioritySchema,
  JobAnalysisRequirementsSchema,
  JobAnalysisResponsibilitiesSchema,
  JobAnalysisRoleContextSchema,
  JobAnalysisCandidateAlignmentSchema,
  JobAnalysisSectionPrioritiesSchema,
  JobAnalysisOptimizationActionsSchema,
  JobAnalysisApplicationInfoSchema,
  ATSAnalysisSchema,
  JobAnalysisSchema as JobAnalysisSchemaZod,
  CoverLetterContentSchema,
  CoverLetterSchema as CoverLetterSchemaZod,
  JobDetailsSchema,
  MetadataSchema as MetadataSchemaZod,
  ApplicationDataSchema,
} from './zod/schemas';

// Inferred types from Zod schemas
export type Expertise = z.infer<typeof ExpertiseSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type ContactDetails = z.infer<typeof ContactDetailsSchema>;
export type ProfessionalExperience = z.infer<typeof ProfessionalExperienceSchema>;
export type IndependentProject = z.infer<typeof IndependentProjectSchema>;
export type ResumeSchema = z.infer<typeof ResumeSchemaZod>;
export type PrimaryArea = z.infer<typeof PrimaryAreaSchema>;
export type Specialty = z.infer<typeof SpecialtySchema>;
export type JobFocusItem = z.infer<typeof JobFocusItemSchema>;
export type JobFocus = z.infer<typeof JobFocusSchema>;
export type SkillWithPriority = z.infer<typeof SkillWithPrioritySchema>;
export type JobAnalysisRequirements = z.infer<typeof JobAnalysisRequirementsSchema>;
export type JobAnalysisResponsibilities = z.infer<typeof JobAnalysisResponsibilitiesSchema>;
export type JobAnalysisRoleContext = z.infer<typeof JobAnalysisRoleContextSchema>;
export type JobAnalysisCandidateAlignment = z.infer<typeof JobAnalysisCandidateAlignmentSchema>;
export type JobAnalysisSectionPriorities = z.infer<typeof JobAnalysisSectionPrioritiesSchema>;
export type JobAnalysisOptimizationActions = z.infer<typeof JobAnalysisOptimizationActionsSchema>;
export type JobAnalysisApplicationInfo = z.infer<typeof JobAnalysisApplicationInfoSchema>;
export type ATSAnalysis = z.infer<typeof ATSAnalysisSchema>;
export type JobAnalysisSchema = z.infer<typeof JobAnalysisSchemaZod>;
export type CoverLetterContent = z.infer<typeof CoverLetterContentSchema>;
export type CoverLetterSchema = z.infer<typeof CoverLetterSchemaZod>;
export type JobDetails = z.infer<typeof JobDetailsSchema>;
export type MetadataSchema = z.infer<typeof MetadataSchemaZod>;
export type ApplicationData = z.infer<typeof ApplicationDataSchema>;

// TODO: Investigate why these types are not covered by Zod schemas - root cause
// Additional types not covered by Zod schemas
export type Skills = string;
// Union type for Experience component that can handle both types
export type ExperienceItem = ProfessionalExperience | IndependentProject;

// TYPES FOR A REACT-PDF PAGE
export type ReactPDFProps = {
  size?: PageSize;
  orientation?: Orientation;
  wrap?: boolean;
  debug?: boolean;
  dpi?: number;
  bookmark?: Bookmark;
  data: ResumeSchema | CoverLetterSchema;
};

// Component prop types for theme components
export type ResumeComponentProps = {
  data?: ResumeSchema;
};

export type CoverLetterComponentProps = {
  data?: CoverLetterSchema;
};

// Strict theme component types
export type ThemeComponents = {
  resume: React.ComponentType<ResumeComponentProps>;
  coverLetter: React.ComponentType<CoverLetterComponentProps>;
};

export type DocumentType = 'resume' | 'cover-letter';

export type TailorThemeProps = {
  id: string;
  name: string;
  description: string;
  documents: readonly DocumentType[];
  components: ThemeComponents;
  initialize?: () => void | Promise<void>;
};

export type Schemas = {
  metadata: MetadataSchema;
  resume: ResumeSchema;
  job_analysis: JobAnalysisSchema;
  cover_letter: CoverLetterSchema;
};
