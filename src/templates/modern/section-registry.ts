import React from 'react';
import type { ResumeSchema, CoverLetterSchema } from '@/types';

// Resume section components
import Header from './components/resume/Header';
import Contact from './components/resume/Contact';
import Skills from './components/resume/Skills';
import Languages from './components/resume/Languages';
import Experience from './components/resume/Experience';
import Education from './components/resume/Education';

// Cover letter section components
import CoverLetterHeader from './components/cover-letter/Header';
import DateLine from './components/cover-letter/DateLine';
import Title from './components/cover-letter/Title';
import Body from './components/cover-letter/Body';
import Signature from './components/cover-letter/Signature';

/**
 * Configuration for a resume section
 */
export type ResumeSectionConfig = {
  /** Document type discriminator */
  documentType: 'resume';

  /** Unique identifier for the section */
  id: string;

  /** React component to render */
  component: React.ComponentType<{ resume: ResumeSchema; debug?: boolean }>;

  /** Column placement in the resume layout */
  column: 'left' | 'right' | 'header';

  /** Function to determine if section should be visible */
  isVisible: (data: ResumeSchema) => boolean;

  /** Render order within the column (lower numbers render first) */
  order: number;

  /** Optional description for debugging/documentation */
  description?: string;
};

/**
 * Configuration for a cover letter section
 */
export type CoverLetterSectionConfig = {
  /** Document type discriminator */
  documentType: 'cover-letter';

  /** Unique identifier for the section */
  id: string;

  /** React component to render */
  component: React.ComponentType<{ data: CoverLetterSchema; debug?: boolean }>;

  /** Function to determine if section should be visible */
  isVisible: (data: CoverLetterSchema) => boolean;

  /** Render order (lower numbers render first) */
  order: number;

  /** Optional description for debugging/documentation */
  description?: string;
};

/**
 * Union type for all section configurations
 */
export type SectionConfig = ResumeSectionConfig | CoverLetterSectionConfig;

/**
 * Registry of all available resume sections
 * Sections are rendered in order by the `order` property
 *
 * To add a new section:
 * 1. Create component in src/templates/modern/components/resume/
 * 2. Add import at top of this file
 * 3. Add configuration to RESUME_SECTIONS array with:
 *    - Unique id
 *    - Component reference
 *    - Column assignment ('left' | 'right' | 'header')
 *    - Visibility logic function
 *    - Order number (determines render position)
 * 4. Add unit tests for visibility logic
 */
export const RESUME_SECTIONS: ResumeSectionConfig[] = [
  // ========== HEADER SECTION ==========
  {
    documentType: 'resume',
    id: 'header',
    component: Header,
    column: 'header',
    isVisible: () => true, // Always visible - contains required fields
    order: 0,
    description: 'Name, title, profile picture, and summary',
  },

  // ========== LEFT COLUMN SECTIONS ==========
  {
    documentType: 'resume',
    id: 'contact',
    component: Contact,
    column: 'left',
    isVisible: () => true, // Always visible - phone/email are required
    order: 10,
    description: 'Contact information (phone, email, address, social links)',
  },
  {
    documentType: 'resume',
    id: 'skills',
    component: Skills,
    column: 'left',
    isVisible: (data) => {
      const hasTechnicalExpertise = (data.technical_expertise?.length ?? 0) > 0;
      const hasSoftSkills = (data.skills?.length ?? 0) > 0;
      return hasTechnicalExpertise || hasSoftSkills;
    },
    order: 20,
    description: 'Technical expertise and soft skills',
  },
  {
    documentType: 'resume',
    id: 'languages',
    component: Languages,
    column: 'left',
    isVisible: (data) => (data.languages?.length ?? 0) > 0,
    order: 30,
    description: 'Language proficiencies',
  },

  // ========== RIGHT COLUMN SECTIONS ==========
  {
    documentType: 'resume',
    id: 'experience',
    component: Experience,
    column: 'right',
    isVisible: (data) => {
      const hasIndependentProjects = (data.independent_projects?.length ?? 0) > 0;
      const hasProfessionalExperience = (data.professional_experience?.length ?? 0) > 0;
      return hasIndependentProjects || hasProfessionalExperience;
    },
    order: 10,
    description: 'Professional experience and independent projects',
  },
  {
    documentType: 'resume',
    id: 'education',
    component: Education,
    column: 'right',
    isVisible: () => true, // Always visible - required field
    order: 20,
    description: 'Educational background',
  },
];

/**
 * Registry of all available cover letter sections
 * Sections are rendered in order by the `order` property
 *
 * To add a new section:
 * 1. Create component in src/templates/modern/components/cover-letter/
 * 2. Add import at top of this file
 * 3. Add configuration to COVER_LETTER_SECTIONS array with:
 *    - Unique id
 *    - Component reference
 *    - Visibility logic function
 *    - Order number (determines render position)
 * 4. Add unit tests for visibility logic
 */
export const COVER_LETTER_SECTIONS: CoverLetterSectionConfig[] = [
  {
    documentType: 'cover-letter',
    id: 'header',
    component: CoverLetterHeader,
    isVisible: () => true, // Always visible - contains required fields (name, company, email, phone)
    order: 10,
    description: 'Contact information and company name',
  },
  {
    documentType: 'cover-letter',
    id: 'date',
    component: DateLine,
    isVisible: () => true, // Always visible - date is required
    order: 20,
    description: 'Letter date',
  },
  {
    documentType: 'cover-letter',
    id: 'title',
    component: Title,
    isVisible: (data) => {
      // Visible if position exists OR if letter_title exists
      const hasPosition = (data.position?.length ?? 0) > 0;
      const hasLetterTitle = (data.content.letter_title?.length ?? 0) > 0;
      return hasPosition || hasLetterTitle;
    },
    order: 30,
    description: 'Cover letter title with position',
  },
  {
    documentType: 'cover-letter',
    id: 'body',
    component: Body,
    isVisible: () => true, // Always visible - opening_line and body are required
    order: 40,
    description: 'Letter opening and body paragraphs',
  },
  {
    documentType: 'cover-letter',
    id: 'signature',
    component: Signature,
    isVisible: () => true, // Always visible - signature is required
    order: 50,
    description: 'Closing signature',
  },
];

/**
 * Get all visible resume sections for the given data
 */
export function getVisibleResumeSections(data: ResumeSchema): ResumeSectionConfig[] {
  return RESUME_SECTIONS.filter((section) => section.isVisible(data)).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * Get visible resume sections filtered by column
 */
export function getVisibleResumeSectionsByColumn(
  data: ResumeSchema,
  column: 'left' | 'right' | 'header',
): ResumeSectionConfig[] {
  return getVisibleResumeSections(data).filter((section) => section.column === column);
}

/**
 * Check if a specific resume section should be visible
 */
export function isResumeSectionVisible(sectionId: string, data: ResumeSchema): boolean {
  const section = RESUME_SECTIONS.find((s) => s.id === sectionId);
  return section ? section.isVisible(data) : false;
}

/**
 * Get all visible cover letter sections for the given data
 */
export function getVisibleCoverLetterSections(data: CoverLetterSchema): CoverLetterSectionConfig[] {
  return COVER_LETTER_SECTIONS.filter((section) => section.isVisible(data)).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * Check if a specific cover letter section should be visible
 */
export function isCoverLetterSectionVisible(sectionId: string, data: CoverLetterSchema): boolean {
  const section = COVER_LETTER_SECTIONS.find((s) => s.id === sectionId);
  return section ? section.isVisible(data) : false;
}
