import { test, expect, describe } from 'bun:test';
import {
  DocumentTypeSchema,
  ThemeComponentsSchema,
  TailorThemeSchema,
  ThemeRegistrySchema,
} from '../../src/zod/schemas';
import type { TailorThemeProps, DocumentType } from '../../src/types';
import React from 'react';

describe('Theme Validation', () => {
  describe('DocumentTypeSchema', () => {
    test('validates "resume" document type', () => {
      const result = DocumentTypeSchema.safeParse('resume');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('resume');
      }
    });

    test('validates "cover-letter" document type', () => {
      const result = DocumentTypeSchema.safeParse('cover-letter');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('cover-letter');
      }
    });

    test('rejects invalid document type', () => {
      const result = DocumentTypeSchema.safeParse('invalid-type');
      expect(result.success).toBe(false);
    });

    test('rejects empty string', () => {
      const result = DocumentTypeSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    test('rejects null and undefined', () => {
      expect(DocumentTypeSchema.safeParse(null).success).toBe(false);
      expect(DocumentTypeSchema.safeParse(undefined).success).toBe(false);
    });

    test('rejects number', () => {
      const result = DocumentTypeSchema.safeParse(123);
      expect(result.success).toBe(false);
    });
  });

  describe('ThemeComponentsSchema', () => {
    test('validates theme components with resume and coverLetter', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const validComponents = {
        resume: MockResumeComponent,
        coverLetter: MockCoverLetterComponent,
      };

      const result = ThemeComponentsSchema.safeParse(validComponents);
      expect(result.success).toBe(true);
    });

    test('accepts any type for component values (React components cannot be validated at runtime)', () => {
      const components = {
        resume: 'not-a-component',
        coverLetter: 123,
      };

      const result = ThemeComponentsSchema.safeParse(components);
      expect(result.success).toBe(true);
    });

    test('accepts components with only resume defined (z.any() allows undefined)', () => {
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const components = {
        coverLetter: MockCoverLetterComponent,
        resume: undefined, // z.any() accepts undefined
      };

      const result = ThemeComponentsSchema.safeParse(components);
      // Note: z.any() accepts any value including undefined, so this passes
      // Runtime type safety comes from TypeScript, not Zod for React components
      expect(result.success).toBe(true);
    });

    test('accepts components with only coverLetter defined (z.any() allows undefined)', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');

      const components = {
        resume: MockResumeComponent,
        coverLetter: undefined, // z.any() accepts undefined
      };

      const result = ThemeComponentsSchema.safeParse(components);
      // Note: z.any() accepts any value including undefined
      expect(result.success).toBe(true);
    });

    test('z.any() accepts even empty objects (no runtime validation)', () => {
      const result = ThemeComponentsSchema.safeParse({});
      // Note: z.any() is so permissive it even accepts missing properties
      // This is a limitation of using z.any() - we cannot validate React components at runtime
      // TypeScript provides the compile-time safety instead
      expect(result.success).toBe(true);
    });
  });

  describe('TailorThemeSchema', () => {
    test('validates complete theme configuration', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const validTheme: TailorThemeProps = {
        id: 'modern',
        name: 'Modern Theme',
        description: 'A modern, clean design',
        documents: ['resume', 'cover-letter'] as const,
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
        initialize: () => {
          console.log('Theme initialized');
        },
      };

      const result = TailorThemeSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    test('validates theme without optional initialize function', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const themeWithoutInit = {
        id: 'minimal',
        name: 'Minimal Theme',
        description: 'A minimal design',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(themeWithoutInit);
      expect(result.success).toBe(true);
    });

    test('rejects theme with empty id', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const invalidTheme = {
        id: '',
        name: 'Theme',
        description: 'Description',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    test('rejects theme with empty name', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const invalidTheme = {
        id: 'modern',
        name: '',
        description: 'Description',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    test('rejects theme with empty description', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const invalidTheme = {
        id: 'modern',
        name: 'Modern',
        description: '',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    test('rejects theme with invalid document type in array', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const invalidTheme = {
        id: 'modern',
        name: 'Modern',
        description: 'Description',
        documents: ['resume', 'invalid-doc'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    test('rejects theme with missing required fields', () => {
      const incompleteTheme = {
        id: 'modern',
        name: 'Modern',
        // Missing description, documents, components
      };

      const result = TailorThemeSchema.safeParse(incompleteTheme);
      expect(result.success).toBe(false);
    });

    test('validates theme with both document types', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const themeWithBothDocs = {
        id: 'complete',
        name: 'Complete Theme',
        description: 'Supports both documents',
        documents: ['resume', 'cover-letter'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(themeWithBothDocs);
      expect(result.success).toBe(true);
    });

    test('validates theme with only resume document', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const resumeOnlyTheme = {
        id: 'resume-only',
        name: 'Resume Only',
        description: 'Only resume support',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
      };

      const result = TailorThemeSchema.safeParse(resumeOnlyTheme);
      expect(result.success).toBe(true);
    });

    test('accepts async initialize function', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const themeWithAsyncInit = {
        id: 'async',
        name: 'Async Theme',
        description: 'Async initialization',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
        initialize: async () => {
          await Promise.resolve();
        },
      };

      const result = TailorThemeSchema.safeParse(themeWithAsyncInit);
      expect(result.success).toBe(true);
    });
  });

  describe('ThemeRegistrySchema', () => {
    test('validates theme registry with multiple themes', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const registry = {
        modern: {
          id: 'modern',
          name: 'Modern',
          description: 'Modern design',
          documents: ['resume', 'cover-letter'],
          components: {
            resume: MockResumeComponent,
            coverLetter: MockCoverLetterComponent,
          },
        },
        classic: {
          id: 'classic',
          name: 'Classic',
          description: 'Classic design',
          documents: ['resume'],
          components: {
            resume: MockResumeComponent,
            coverLetter: MockCoverLetterComponent,
          },
        },
      };

      const result = ThemeRegistrySchema.safeParse(registry);
      expect(result.success).toBe(true);
    });

    test('validates empty theme registry', () => {
      const emptyRegistry = {};
      const result = ThemeRegistrySchema.safeParse(emptyRegistry);
      expect(result.success).toBe(true);
    });

    test('rejects registry with invalid theme', () => {
      const invalidRegistry = {
        modern: {
          id: '', // Invalid: empty string
          name: 'Modern',
          description: 'Modern design',
          documents: ['resume'],
          components: {
            resume: () => {},
            coverLetter: () => {},
          },
        },
      };

      const result = ThemeRegistrySchema.safeParse(invalidRegistry);
      expect(result.success).toBe(false);
    });

    test('validates registry with single theme', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const singleThemeRegistry = {
        modern: {
          id: 'modern',
          name: 'Modern',
          description: 'Modern design',
          documents: ['resume', 'cover-letter'],
          components: {
            resume: MockResumeComponent,
            coverLetter: MockCoverLetterComponent,
          },
        },
      };

      const result = ThemeRegistrySchema.safeParse(singleThemeRegistry);
      expect(result.success).toBe(true);
    });
  });

  describe('Theme Practical Use Cases', () => {
    test('validates theme used in actual template system', () => {
      // This simulates the actual modern theme structure
      const MockResumeComponent = ({ data }: { data?: any }) =>
        React.createElement('div', null, data ? 'Resume with data' : 'Empty resume');

      const MockCoverLetterComponent = ({ data }: { data?: any }) =>
        React.createElement('div', null, data ? 'Cover letter with data' : 'Empty cover letter');

      const modernTheme = {
        id: 'modern',
        name: 'Modern',
        description: 'A clean, modern template design',
        documents: ['resume', 'cover-letter'] as DocumentType[],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
        initialize: () => {
          // Font registration would happen here
        },
      };

      const result = TailorThemeSchema.safeParse(modernTheme);
      expect(result.success).toBe(true);
    });

    test('validates theme can have undefined initialize', () => {
      const MockResumeComponent = () => React.createElement('div', null, 'Resume');
      const MockCoverLetterComponent = () => React.createElement('div', null, 'Cover Letter');

      const themeWithUndefinedInit = {
        id: 'simple',
        name: 'Simple',
        description: 'Simple theme',
        documents: ['resume'],
        components: {
          resume: MockResumeComponent,
          coverLetter: MockCoverLetterComponent,
        },
        initialize: undefined,
      };

      const result = TailorThemeSchema.safeParse(themeWithUndefinedInit);
      expect(result.success).toBe(true);
    });
  });
});
