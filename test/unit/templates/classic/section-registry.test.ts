import { describe, test as it, expect } from 'bun:test';
import type { ResumeSchema, CoverLetterSchema } from '@/types';
import { RESUME_SECTIONS, COVER_LETTER_SECTIONS } from '@/templates/classic/section-registry';
import {
  getVisibleResumeSections,
  isResumeSectionVisible,
  getVisibleCoverLetterSections,
  isCoverLetterSectionVisible,
} from '@template-core/section-utils';

// Helper to create minimal valid resume data
const createMinimalResume = (): ResumeSchema => ({
  name: 'John Doe',
  title: 'Software Engineer',
  contact: {
    phone: '+1234567890',
    email: 'john@example.com',
  },
  professional_experience: [
    {
      company: 'Tech Corp',
      position: 'Engineer',
      location: 'City',
      duration: '2020-2023',
      achievements: [],
    },
  ],
  education: [
    {
      institution: 'University',
      program: 'Computer Science',
      location: 'City',
      duration: '2016-2020',
    },
  ],
  // Optional fields with defaults
  profile_picture: undefined,
  summary: undefined,
  technical_expertise: [],
  skills: [],
  languages: [],
  independent_projects: [],
});

// Helper to create minimal valid cover letter data
const createMinimalCoverLetter = (): CoverLetterSchema => ({
  name: 'John Doe',
  company: 'Tech Corp',
  position: 'Software Engineer',
  date: '2024-01-01',
  personal_info: {
    email: 'john@example.com',
    phone: '+1234567890',
  },
  content: {
    letter_title: 'Application for Software Engineer Position',
    opening_line: 'I am writing to express my interest...',
    body: ['First paragraph.', 'Second paragraph.'],
    signature: 'Sincerely, John Doe',
  },
});

describe('Classic Resume Section Registry', () => {
  describe('RESUME_SECTIONS configuration', () => {
    it('should have all required sections defined', () => {
      const sectionIds = RESUME_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain('header');
      expect(sectionIds).toContain('summary');
      expect(sectionIds).toContain('education');
      expect(sectionIds).toContain('experience');
      expect(sectionIds).toContain('additional');
    });

    it('should have unique section IDs', () => {
      const ids = RESUME_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have component defined for each section', () => {
      RESUME_SECTIONS.forEach((section) => {
        expect(section.component).toBeDefined();
        expect(typeof section.component).toBe('function');
      });
    });

    it('should have documentType discriminator set to resume', () => {
      RESUME_SECTIONS.forEach((section) => {
        expect(section.documentType).toBe('resume');
      });
    });

    it('should have sections ordered sequentially', () => {
      const orders = RESUME_SECTIONS.map((s) => s.order);
      // Verify orders are in ascending sequence
      for (let i = 1; i < orders.length; i++) {
        const currentOrder = orders[i];
        const previousOrder = orders[i - 1];
        if (currentOrder !== undefined && previousOrder !== undefined) {
          expect(currentOrder).toBeGreaterThan(previousOrder);
        }
      }
    });
  });

  describe('getVisibleResumeSections', () => {
    it('should return required sections with minimal data', () => {
      const data = createMinimalResume();
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      // Required sections should always be visible
      expect(visibleIds).toContain('header');
      expect(visibleIds).toContain('experience');
      expect(visibleIds).toContain('education');
    });

    it('should hide summary section when undefined', () => {
      const data = createMinimalResume();
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('summary');
    });

    it('should show summary section when defined', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        summary: 'A professional software engineer with 5 years of experience...',
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('summary');
    });

    it('should hide summary section when empty string', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        summary: '   ',
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('summary');
    });

    it('should hide additional section when all sub-sections are empty', () => {
      const data = createMinimalResume();
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('additional');
    });

    it('should show additional section when technical_expertise has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React', 'TypeScript'] }],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('additional');
    });

    it('should show additional section when skills array has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        skills: ['Communication', 'Leadership'],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('additional');
    });

    it('should show additional section when languages array has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        languages: [{ language: 'English', proficiency: 'Native' }],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('additional');
    });

    it('should hide experience section when both arrays are empty', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        professional_experience: [],
        independent_projects: [],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('experience');
    });

    it('should show experience section when only independent_projects has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        professional_experience: [],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            achievements: [],
          },
        ],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('experience');
    });

    it('should hide education section when array is empty', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        education: [],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('education');
    });

    it('should return sections in order', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        summary: 'Professional summary',
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React'] }],
      };
      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);

      // Verify sections are sorted by order property
      for (let i = 1; i < visible.length; i++) {
        const currentOrder = visible[i]?.order;
        const previousOrder = visible[i - 1]?.order;
        if (currentOrder !== undefined && previousOrder !== undefined) {
          expect(currentOrder).toBeGreaterThanOrEqual(previousOrder);
        }
      }
    });
  });

  describe('isResumeSectionVisible', () => {
    it('should return true for always-visible sections', () => {
      const data = createMinimalResume();

      expect(isResumeSectionVisible(RESUME_SECTIONS, 'header', data)).toBe(true);
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'experience', data)).toBe(true);
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'education', data)).toBe(true);
    });

    it('should return false for optional sections with no data', () => {
      const data = createMinimalResume();

      expect(isResumeSectionVisible(RESUME_SECTIONS, 'summary', data)).toBe(false);
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'additional', data)).toBe(false);
    });

    it('should return true for optional sections with data', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        summary: 'Professional summary',
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React'] }],
      };

      expect(isResumeSectionVisible(RESUME_SECTIONS, 'summary', data)).toBe(true);
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'additional', data)).toBe(true);
    });

    it('should return false for non-existent sections', () => {
      const data = createMinimalResume();
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'non-existent-section', data)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined optional arrays', () => {
      const data: any = {
        ...createMinimalResume(),
        technical_expertise: undefined,
        skills: undefined,
        languages: undefined,
        independent_projects: undefined,
      };

      expect(() => getVisibleResumeSections(RESUME_SECTIONS, data)).not.toThrow();
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'additional', data)).toBe(false);
      expect(isResumeSectionVisible(RESUME_SECTIONS, 'experience', data)).toBe(true); // Still has professional_experience
    });

    it('should handle resume with all optional fields populated', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        profile_picture: 'path/to/image.jpg',
        summary: 'A great summary',
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React'] }],
        skills: ['Communication'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            achievements: [],
          },
        ],
      };

      const visible = getVisibleResumeSections(RESUME_SECTIONS, data);
      expect(visible.length).toBe(RESUME_SECTIONS.length);
    });
  });
});

describe('Classic Cover Letter Section Registry', () => {
  describe('COVER_LETTER_SECTIONS configuration', () => {
    it('should have all required sections defined', () => {
      const sectionIds = COVER_LETTER_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain('header');
      expect(sectionIds).toContain('date');
      expect(sectionIds).toContain('title');
      expect(sectionIds).toContain('body');
      expect(sectionIds).toContain('signature');
    });

    it('should have unique section IDs', () => {
      const ids = COVER_LETTER_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have component defined for each section', () => {
      COVER_LETTER_SECTIONS.forEach((section) => {
        expect(section.component).toBeDefined();
        expect(typeof section.component).toBe('function');
      });
    });

    it('should have documentType discriminator set to cover-letter', () => {
      COVER_LETTER_SECTIONS.forEach((section) => {
        expect(section.documentType).toBe('cover-letter');
      });
    });

    it('should have sections ordered sequentially', () => {
      const orders = COVER_LETTER_SECTIONS.map((s) => s.order);
      // Verify orders are in ascending sequence
      for (let i = 1; i < orders.length; i++) {
        const currentOrder = orders[i];
        const previousOrder = orders[i - 1];
        if (currentOrder !== undefined && previousOrder !== undefined) {
          expect(currentOrder).toBeGreaterThan(previousOrder);
        }
      }
    });
  });

  describe('getVisibleCoverLetterSections', () => {
    it('should return all sections with complete data', () => {
      const data = createMinimalCoverLetter();
      const visible = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('header');
      expect(visibleIds).toContain('date');
      expect(visibleIds).toContain('title');
      expect(visibleIds).toContain('body');
      expect(visibleIds).toContain('signature');
    });

    it('should hide title section when position is empty', () => {
      const data: any = {
        ...createMinimalCoverLetter(),
        position: '',
        content: {
          ...createMinimalCoverLetter().content,
          letter_title: '',
        },
      };
      const visible = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('title');
    });

    it('should show title section when letter_title exists', () => {
      const data: CoverLetterSchema = {
        ...createMinimalCoverLetter(),
        position: '',
        content: {
          ...createMinimalCoverLetter().content,
          letter_title: 'Application for Software Engineer Position',
        },
      };
      const visible = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('title');
    });

    it('should return sections in order', () => {
      const data = createMinimalCoverLetter();
      const visible = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data);

      // Verify sections are sorted by order property
      for (let i = 1; i < visible.length; i++) {
        const currentOrder = visible[i]?.order;
        const previousOrder = visible[i - 1]?.order;
        if (currentOrder !== undefined && previousOrder !== undefined) {
          expect(currentOrder).toBeGreaterThanOrEqual(previousOrder);
        }
      }
    });
  });

  describe('isCoverLetterSectionVisible', () => {
    it('should return true for always-visible sections', () => {
      const data = createMinimalCoverLetter();

      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'header', data)).toBe(true);
      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'date', data)).toBe(true);
      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'body', data)).toBe(true);
      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'signature', data)).toBe(true);
    });

    it('should return true for title when position exists', () => {
      const data = createMinimalCoverLetter();
      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'title', data)).toBe(true);
    });

    it('should return false for title when both position and letter_title are empty', () => {
      const data: any = {
        ...createMinimalCoverLetter(),
        position: '',
        content: {
          ...createMinimalCoverLetter().content,
          letter_title: '',
        },
      };
      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'title', data)).toBe(false);
    });

    it('should return false for non-existent sections', () => {
      const data = createMinimalCoverLetter();
      expect(isCoverLetterSectionVisible(COVER_LETTER_SECTIONS, 'non-existent-section', data)).toBe(
        false,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined optional fields', () => {
      const data: any = {
        ...createMinimalCoverLetter(),
        personal_info: {
          email: 'john@example.com',
          phone: '+1234567890',
          address: undefined,
        },
      };

      expect(() => getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data)).not.toThrow();
      const visible = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data);
      expect(visible.length).toBeGreaterThan(0);
    });

    it('should handle cover letter with all optional fields populated', () => {
      const data: CoverLetterSchema = {
        ...createMinimalCoverLetter(),
        personal_info: {
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, State 12345',
        },
        content: {
          ...createMinimalCoverLetter().content,
          letter_title: 'Custom Title',
        },
      };

      const visible = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, data);
      expect(visible.length).toBe(COVER_LETTER_SECTIONS.length);
    });
  });
});
