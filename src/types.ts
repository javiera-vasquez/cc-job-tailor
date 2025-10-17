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
  TemplateThemeEnum,
} from './zod/schemas';
import type { TailorContext as TailorContextType } from './zod/tailor-context-schema';

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
export type TemplateTheme = z.infer<typeof TemplateThemeEnum>;
export type TailorContext = TailorContextType;

// TODO: Investigate why these types are not covered by Zod schemas - root cause
// Additional types not covered by Zod schemas
export type Skills = string;
// Union type for Experience component that can handle both types
export type ExperienceItem = ProfessionalExperience | IndependentProject;

// ========== DOCUMENT TYPE ==========
// TYPES FOR A REACT-PDF PAGE - HOC
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

/**
 * Document types supported by the application
 */
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

// ========== SECTION REGISTRY TYPES ==========

/**
 * Configuration for element-level visibility within a section
 * Allows granular control over individual elements (e.g., profile picture, summary)
 * without hiding the entire section
 */
export type SectionElementConfig = {
  /** Unique identifier for the element within the section */
  id: string;

  /** Function to determine if element should be visible */
  isVisible: (data: ResumeSchema | CoverLetterSchema) => boolean;
};

/**
 * Generic base configuration for document sections
 *
 * @template TDocType - The document type discriminator (e.g., 'resume' | 'cover-letter')
 * @template TData - The data schema type for this document
 * @template TComponentProps - Additional props for the component (optional)
 *
 * @example
 * ```typescript
 * // Creating a new document section config
 * type InvoiceSectionConfig = SectionConfigBase<
 *   Extract<DocumentType, 'invoice'>,
 *   InvoiceSchema,
 *   { currency?: string }
 * >;
 * ```
 */
export type SectionConfigBase<
  TDocType extends DocumentType,
  TData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TComponentProps extends Record<string, any> = Record<string, never>,
> = {
  /** Document type discriminator */
  documentType: TDocType;

  /** Unique identifier for the section */
  id: string;

  /** React component to render */
  component: React.ComponentType<{ debug?: boolean } & TComponentProps>;

  /** Function to determine if section should be visible */
  isVisible: (data: TData) => boolean;

  /** Render order (lower numbers render first) */
  order: number;

  /** Optional description for debugging/documentation */
  description?: string;

  /** Optional element-level visibility configuration for granular control within section */
  elements?: SectionElementConfig[];
};

/**
 * Configuration for a resume section
 * Extends base with resume-specific properties
 */
export type ResumeSectionConfig = SectionConfigBase<
  Extract<DocumentType, 'resume'>,
  ResumeSchema,
  { resume: ResumeSchema; section?: ResumeSectionConfig }
> & {
  /** Column placement in the resume layout (optional - only for templates that use columns) */
  column?: 'left' | 'right' | 'header';
};

/**
 * Configuration for a cover letter section
 */
export type CoverLetterSectionConfig = SectionConfigBase<
  Extract<DocumentType, 'cover-letter'>,
  CoverLetterSchema,
  { data: CoverLetterSchema }
>;

/**
 * Union type for all section configurations
 */
export type SectionConfig = ResumeSectionConfig | CoverLetterSectionConfig;
