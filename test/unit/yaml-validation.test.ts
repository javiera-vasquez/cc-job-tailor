import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { dump } from 'js-yaml';
import { join } from 'path';
import { z } from 'zod';
import {
  validateYamlFilesAgainstSchemasPipeline,
  formatZodError,
} from '@shared/validation/yaml-validation';
import { MetadataSchema, JobAnalysisSchema } from '../../src/zod/schemas';
import { COMPANY_FILES } from '@shared/core/config';
import { PathHelpers } from '@shared/core/path-helpers';
import type {
  YamlFilesAndSchemasToWatch,
  FileToValidateWithYamlData,
} from '@shared/validation/types';

/**
 * TODO: Type Safety Improvements (lines 294, 313, 336, 469, 572)
 *
 * Issue: Type assertions and non-null assertions are used to work around TypeScript's
 * inability to properly narrow discriminated union types. Even with `if (result.success)`
 * guards, TypeScript doesn't guarantee that `result.data` is accessible or that array
 * elements at specific indices exist.
 *
 * Current workaround: Cast to `{ success: true; data: FileToValidateWithYamlData[] }` and use `!` on array access
 *
 * Proper fix: Consider using a helper function that returns a properly narrowed type, or
 * improve the Result type definition to better support discriminated unions with better
 * type inference when accessing array elements after length checks.
 */

describe('YAML Validation', () => {
  // Setup test directories in actual tailor path
  const companyName = 'test-yaml-validation-company';
  const companyDir = PathHelpers.getCompanyPath(companyName);

  beforeAll(() => {
    // Create test directory and company folder
    mkdirSync(companyDir, { recursive: true });

    // Create valid test YAML files
    const validMetadata = {
      company: 'Test Company',
      folder_path: companyDir,
      available_files: ['metadata.yaml'],
      position: 'Software Engineer',
      primary_focus: 'engineer',
      job_summary: 'Test job',
      job_details: {
        company: 'Test Company',
        location: 'Remote',
        experience_level: 'Mid-level',
        employment_type: 'Full-time',
        must_have_skills: ['TypeScript'],
        nice_to_have_skills: [],
        team_context: 'Small team',
        user_scale: '100 users',
      },
      active_template: 'modern' as const,
      last_updated: '2024-01-01T00:00:00Z',
    };

    const validJobAnalysis = {
      job_analysis: {
        company: 'Test Company',
        position: 'Engineer',
        location: 'Remote',
        experience_level: 'Mid-level',
        employment_type: 'Full-time',
        job_focus: [
          {
            primary_area: 'engineer',
            specialties: ['typescript'],
            weight: 1.0,
          },
        ],
        requirements: {
          must_have_skills: [{ skill: 'TypeScript', priority: 1 }],
          nice_to_have_skills: [],
          soft_skills: [],
          experience_years: 3,
          education: 'Bachelor',
        },
        responsibilities: { primary: [], secondary: [] },
        role_context: {
          department: 'Engineering',
          team_size: 'Small',
          key_points: [],
        },
        application_info: {
          posting_url: 'https://example.com',
          posting_date: '2024-01-01',
          deadline: '2024-12-31',
        },
        candidate_alignment: {
          strong_matches: [],
          gaps_to_address: [],
          transferable_skills: [],
          emphasis_strategy: 'Test',
        },
        section_priorities: {
          technical_expertise: [],
          experience_focus: 'All',
          project_relevance: 'Web',
        },
        optimization_actions: {
          LEAD_WITH: [],
          EMPHASIZE: [],
          QUANTIFY: [],
          DOWNPLAY: [],
        },
      },
    };

    const validResume = {
      resume: {
        name: 'Test User',
        profile_picture: null,
        title: 'Software Engineer',
        summary: null,
        contact: {
          phone: '+1-234-567-8900',
          email: 'test@example.com',
          address: null,
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [],
        skills: [],
        languages: [],
        professional_experience: [],
        independent_projects: [],
        education: [],
      },
    };

    // Write YAML files
    writeFileSync(join(companyDir, COMPANY_FILES.METADATA), dump(validMetadata, { lineWidth: -1 }));
    writeFileSync(
      join(companyDir, COMPANY_FILES.JOB_ANALYSIS),
      dump(validJobAnalysis, { lineWidth: -1 }),
    );
    writeFileSync(join(companyDir, COMPANY_FILES.RESUME), dump(validResume, { lineWidth: -1 }));
  });

  afterAll(() => {
    rmSync('resume-data/tailor/test-yaml-validation-company', { recursive: true, force: true });
    rmSync('resume-data/tailor/invalid-company', { recursive: true, force: true });
    rmSync('resume-data/tailor/bad-yaml-company', { recursive: true, force: true });
    rmSync('resume-data/tailor/mixed-validity-company', { recursive: true, force: true });
    rmSync('resume-data/tailor/context-error-company', { recursive: true, force: true });
  });

  describe('formatZodError', () => {
    test('formats single validation error issue', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const validation = schema.safeParse({ name: 'Test', age: 'not-a-number' });
      expect(validation.success).toBe(false);

      if (!validation.success) {
        const formatted = formatZodError(validation.error);
        expect(formatted).toContain('age');
        expect(formatted).toContain('-');
      }
    });

    test('formats multiple validation error issues', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });

      const validation = schema.safeParse({
        name: 123,
        age: 'not-a-number',
        email: 'invalid-email',
      });

      expect(validation.success).toBe(false);
      if (!validation.success) {
        const formatted = formatZodError(validation.error);
        // Should contain all field errors
        expect(formatted).toContain('name');
        expect(formatted).toContain('age');
        expect(formatted).toContain('email');
        // Should use "  - " prefix format
        expect(formatted).toContain('  -');
      }
    });

    test('formats nested field path errors', () => {
      const schema = z.object({
        contact: z.object({
          email: z.string().email(),
          phone: z.string(),
        }),
      });

      const validation = schema.safeParse({
        contact: {
          email: 'invalid',
          phone: 123,
        },
      });

      expect(validation.success).toBe(false);
      if (!validation.success) {
        const formatted = formatZodError(validation.error);
        // Should show nested path
        expect(formatted).toContain('contact.email');
        expect(formatted).toContain('contact.phone');
      }
    });

    test('displays root errors without path', () => {
      const schema = z.string().refine((val) => val.length > 5, {
        message: 'String too short',
      });

      const validation = schema.safeParse('abc');
      expect(validation.success).toBe(false);

      if (!validation.success) {
        const formatted = formatZodError(validation.error);
        // Root error should display as 'root'
        expect(formatted).toContain('root');
      }
    });

    test('joins multiple issues with newlines and correct prefix', () => {
      const schema = z.object({
        a: z.number(),
        b: z.number(),
        c: z.number(),
      });

      const validation = schema.safeParse({ a: 'x', b: 'y', c: 'z' });
      expect(validation.success).toBe(false);

      if (!validation.success) {
        const formatted = formatZodError(validation.error);
        const lines = formatted.split('\n');
        // Should have at least 3 lines (one for each error)
        expect(lines.length).toBeGreaterThanOrEqual(3);
        // Each line should start with "  - "
        lines.forEach((line) => {
          if (line.trim()) {
            expect(line).toMatch(/^\s*-\s/);
          }
        });
      }
    });

    test('handles deeply nested object errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            contact: z.object({
              email: z.string().email(),
            }),
          }),
        }),
      });

      const validation = schema.safeParse({
        user: {
          profile: {
            contact: {
              email: 'not-an-email',
            },
          },
        },
      });

      expect(validation.success).toBe(false);
      if (!validation.success) {
        const formatted = formatZodError(validation.error);
        expect(formatted).toContain('user.profile.contact.email');
      }
    });
  });

  describe('validateYamlFilesAgainstSchemasPipeline', () => {
    test('validates metadata file successfully in pipeline', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(companyName, filesAndSchemas);

      expect(result.success).toBe(true);
      if (result.success) {
        const data = (result as { success: true; data: FileToValidateWithYamlData[] }).data;
        expect(data).toHaveLength(1);
        expect(data[0]!.fileName).toBe(COMPANY_FILES.METADATA);
      }
    });

    test('returns success with validated data from each file', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(companyName, filesAndSchemas);

      expect(result.success).toBe(true);
      if (result.success) {
        const data = (result as { success: true; data: FileToValidateWithYamlData[] }).data;
        const metadataFile = data[0]!;
        expect(metadataFile.data).toBeDefined();
        // Data should be the validated object
        const metadataData = metadataFile.data as any;
        expect(metadataData.company).toBe('Test Company');
      }
    });

    test('processes YAML files successfully when valid', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(companyName, filesAndSchemas);

      expect(result.success).toBe(true);
      if (result.success) {
        const data = (result as { success: true; data: FileToValidateWithYamlData[] }).data;
        const file = data[0]!;
        expect(file.fileName).toBe(COMPANY_FILES.METADATA);
        const metadataData = file.data as any;
        expect(metadataData.company).toBe('Test Company');
      }
    });

    test('short-circuits on missing file', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
        {
          key: 'COVER_LETTER',
          fileName: COMPANY_FILES.COVER_LETTER, // This file doesn't exist
          type: z.any(),
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(companyName, filesAndSchemas);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should fail at file existence check
        expect(result.error).toContain('Missing');
      }
    });

    test('short-circuits on validation error and reports file location', () => {
      // Create invalid metadata file
      const invalidCompanyDir = PathHelpers.getCompanyPath('invalid-company');
      mkdirSync(invalidCompanyDir, { recursive: true });

      const invalidMetadata = {
        // Missing required field 'company'
        position: 'Engineer',
      };

      writeFileSync(
        join(invalidCompanyDir, COMPANY_FILES.METADATA),
        dump(invalidMetadata, { lineWidth: -1 }),
      );

      try {
        const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
          {
            key: 'METADATA',
            fileName: COMPANY_FILES.METADATA,
            type: MetadataSchema,
            wrapperKey: null,
          },
        ];

        const result = validateYamlFilesAgainstSchemasPipeline('invalid-company', filesAndSchemas);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('validation failed');
          // Should contain error details about missing fields
          expect(result.details).toBeDefined();
        }
      } finally {
        rmSync(invalidCompanyDir, { recursive: true, force: true });
      }
    });

    test('handles non-existent company path', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(
        'non-existent-company',
        filesAndSchemas,
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing');
      }
    });

    test('handles invalid YAML syntax', () => {
      const badYamlCompanyDir = PathHelpers.getCompanyPath('bad-yaml-company');
      mkdirSync(badYamlCompanyDir, { recursive: true });

      // Write malformed YAML
      writeFileSync(
        join(badYamlCompanyDir, COMPANY_FILES.METADATA),
        'key: value\n  bad indentation\n invalid',
      );

      try {
        const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
          {
            key: 'METADATA',
            fileName: COMPANY_FILES.METADATA,
            type: MetadataSchema,
            wrapperKey: null,
          },
        ];

        const result = validateYamlFilesAgainstSchemasPipeline('bad-yaml-company', filesAndSchemas);

        expect(result.success).toBe(false);
        if (!result.success) {
          // Should fail with YAML parsing error
          expect(result.error).toBeDefined();
        }
      } finally {
        rmSync(badYamlCompanyDir, { recursive: true, force: true });
      }
    });

    test('preserves file metadata through validation pipeline', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(companyName, filesAndSchemas);

      expect(result.success).toBe(true);
      if (result.success) {
        // Metadata should be preserved in result
        const data = (result as { success: true; data: FileToValidateWithYamlData[] }).data;
        const file = data[0]!;
        expect(file.fileName).toBe(COMPANY_FILES.METADATA);
        expect(file.wrapperKey).toBeNull();
        expect(file.path).toBeDefined();
      }
    });

    test('validates multiple files and stops at first error', () => {
      // Create a company with first file valid but second file invalid
      const mixedCompanyDir = PathHelpers.getCompanyPath('mixed-validity-company');
      mkdirSync(mixedCompanyDir, { recursive: true });

      // Valid metadata
      const validMetadata = {
        company: 'Test',
        folder_path: mixedCompanyDir,
        available_files: [],
        position: 'Engineer',
        primary_focus: 'test',
        job_summary: 'Test',
        job_details: {
          company: 'Test',
          location: 'Remote',
          experience_level: 'Mid-level',
          employment_type: 'Full-time',
          must_have_skills: [],
          nice_to_have_skills: [],
          team_context: 'Small',
          user_scale: '100',
        },
        active_template: 'modern' as const,
        last_updated: '2024-01-01T00:00:00Z',
      };

      writeFileSync(
        join(mixedCompanyDir, COMPANY_FILES.METADATA),
        dump(validMetadata, { lineWidth: -1 }),
      );

      // Invalid job analysis (missing required fields)
      const invalidJobAnalysis = {
        job_analysis: {
          // Missing many required fields
          company: 'Test',
        },
      };

      writeFileSync(
        join(mixedCompanyDir, COMPANY_FILES.JOB_ANALYSIS),
        dump(invalidJobAnalysis, { lineWidth: -1 }),
      );

      try {
        const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
          {
            key: 'METADATA',
            fileName: COMPANY_FILES.METADATA,
            type: MetadataSchema,
            wrapperKey: null,
          },
          {
            key: 'JOB_ANALYSIS',
            fileName: COMPANY_FILES.JOB_ANALYSIS,
            type: JobAnalysisSchema,
            wrapperKey: 'job_analysis',
          },
        ];

        const result = validateYamlFilesAgainstSchemasPipeline(
          'mixed-validity-company',
          filesAndSchemas,
        );

        // Should fail at job analysis validation
        expect(result.success).toBe(false);
        if (!result.success) {
          // Error should be about job analysis validation
          expect(result.error).toContain('validation failed');
        }
      } finally {
        rmSync(mixedCompanyDir, { recursive: true, force: true });
      }
    });
  });

  describe('Integration: Full validation pipeline', () => {
    test('validates metadata file successfully in full pipeline', () => {
      const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
        {
          key: 'METADATA',
          fileName: COMPANY_FILES.METADATA,
          type: MetadataSchema,
          wrapperKey: null,
        },
      ];

      const result = validateYamlFilesAgainstSchemasPipeline(companyName, filesAndSchemas);

      expect(result.success).toBe(true);
      if (result.success) {
        // File should be validated
        const data = (result as { success: true; data: FileToValidateWithYamlData[] }).data;
        expect(data).toHaveLength(1);
        const file = data[0]!;
        expect(file.data).toBeDefined();
        expect(file.path).toBeDefined();
        expect(file.fileName).toBe(COMPANY_FILES.METADATA);
      }
    });

    test('provides helpful error context when validation fails', () => {
      const badCompanyDir = PathHelpers.getCompanyPath('context-error-company');
      mkdirSync(badCompanyDir, { recursive: true });

      const invalidData = {
        company: 123, // Should be string
        position: true, // Should be string
      };

      writeFileSync(
        join(badCompanyDir, COMPANY_FILES.METADATA),
        dump(invalidData, { lineWidth: -1 }),
      );

      try {
        const filesAndSchemas: YamlFilesAndSchemasToWatch[] = [
          {
            key: 'METADATA',
            fileName: COMPANY_FILES.METADATA,
            type: MetadataSchema,
            wrapperKey: null,
          },
        ];

        const result = validateYamlFilesAgainstSchemasPipeline(
          'context-error-company',
          filesAndSchemas,
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          // Error should include helpful details
          expect(result.error).toBeDefined();
          expect(result.details).toBeDefined();
          expect(result.filePath).toBeDefined();
        }
      } finally {
        rmSync(badCompanyDir, { recursive: true, force: true });
      }
    });
  });
});
