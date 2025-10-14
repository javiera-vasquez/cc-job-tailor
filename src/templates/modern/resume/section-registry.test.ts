import { describe, test as it, expect } from 'bun:test';
import type { ResumeSchema } from '@/types';
import {
  RESUME_SECTIONS,
  getVisibleSections,
  getVisibleSectionsByColumn,
  isSectionVisible,
} from './section-registry';

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

describe('Section Registry', () => {
  describe('RESUME_SECTIONS configuration', () => {
    it('should have all required sections defined', () => {
      const sectionIds = RESUME_SECTIONS.map((s) => s.id);
      expect(sectionIds).toContain('header');
      expect(sectionIds).toContain('contact');
      expect(sectionIds).toContain('skills');
      expect(sectionIds).toContain('languages');
      expect(sectionIds).toContain('experience');
      expect(sectionIds).toContain('education');
    });

    it('should have unique section IDs', () => {
      const ids = RESUME_SECTIONS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have valid column assignments', () => {
      const validColumns = ['left', 'right', 'header'];
      RESUME_SECTIONS.forEach((section) => {
        expect(validColumns).toContain(section.column);
      });
    });

    it('should have component defined for each section', () => {
      RESUME_SECTIONS.forEach((section) => {
        expect(section.component).toBeDefined();
        expect(typeof section.component).toBe('function');
      });
    });
  });

  describe('getVisibleSections', () => {
    it('should return required sections with minimal data', () => {
      const data = createMinimalResume();
      const visible = getVisibleSections(data);
      const visibleIds = visible.map((s) => s.id);

      // Required sections should always be visible
      expect(visibleIds).toContain('header');
      expect(visibleIds).toContain('contact');
      expect(visibleIds).toContain('experience');
      expect(visibleIds).toContain('education');
    });

    it('should hide skills section when arrays are empty', () => {
      const data = createMinimalResume();
      const visible = getVisibleSections(data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('skills');
    });

    it('should show skills section when technical_expertise has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React', 'TypeScript'] }],
      };
      const visible = getVisibleSections(data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('skills');
    });

    it('should show skills section when skills array has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        skills: ['Communication', 'Leadership'],
      };
      const visible = getVisibleSections(data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('skills');
    });

    it('should hide languages section when array is empty', () => {
      const data = createMinimalResume();
      const visible = getVisibleSections(data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).not.toContain('languages');
    });

    it('should show languages section when array has items', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        languages: [{ language: 'English', proficiency: 'Native' }],
      };
      const visible = getVisibleSections(data);
      const visibleIds = visible.map((s) => s.id);

      expect(visibleIds).toContain('languages');
    });

    it('should return sections in order', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React'] }],
        languages: [{ language: 'English', proficiency: 'Native' }],
      };
      const visible = getVisibleSections(data);

      // Verify sections are sorted by order property
      for (let i = 1; i < visible.length; i++) {
        expect(visible[i]!.order).toBeGreaterThanOrEqual(visible[i - 1]!.order);
      }
    });
  });

  describe('getVisibleSectionsByColumn', () => {
    it('should return only header sections', () => {
      const data = createMinimalResume();
      const headerSections = getVisibleSectionsByColumn(data, 'header');

      expect(headerSections.length).toBeGreaterThan(0);
      headerSections.forEach((section) => {
        expect(section.column).toBe('header');
      });
    });

    it('should return only left column sections', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        skills: ['Communication'],
        languages: [{ language: 'English', proficiency: 'Native' }],
      };
      const leftSections = getVisibleSectionsByColumn(data, 'left');

      expect(leftSections.length).toBeGreaterThan(0);
      leftSections.forEach((section) => {
        expect(section.column).toBe('left');
      });

      const leftIds = leftSections.map((s) => s.id);
      expect(leftIds).toContain('contact');
      expect(leftIds).toContain('skills');
      expect(leftIds).toContain('languages');
    });

    it('should return only right column sections', () => {
      const data = createMinimalResume();
      const rightSections = getVisibleSectionsByColumn(data, 'right');

      expect(rightSections.length).toBeGreaterThan(0);
      rightSections.forEach((section) => {
        expect(section.column).toBe('right');
      });

      const rightIds = rightSections.map((s) => s.id);
      expect(rightIds).toContain('experience');
      expect(rightIds).toContain('education');
    });

    it('should maintain order within column', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React'] }],
        languages: [{ language: 'English', proficiency: 'Native' }],
      };
      const leftSections = getVisibleSectionsByColumn(data, 'left');

      // Verify order
      for (let i = 1; i < leftSections.length; i++) {
        expect(leftSections[i]!.order).toBeGreaterThanOrEqual(leftSections[i - 1]!.order);
      }
    });
  });

  describe('isSectionVisible', () => {
    it('should return true for always-visible sections', () => {
      const data = createMinimalResume();

      expect(isSectionVisible('header', data)).toBe(true);
      expect(isSectionVisible('contact', data)).toBe(true);
      expect(isSectionVisible('experience', data)).toBe(true);
      expect(isSectionVisible('education', data)).toBe(true);
    });

    it('should return false for optional sections with no data', () => {
      const data = createMinimalResume();

      expect(isSectionVisible('skills', data)).toBe(false);
      expect(isSectionVisible('languages', data)).toBe(false);
    });

    it('should return true for optional sections with data', () => {
      const data: ResumeSchema = {
        ...createMinimalResume(),
        technical_expertise: [{ resume_title: 'Frontend', skills: ['React'] }],
        languages: [{ language: 'English', proficiency: 'Native' }],
      };

      expect(isSectionVisible('skills', data)).toBe(true);
      expect(isSectionVisible('languages', data)).toBe(true);
    });

    it('should return false for non-existent sections', () => {
      const data = createMinimalResume();
      expect(isSectionVisible('non-existent-section', data)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined optional arrays', () => {
      const data: any = {
        ...createMinimalResume(),
        technical_expertise: undefined,
        skills: undefined,
        languages: undefined,
      };

      expect(() => getVisibleSections(data)).not.toThrow();
      expect(isSectionVisible('skills', data)).toBe(false);
      expect(isSectionVisible('languages', data)).toBe(false);
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

      const visible = getVisibleSections(data);
      expect(visible.length).toBe(RESUME_SECTIONS.length);
    });
  });
});
