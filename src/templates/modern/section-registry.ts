import type { ResumeSectionConfig, CoverLetterSectionConfig } from '@/types';

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

// Utility functions
export {
  getVisibleResumeSections,
  getVisibleResumeSectionsByColumn,
  isResumeSectionVisible,
  getVisibleCoverLetterSections,
  isCoverLetterSectionVisible,
} from '@template-core/section-utils';

/**
 * Modern template resume section configuration
 * Extends base ResumeSectionConfig with required column property
 */
export type ModernResumeSectionConfig = ResumeSectionConfig & {
  /** Column placement is required for modern template */
  column: 'left' | 'right' | 'header';
};

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
export const RESUME_SECTIONS: ModernResumeSectionConfig[] = [
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
    order: 1,
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
    order: 2,
    description: 'Technical expertise and soft skills',
  },
  {
    documentType: 'resume',
    id: 'languages',
    component: Languages,
    column: 'left',
    isVisible: (data) => (data.languages?.length ?? 0) > 0,
    order: 3,
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
    order: 4,
    description: 'Professional experience and independent projects',
  },
  {
    documentType: 'resume',
    id: 'education',
    component: Education,
    column: 'right',
    isVisible: () => true, // Always visible - required field
    order: 5,
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
    order: 0,
    description: 'Contact information and company name',
  },
  {
    documentType: 'cover-letter',
    id: 'date',
    component: DateLine,
    isVisible: () => true, // Always visible - date is required
    order: 1,
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
    order: 2,
    description: 'Cover letter title with position',
  },
  {
    documentType: 'cover-letter',
    id: 'body',
    component: Body,
    isVisible: () => true, // Always visible - opening_line and body are required
    order: 3,
    description: 'Letter opening and body paragraphs',
  },
  {
    documentType: 'cover-letter',
    id: 'signature',
    component: Signature,
    isVisible: () => true, // Always visible - signature is required
    order: 4,
    description: 'Closing signature',
  },
];
