import type { PageSize, Orientation, Bookmark } from '@react-pdf/types';
import { z } from 'zod';

import {
  ProfessionalExperienceSchema,
  IndependentProjectSchema,
  ResumeSchema as ResumeSchemaZod,
  PrimaryAreaSchema,
  JobAnalysisSchema as JobAnalysisSchemaZod,
  CoverLetterSchema as CoverLetterSchemaZod,
  JobDetailsSchema,
  MetadataSchema as MetadataSchemaZod,
  ApplicationDataSchema,
} from './zod/schemas';
import { TemplateThemeEnum } from './zod/tailor-context-schema';
import type { TailorContext as TailorContextType } from './zod/tailor-context-schema';

// Inferred types from Zod schemas
export type JobAnalysisSchema = z.infer<typeof JobAnalysisSchemaZod>;
export type ProfessionalExperience = z.infer<typeof ProfessionalExperienceSchema>;
export type IndependentProject = z.infer<typeof IndependentProjectSchema>;
export type ResumeSchema = z.infer<typeof ResumeSchemaZod>;
export type PrimaryArea = z.infer<typeof PrimaryAreaSchema>;
export type CoverLetterSchema = z.infer<typeof CoverLetterSchemaZod>;
export type JobDetails = z.infer<typeof JobDetailsSchema>;
export type MetadataSchema = z.infer<typeof MetadataSchemaZod>;
export type ApplicationData = z.infer<typeof ApplicationDataSchema>;
export type TemplateTheme = z.infer<typeof TemplateThemeEnum>;
export type TailorContext = TailorContextType;

/** @todo Investigate why these types are not covered by Zod schemas */
/** Skill identifier */
export type Skills = string;

/** Union of professional and independent project experience */
export type ExperienceItem = ProfessionalExperience | IndependentProject;

/** React-PDF document configuration */
export type ReactPDFProps = {
  size?: PageSize;
  orientation?: Orientation;
  wrap?: boolean;
  debug?: boolean;
  dpi?: number;
  bookmark?: Bookmark;
  data: ResumeSchema | CoverLetterSchema;
};

/** Resume component props */
export type ResumeComponentProps = {
  data?: ResumeSchema;
};

/** Cover letter component props */
export type CoverLetterComponentProps = {
  data?: CoverLetterSchema;
};

/** Theme component implementation */
export type ThemeComponents = {
  resume: React.ComponentType<ResumeComponentProps>;
  coverLetter: React.ComponentType<CoverLetterComponentProps>;
};

/** Supported document types */
export type DocumentType = 'resume' | 'cover-letter';

/** Theme configuration props */
export type TailorThemeProps = {
  id: string;
  name: string;
  description: string;
  documents: readonly DocumentType[];
  components: ThemeComponents;
  initialize?: () => void | Promise<void>;
};

/** Schema collection for all document types */
export type Schemas = {
  metadata: MetadataSchema;
  resume: ResumeSchema;
  job_analysis: JobAnalysisSchema;
  cover_letter: CoverLetterSchema;
};

/** Element-level visibility configuration for granular control within sections */
export type SectionElementConfig = {
  id: string;
  isVisible: (data: ResumeSchema | CoverLetterSchema) => boolean;
};

/**
 * Generic section configuration
 * @template TDocType - Document type discriminator
 * @template TData - Data schema type
 * @template TComponentProps - Component props (optional)
 */
export type SectionConfigBase<
  TDocType extends DocumentType,
  TData,
  TComponentProps extends Record<string, any> = Record<string, never>,
> = {
  documentType: TDocType;
  id: string;
  component: React.ComponentType<{ debug?: boolean } & TComponentProps>;
  isVisible: (data: TData) => boolean;
  order: number;
  description?: string;
  elements?: SectionElementConfig[];
};

/** Resume section configuration with optional column placement */
export type ResumeSectionConfig = SectionConfigBase<
  Extract<DocumentType, 'resume'>,
  ResumeSchema,
  { resume: ResumeSchema; section?: ResumeSectionConfig }
> & {
  column?: 'left' | 'right' | 'header';
};

/** Cover letter section configuration */
export type CoverLetterSectionConfig = SectionConfigBase<
  Extract<DocumentType, 'cover-letter'>,
  CoverLetterSchema,
  { data: CoverLetterSchema }
>;

/** Union of all section configurations */
export type SectionConfig = ResumeSectionConfig | CoverLetterSectionConfig;
