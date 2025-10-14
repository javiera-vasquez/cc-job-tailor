import React from 'react';
import type { ResumeSchema } from '@/types';

// Import all section components
import Header from './components/Header';
import Contact from './components/Contact';
import Skills from './components/Skills';
import Languages from './components/Languages';
import Experience from './components/Experience';
import Education from './components/Education';

/**
 * Configuration for a single resume section
 */
export type SectionConfig = {
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
 * Registry of all available resume sections
 * Sections are rendered in order by the `order` property
 *
 * To add a new section:
 * 1. Create component in src/templates/modern/resume/components/
 * 2. Add import at top of this file
 * 3. Add configuration to RESUME_SECTIONS array with:
 *    - Unique id
 *    - Component reference
 *    - Column assignment ('left' | 'right' | 'header')
 *    - Visibility logic function
 *    - Order number (determines render position)
 * 4. Add unit tests for visibility logic
 */
export const RESUME_SECTIONS: SectionConfig[] = [
  // ========== HEADER SECTION ==========
  {
    id: 'header',
    component: Header,
    column: 'header',
    isVisible: () => true, // Always visible - contains required fields
    order: 0,
    description: 'Name, title, profile picture, and summary',
  },

  // ========== LEFT COLUMN SECTIONS ==========
  {
    id: 'contact',
    component: Contact,
    column: 'left',
    isVisible: () => true, // Always visible - phone/email are required
    order: 10,
    description: 'Contact information (phone, email, address, social links)',
  },
  {
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
    id: 'languages',
    component: Languages,
    column: 'left',
    isVisible: (data) => (data.languages?.length ?? 0) > 0,
    order: 30,
    description: 'Language proficiencies',
  },

  // ========== RIGHT COLUMN SECTIONS ==========
  {
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
    id: 'education',
    component: Education,
    column: 'right',
    isVisible: () => true, // Always visible - required field
    order: 20,
    description: 'Educational background',
  },
];

/**
 * Get all visible sections for the given data
 */
export function getVisibleSections(data: ResumeSchema): SectionConfig[] {
  return RESUME_SECTIONS.filter((section) => section.isVisible(data)).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * Get visible sections filtered by column
 */
export function getVisibleSectionsByColumn(
  data: ResumeSchema,
  column: 'left' | 'right' | 'header',
): SectionConfig[] {
  return getVisibleSections(data).filter((section) => section.column === column);
}

/**
 * Check if a specific section should be visible
 */
export function isSectionVisible(sectionId: string, data: ResumeSchema): boolean {
  const section = RESUME_SECTIONS.find((s) => s.id === sectionId);
  return section ? section.isVisible(data) : false;
}
