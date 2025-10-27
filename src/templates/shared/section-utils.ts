import type {
  ResumeSchema,
  CoverLetterSchema,
  ResumeSectionConfig,
  CoverLetterSectionConfig,
} from '@/types';

/**
 * Get all visible resume sections for the given data
 */
export function getVisibleResumeSections(
  sections: ResumeSectionConfig[],
  data: ResumeSchema,
): ResumeSectionConfig[] {
  return sections.filter((section) => section.isVisible(data)).sort((a, b) => a.order - b.order);
}

/**
 * Get visible resume sections filtered by column
 * Only applicable for templates that use column-based layouts
 */
export function getVisibleResumeSectionsByColumn(
  sections: ResumeSectionConfig[],
  data: ResumeSchema,
  column: 'left' | 'right' | 'header',
): ResumeSectionConfig[] {
  return getVisibleResumeSections(sections, data).filter((section) => section.column === column);
}

/**
 * Check if a specific resume section should be visible
 */
export function isResumeSectionVisible(
  sections: ResumeSectionConfig[],
  sectionId: string,
  data: ResumeSchema,
): boolean {
  const section = sections.find((s) => s.id === sectionId);
  return section ? section.isVisible(data) : false;
}

/**
 * Get all visible cover letter sections for the given data
 */
export function getVisibleCoverLetterSections(
  sections: CoverLetterSectionConfig[],
  data: CoverLetterSchema,
): CoverLetterSectionConfig[] {
  return sections.filter((section) => section.isVisible(data)).sort((a, b) => a.order - b.order);
}

/**
 * Check if a specific cover letter section should be visible
 */
export function isCoverLetterSectionVisible(
  sections: CoverLetterSectionConfig[],
  sectionId: string,
  data: CoverLetterSchema,
): boolean {
  const section = sections.find((s) => s.id === sectionId);
  return section ? section.isVisible(data) : false;
}

/**
 * Get visibility status for a specific element within a section
 * Used for granular control over individual elements (e.g., profile picture, summary)
 * without hiding the entire section
 *
 * @param section - The section configuration
 * @param elementId - Unique identifier for the element
 * @param data - The document data (resume or cover letter)
 * @returns true if element should be visible, defaults to true if no element config exists
 *
 * @example
 * ```typescript
 * const showPicture = getElementVisibility(headerSection, 'profile-picture', resumeData);
 * ```
 */
export function getElementVisibility(
  section: ResumeSectionConfig | CoverLetterSectionConfig,
  elementId: string,
  data: ResumeSchema | CoverLetterSchema,
): boolean {
  // If section has elements config, check it
  if (section.elements) {
    const element = section.elements.find((e) => e.id === elementId);
    return element ? element.isVisible(data) : true;
  }
  // Default to visible if no elements config
  return true;
}
