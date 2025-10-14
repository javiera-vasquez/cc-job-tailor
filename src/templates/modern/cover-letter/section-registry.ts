import React from 'react';
import type { CoverLetterSchema } from '@/types';

// Import all section components
import Header from './components/Header';
import DateLine from './components/DateLine';
import Title from './components/Title';
import Body from './components/Body';
import Signature from './components/Signature';

/**
 * Configuration for a single cover letter section
 */
export type SectionConfig = {
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
 * Registry of all available cover letter sections
 * Sections are rendered in order by the `order` property
 *
 * To add a new section:
 * 1. Create component in src/templates/modern/cover-letter/components/
 * 2. Add import at top of this file
 * 3. Add configuration to COVER_LETTER_SECTIONS array with:
 *    - Unique id
 *    - Component reference
 *    - Visibility logic function
 *    - Order number (determines render position)
 * 4. Add unit tests for visibility logic
 */
export const COVER_LETTER_SECTIONS: SectionConfig[] = [
  {
    id: 'header',
    component: Header,
    isVisible: () => true, // Always visible - contains required fields (name, company, email, phone)
    order: 10,
    description: 'Contact information and company name',
  },
  {
    id: 'date',
    component: DateLine,
    isVisible: () => true, // Always visible - date is required
    order: 20,
    description: 'Letter date',
  },
  {
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
    id: 'body',
    component: Body,
    isVisible: () => true, // Always visible - opening_line and body are required
    order: 40,
    description: 'Letter opening and body paragraphs',
  },
  {
    id: 'signature',
    component: Signature,
    isVisible: () => true, // Always visible - signature is required
    order: 50,
    description: 'Closing signature',
  },
];

/**
 * Get all visible sections for the given data
 */
export function getVisibleSections(data: CoverLetterSchema): SectionConfig[] {
  return COVER_LETTER_SECTIONS.filter((section) => section.isVisible(data)).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * Check if a specific section should be visible
 */
export function isSectionVisible(sectionId: string, data: CoverLetterSchema): boolean {
  const section = COVER_LETTER_SECTIONS.find((s) => s.id === sectionId);
  return section ? section.isVisible(data) : false;
}
