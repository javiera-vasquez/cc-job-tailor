import type { ResumeSectionConfig, CoverLetterSectionConfig } from '@/types';

// Resume section components
import Header from './components/resume/Header';
import Summary from './components/resume/Summary';
import Additional from './components/resume/Additional';
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
  isResumeSectionVisible,
  getVisibleCoverLetterSections,
  isCoverLetterSectionVisible,
} from '@template-core/section-utils';

/**
 * Registry of all available resume sections
 * Sections are rendered in order by the `order` property
 *
 * To add a new section:
 * 1. Create component in src/templates/classic/components/resume/
 * 2. Add import at top of this file
 * 3. Add configuration to RESUME_SECTIONS array with:
 *    - Unique id
 *    - Component reference
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
    isVisible: () => true, // Always visible - contains required fields
    order: 10,
    description: 'Name and contact information',
  },

  // ========== SUMMARY SECTION ==========
  {
    documentType: 'resume',
    id: 'summary',
    component: Summary,
    isVisible: (data) => {
      return (data.summary?.trim().length ?? 0) > 0;
    },
    order: 20,
    description: 'Professional summary',
  },

  // ========== EDUCATION SECTION ==========
  {
    documentType: 'resume',
    id: 'education',
    component: Education,
    isVisible: (data) => (data.education?.length ?? 0) > 0,
    order: 30,
    description: 'Educational background',
  },

  // ========== EXPERIENCE SECTION ==========
  {
    documentType: 'resume',
    id: 'experience',
    component: Experience,
    isVisible: (data) => {
      const hasIndependentProjects = (data.independent_projects?.length ?? 0) > 0;
      const hasProfessionalExperience = (data.professional_experience?.length ?? 0) > 0;
      return hasIndependentProjects || hasProfessionalExperience;
    },
    order: 40,
    description: 'Professional experience and independent projects',
  },

  // ========== ADDITIONAL SECTION (Skills + Languages) ==========
  {
    documentType: 'resume',
    id: 'additional',
    component: Additional,
    isVisible: (data) => {
      const hasTechnicalExpertise = (data.technical_expertise?.length ?? 0) > 0;
      const hasSoftSkills = (data.skills?.length ?? 0) > 0;
      const hasLanguages = (data.languages?.length ?? 0) > 0;
      return hasTechnicalExpertise || hasSoftSkills || hasLanguages;
    },
    order: 50,
    description: 'Technical expertise, soft skills, and languages',
  },
];

/**
 * Registry of all available cover letter sections
 * Sections are rendered in order by the `order` property
 *
 * To add a new section:
 * 1. Create component in src/templates/classic/components/cover-letter/
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
