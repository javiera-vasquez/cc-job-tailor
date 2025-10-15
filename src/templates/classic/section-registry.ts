import type { ResumeSectionConfig, CoverLetterSectionConfig } from '@/types';

// Resume section components
import Header from './components/resume/Header';
import Summary from './components/resume/Summary';
import Experience from './components/resume/Experience';
import TechnicalSkills from './components/resume/TechnicalSkills';
import CoreCompetencies from './components/resume/CoreCompetencies';
import Education from './components/resume/Education';
import Languages from './components/resume/Languages';

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
    order: 0,
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
    order: 1,
    description: 'Professional summary - Profile',
  },

  // ========== EDUCATION SECTION ==========
  {
    documentType: 'resume',
    id: 'education',
    component: Education,
    isVisible: (data) => (data.education?.length ?? 0) > 0,
    order: 2,
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
    order: 3,
    description: 'Professional experience and independent projects',
  },

  // ========== TECHNICAL SKILLS SECTION ==========
  {
    documentType: 'resume',
    id: 'technical-skills',
    component: TechnicalSkills,
    isVisible: (data) => (data.technical_expertise?.length ?? 0) > 0,
    order: 4,
    description: 'Technical expertise and skills',
  },

  // ========== LANGUAGES SECTION ==========
  {
    documentType: 'resume',
    id: 'languages',
    component: Languages,
    isVisible: (data) => (data.languages?.length ?? 0) > 0,
    order: 5,
    description: 'Language proficiencies',
  },

  // ========== CORE COMPETENCIES SECTION ==========
  {
    documentType: 'resume',
    id: 'core-competencies',
    component: CoreCompetencies,
    isVisible: (data) => (data.skills?.length ?? 0) > 0,
    order: 6,
    description: 'Soft skills and competencies',
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
