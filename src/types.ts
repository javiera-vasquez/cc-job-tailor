import {
  type PageSize,
  type Orientation,
  type Bookmark,
} from '@react-pdf/types';

// TYPES FOR A REACT-PDF PAGE
export type ReactPDFProps = {
  size?: PageSize,
  orientation?: Orientation,
  wrap?: boolean,
  debug?: boolean,
  dpi?: number,
  bookmark?: Bookmark,
  data: ResumeSchema | CoverLetterSchema
}

// TYPES FOR A RESUME PAGE
export type Expertise = {resume_title: string, skills: string[]};
export type Skills = string;
export type Language = {language: string, proficiency: string};

export type Education = {
  institution: string;
  degree: string;
  location: string;
  duration: string;
  description?: string;
}

export type ContactDetails = {
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  github: string;
}

export type ProfessionalExperience = {
  company: string;
  position: string;
  location: string;
  duration: string;
  company_description: string;
  linkedin: string | null;
  achievements: string[];
}

export type IndependentProject = {
  name: string;
  description: string;
  location: string;
  duration: string;
  technologies: string[];
  achievements: string[];
}

export type ResumeSchema = {
  name: string;
  profile_picture: string;
  title: string;
  summary: string;
  contact: ContactDetails;
  technical_expertise: Array<Expertise>;
  skills: Array<Skills>;
  languages: Array<Language>;
  professional_experience: Array<ProfessionalExperience>;
  independent_projects: Array<IndependentProject>;
  education: Array<Education>;
}

// Job Focus type - agnostic string type for flexibility
export type JobFocus = string;

// Job Analysis Schema types
export type JobAnalysisRequirements = {
  must_have_skills: string[];
  nice_to_have_skills: string[];
  soft_skills: string[];
  experience_years: number;
  education: string;
};

export type JobAnalysisResponsibilities = {
  primary: string[];
  secondary: string[];
};

export type JobAnalysisCompanyInfo = {
  industry: string;
  size: string;
  culture: string[];
};

export type JobAnalysisCompensation = {
  salary_range: string;
  benefits: string[];
};

export type JobAnalysisApplicationInfo = {
  posting_url: string;
  posting_date: string;
  deadline: string;
};

export type ATSAnalysis = {
  keywords_for_matching: string[];
  title_variations: string[];
  critical_phrases: string[];
  formatting_requirements: string[];
  resume_optimization_tips: string[];
};

export type JobAnalysisSchema = {
  company: string;
  position: string;
  job_focus: JobFocus;
  location: string;
  employment_type: string;
  experience_level: string;
  requirements: JobAnalysisRequirements;
  responsibilities: JobAnalysisResponsibilities;
  company_info: JobAnalysisCompanyInfo;
  compensation: JobAnalysisCompensation;
  application_info: JobAnalysisApplicationInfo;
  ats_analysis: ATSAnalysis;
};

// Cover Letter Schema types
export type CoverLetterContent = {
  letter_title: string;
  opening_line: string;
  body: string;
  signature: string;
};

export type CoverLetterSchema = {
  company: string;
  position: string;
  job_focus: JobFocus;
  date: string;
  personal_info: ContactDetails;
  content: CoverLetterContent;
};

export type MetadataSchema = {
  last_updated: string;
  company: string;
  position: string;
  transformation_decisions: string;
};

// Main Application Data type
export type ApplicationData = {
  metadata: MetadataSchema | null;
  resume: ResumeSchema | null;
  job_analysis: JobAnalysisSchema | null;
  cover_letter: CoverLetterSchema | null;
};

export type Schemas = {
  metadata: MetadataSchema;
  resume: ResumeSchema
  job_analysis: JobAnalysisSchema
  cover_letter: CoverLetterSchema
}