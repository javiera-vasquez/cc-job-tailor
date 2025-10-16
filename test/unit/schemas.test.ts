import { test, expect, describe } from 'bun:test';
import {
  ApplicationDataSchema,
  JobFocusSchema,
  ContactDetailsSchema,
  ResumeSchema,
  MetadataSchema,
} from '../../src/zod/schemas';
import {
  createValidApplicationData,
  createValidJobFocus,
  createInvalidJobFocus,
  createMinimalValidApplicationData,
} from '../helpers/test-utils';

describe('Zod Schema Validation', () => {
  describe('ApplicationDataSchema', () => {
    test('validates complete application data successfully', () => {
      const validData = createValidApplicationData();
      const result = ApplicationDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    test('validates minimal application data with nulls', () => {
      const minimalData = createMinimalValidApplicationData();
      const result = ApplicationDataSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
    });

    test('accepts null values for all optional sections', () => {
      const dataWithNulls = {
        metadata: null,
        resume: null,
        job_analysis: null,
        cover_letter: null,
      };

      const result = ApplicationDataSchema.safeParse(dataWithNulls);
      expect(result.success).toBe(true);
    });

    test('rejects when missing required top-level properties', () => {
      const incompleteData = {
        metadata: null,
        resume: null,
        // Missing job_analysis and cover_letter
      };

      const result = ApplicationDataSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('JobFocusSchema - Critical Business Rule', () => {
    test('validates when job focus weights sum to exactly 1.0', () => {
      const validJobFocus = createValidJobFocus();
      const result = JobFocusSchema.safeParse(validJobFocus);

      expect(result.success).toBe(true);
    });

    test('validates when weights sum to 1.0 with floating point precision', () => {
      const jobFocusWithPrecision = [
        {
          primary_area: 'engineer' as const,
          specialties: ['react' as const],
          weight: 0.333333,
        },
        {
          primary_area: 'senior_engineer' as const,
          specialties: ['python' as const],
          weight: 0.333333,
        },
        {
          primary_area: 'tech_lead' as const,
          specialties: ['architecture' as const],
          weight: 0.333334,
        },
      ];

      const result = JobFocusSchema.safeParse(jobFocusWithPrecision);
      expect(result.success).toBe(true);
    });

    test('rejects when job focus weights do not sum to 1.0', () => {
      const invalidJobFocus = createInvalidJobFocus();
      const result = JobFocusSchema.safeParse(invalidJobFocus);

      expect(result.success).toBe(false);

      if (!result.success) {
        const weightError = result.error.issues.find((issue) =>
          issue.message.includes('Job focus weights must sum to 1.0'),
        );
        expect(weightError).toBeDefined();
      }
    });

    test('rejects when weights sum is significantly off (> 0.001 tolerance)', () => {
      const badJobFocus = [
        {
          primary_area: 'engineer' as const,
          specialties: ['react' as const],
          weight: 0.5,
        },
        {
          primary_area: 'senior_engineer' as const,
          specialties: ['python' as const],
          weight: 0.4, // Sum = 0.9, difference = 0.1 > 0.001
        },
      ];

      const result = JobFocusSchema.safeParse(badJobFocus);
      expect(result.success).toBe(false);
    });

    test('requires at least one job focus item', () => {
      const emptyJobFocus: unknown[] = [];
      const result = JobFocusSchema.safeParse(emptyJobFocus);

      expect(result.success).toBe(false);
    });

    test('validates individual job focus item properties', () => {
      const validJobFocusItem = [
        {
          primary_area: 'custom_role', // Any string is now valid
          specialties: ['react', 'custom_specialty'],
          weight: 1.0,
        },
      ];

      const result = JobFocusSchema.safeParse(validJobFocusItem);
      expect(result.success).toBe(true);
    });
  });

  describe('ContactDetailsSchema', () => {
    test('validates correct email format', () => {
      const validContact = {
        phone: '+1-234-567-8900',
        email: 'valid@example.com',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
      };

      const result = ContactDetailsSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    test('rejects invalid email format', () => {
      const invalidContact = {
        phone: '+1-234-567-8900',
        email: 'invalid-email-format',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
      };

      const result = ContactDetailsSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    test('validates URL format for linkedin and github', () => {
      const validContact = {
        phone: '+1-234-567-8900',
        email: 'test@example.com',
        address: '123 Main St',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
      };

      const result = ContactDetailsSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    test('rejects invalid URL format for linkedin', () => {
      const invalidContact = {
        phone: '+1-234-567-8900',
        email: 'test@example.com',
        address: '123 Main St',
        linkedin: 'not-a-valid-url',
        github: 'https://github.com/johndoe',
      };

      const result = ContactDetailsSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });
  });

  describe('ResumeSchema', () => {
    test('validates complete resume data', () => {
      const validData = createValidApplicationData();
      if (validData.resume) {
        const result = ResumeSchema.safeParse(validData.resume);
        expect(result.success).toBe(true);
      }
    });

    test('allows empty arrays for optional sections', () => {
      const validData = createValidApplicationData();
      if (validData.resume) {
        // Test empty technical_expertise array - now allowed
        const resumeWithEmptyExpertise = {
          ...validData.resume,
          technical_expertise: [],
          skills: [],
          languages: [],
          independent_projects: [],
        };

        const result = ResumeSchema.safeParse(resumeWithEmptyExpertise);
        expect(result.success).toBe(true);
      }
    });

    test('requires non-empty strings for required fields', () => {
      const validData = createValidApplicationData();
      if (validData.resume) {
        const resumeWithEmptyName = {
          ...validData.resume,
          name: '',
        };

        const result = ResumeSchema.safeParse(resumeWithEmptyName);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('MetadataSchema', () => {
    test('validates complete metadata with active_template', () => {
      const validMetadata = {
        company: 'test-company',
        folder_path: 'resume-data/tailor/test-company',
        available_files: ['metadata.yaml', 'resume.yaml', 'job_analysis.yaml'],
        position: 'Software Engineer',
        primary_focus: 'engineer + [react, typescript]',
        job_summary: 'Test company building modern applications',
        job_details: {
          company: 'Test Company',
          location: 'Remote',
          experience_level: 'Mid-level',
          employment_type: 'Full-time',
          must_have_skills: ['JavaScript', 'React'],
          nice_to_have_skills: ['Node.js'],
          team_context: 'Small team',
          user_scale: '1000 users',
        },
        active_template: 'modern',
        last_updated: '2024-01-01T00:00:00Z',
      };

      const result = MetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active_template).toBe('modern');
      }
    });

    test('requires all metadata fields to be non-empty strings', () => {
      const incompleteMetadata = {
        company: '', // Empty string should fail
        folder_path: 'resume-data/tailor/test',
        available_files: ['metadata.yaml'],
        position: 'Software Engineer',
        primary_focus: 'engineer',
        job_summary: 'Test summary',
        job_details: {
          company: 'Test Company',
          location: 'Remote',
          experience_level: 'Mid',
          employment_type: 'Full-time',
          must_have_skills: ['JS'],
          nice_to_have_skills: [],
          team_context: 'Team',
          user_scale: '100',
        },
        active_template: 'modern',
        last_updated: '2024-01-01',
      };

      const result = MetadataSchema.safeParse(incompleteMetadata);
      expect(result.success).toBe(false);
    });

    test('accepts "modern" as valid active_template value', () => {
      const metadataWithModern = {
        company: 'test-company',
        folder_path: 'resume-data/tailor/test-company',
        available_files: ['metadata.yaml'],
        position: 'Software Engineer',
        primary_focus: 'engineer',
        job_summary: 'Test summary',
        job_details: {
          company: 'Test Company',
          location: 'Remote',
          experience_level: 'Mid',
          employment_type: 'Full-time',
          must_have_skills: ['JS'],
          nice_to_have_skills: [],
          team_context: 'Team',
          user_scale: '100',
        },
        active_template: 'modern',
        last_updated: '2024-01-01T00:00:00Z',
      };

      const result = MetadataSchema.safeParse(metadataWithModern);
      expect(result.success).toBe(true);
    });

    test('accepts "classic" as valid active_template value', () => {
      const metadataWithClassic = {
        company: 'test-company',
        folder_path: 'resume-data/tailor/test-company',
        available_files: ['metadata.yaml'],
        position: 'Software Engineer',
        primary_focus: 'engineer',
        job_summary: 'Test summary',
        job_details: {
          company: 'Test Company',
          location: 'Remote',
          experience_level: 'Mid',
          employment_type: 'Full-time',
          must_have_skills: ['JS'],
          nice_to_have_skills: [],
          team_context: 'Team',
          user_scale: '100',
        },
        active_template: 'classic',
        last_updated: '2024-01-01T00:00:00Z',
      };

      const result = MetadataSchema.safeParse(metadataWithClassic);
      expect(result.success).toBe(true);
    });

    test('rejects invalid active_template value', () => {
      const metadataWithInvalidTemplate = {
        company: 'test-company',
        folder_path: 'resume-data/tailor/test-company',
        available_files: ['metadata.yaml'],
        position: 'Software Engineer',
        primary_focus: 'engineer',
        job_summary: 'Test summary',
        job_details: {
          company: 'Test Company',
          location: 'Remote',
          experience_level: 'Mid',
          employment_type: 'Full-time',
          must_have_skills: ['JS'],
          nice_to_have_skills: [],
          team_context: 'Team',
          user_scale: '100',
        },
        active_template: 'invalid-theme',
        last_updated: '2024-01-01T00:00:00Z',
      };

      const result = MetadataSchema.safeParse(metadataWithInvalidTemplate);
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasTemplateError = result.error.issues.some((issue) =>
          issue.path.includes('active_template'),
        );
        expect(hasTemplateError).toBe(true);
      }
    });

    test('uses default "modern" value when active_template is missing', () => {
      const metadataWithoutTemplate = {
        company: 'test-company',
        folder_path: 'resume-data/tailor/test-company',
        available_files: ['metadata.yaml'],
        position: 'Software Engineer',
        primary_focus: 'engineer',
        job_summary: 'Test summary',
        job_details: {
          company: 'Test Company',
          location: 'Remote',
          experience_level: 'Mid',
          employment_type: 'Full-time',
          must_have_skills: ['JS'],
          nice_to_have_skills: [],
          team_context: 'Team',
          user_scale: '100',
        },
        // active_template intentionally omitted
        last_updated: '2024-01-01T00:00:00Z',
      };

      const result = MetadataSchema.safeParse(metadataWithoutTemplate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active_template).toBe('modern');
      }
    });
  });
});
