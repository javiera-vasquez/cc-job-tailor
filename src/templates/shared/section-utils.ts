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
