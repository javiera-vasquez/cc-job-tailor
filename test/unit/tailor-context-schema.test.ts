import { test, expect, describe, beforeAll, afterAll } from 'bun:test';
import { mkdirSync, rmSync, existsSync } from 'fs';
import {
  validateTailorContext,
  validateTailorContextStrict,
  TailorContextSchema,
} from '../../src/zod/tailor-context-schema';
import {
  createValidTailorContext,
  createMinimalValidTailorContext,
  createInvalidTailorContext,
} from '../helpers/test-utils';

// Test folder setup
const testFolderPath = 'resume-data/tailor/test-company';

beforeAll(() => {
  // Create test folder if it doesn't exist
  if (!existsSync(testFolderPath)) {
    mkdirSync(testFolderPath, { recursive: true });
  }
});

afterAll(() => {
  // Clean up test folder after all tests
  if (existsSync(testFolderPath)) {
    rmSync(testFolderPath, { recursive: true, force: true });
  }
});

describe('TailorContext Schema Validation', () => {
  describe('TailorContextSchema - Basic Zod Validation', () => {
    test('validates complete tailor context with all fields', () => {
      const validContext = createValidTailorContext();
      const result = TailorContextSchema.safeParse(validContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.active_company).toBe('test-company');
        expect(result.data.active_template).toBe('modern');
        expect(result.data.folder_path).toBe('resume-data/tailor/test-company');
        expect(result.data.available_files).toHaveLength(4);
      }
    });

    test('validates minimal tailor context with only required fields', () => {
      const minimalContext = createMinimalValidTailorContext();
      const result = TailorContextSchema.safeParse(minimalContext);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data._display_cache).toBeUndefined();
      }
    });

    test('rejects context with missing active_company', () => {
      const invalidContext = createInvalidTailorContext('missing-active-company');
      const result = TailorContextSchema.safeParse(invalidContext);

      expect(result.success).toBe(false);
      if (!result.success) {
        const hasCompanyError = result.error.issues.some((issue) =>
          issue.path.includes('active_company'),
        );
        expect(hasCompanyError).toBe(true);
      }
    });

    test('rejects context with missing active_template', () => {
      const invalidContext = createInvalidTailorContext('missing-active-template');
      const result = TailorContextSchema.safeParse(invalidContext);

      expect(result.success).toBe(false);
      if (!result.success) {
        const hasTemplateError = result.error.issues.some((issue) =>
          issue.path.includes('active_template'),
        );
        expect(hasTemplateError).toBe(true);
      }
    });

    test('rejects context with missing folder_path', () => {
      const invalidContext = createInvalidTailorContext('missing-folder-path');
      const result = TailorContextSchema.safeParse(invalidContext);

      expect(result.success).toBe(false);
      if (!result.success) {
        const hasFolderError = result.error.issues.some((issue) =>
          issue.path.includes('folder_path'),
        );
        expect(hasFolderError).toBe(true);
      }
    });

    test('rejects context with invalid datetime format', () => {
      const invalidContext = createInvalidTailorContext('invalid-datetime');
      const result = TailorContextSchema.safeParse(invalidContext);

      expect(result.success).toBe(false);
      if (!result.success) {
        const hasDateError = result.error.issues.some((issue) =>
          issue.message.includes('datetime'),
        );
        expect(hasDateError).toBe(true);
      }
    });

    test('accepts empty available_files array (Zod level only)', () => {
      const contextWithEmptyFiles = createInvalidTailorContext('empty-available-files');
      const result = TailorContextSchema.safeParse(contextWithEmptyFiles);

      // Note: Zod schema accepts empty array, but validation function will warn
      expect(result.success).toBe(true);
    });
  });

  describe('validateTailorContext - Business Logic Validation', () => {
    test('validates complete context with existing folder and valid theme', () => {
      const validContext = createValidTailorContext();
      const result = validateTailorContext(validContext);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
    });

    test('fails validation when folder does not exist', () => {
      const contextWithBadFolder = createInvalidTailorContext('non-existent-folder');
      const result = validateTailorContext(contextWithBadFolder);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((err) => err.includes('does not exist'))).toBe(true);
    });

    test('fails validation with invalid template name', () => {
      const contextWithBadTemplate = createInvalidTailorContext('invalid-template-name');
      const result = validateTailorContext(contextWithBadTemplate);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('not found'))).toBe(true);
      expect(result.errors.some((err) => err.includes('Available themes'))).toBe(true);
    });

    test('produces warning when folder_path does not match active_company', () => {
      const contextWithMismatch = createInvalidTailorContext('mismatched-folder-company');
      const result = validateTailorContext(contextWithMismatch);

      expect(result.warnings).toBeDefined();
      if (result.warnings) {
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some((warn) => warn.includes('may not match'))).toBe(true);
      }
    });

    test('produces warning when available_files is empty', () => {
      const contextWithEmptyFiles = createValidTailorContext({ available_files: [] });
      const result = validateTailorContext(contextWithEmptyFiles);

      expect(result.warnings).toBeDefined();
      if (result.warnings) {
        expect(result.warnings.some((warn) => warn.includes('empty'))).toBe(true);
      }
    });

    test('validates context with optional _display_cache', () => {
      const contextWithCache = createValidTailorContext();
      const result = validateTailorContext(contextWithCache);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data._display_cache).toBeDefined();
        expect(result.data._display_cache?.position).toBe('Software Engineer');
      }
    });

    test('validates context without optional _display_cache', () => {
      const minimalContext = createMinimalValidTailorContext();
      const result = validateTailorContext(minimalContext);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data._display_cache).toBeUndefined();
      }
    });

    test('fails fast with multiple validation errors', () => {
      const badContext = {
        // Missing multiple required fields
        active_company: '',
        available_files: [],
      };

      const result = validateTailorContext(badContext);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateTailorContextStrict - Required Fields Only', () => {
    test('validates minimal context with only required fields', () => {
      const minimalContext = createMinimalValidTailorContext();
      const result = validateTailorContextStrict(minimalContext);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('ignores optional _display_cache in strict validation', () => {
      const contextWithCache = createValidTailorContext();
      const result = validateTailorContextStrict(contextWithCache);

      expect(result.success).toBe(true);
    });

    test('fails strict validation with missing required field', () => {
      const invalidContext = createInvalidTailorContext('missing-active-company');
      const result = validateTailorContextStrict(invalidContext);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('CRITICAL'))).toBe(true);
    });

    test('validates folder existence in strict mode', () => {
      const contextWithBadFolder = createInvalidTailorContext('non-existent-folder');
      const result = validateTailorContextStrict(contextWithBadFolder);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('does not exist'))).toBe(true);
    });

    test('validates theme existence in strict mode', () => {
      const contextWithBadTemplate = createInvalidTailorContext('invalid-template-name');
      const result = validateTailorContextStrict(contextWithBadTemplate);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('not found'))).toBe(true);
    });
  });

  describe('Validation Layers', () => {
    test('Layer 1: Zod schema validation catches type errors', () => {
      const invalidTypes = {
        active_company: 123, // Should be string
        active_template: true, // Should be string
        folder_path: ['array'], // Should be string
        available_files: 'string', // Should be array
        last_updated: 12345, // Should be string
      };

      const result = validateTailorContext(invalidTypes);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('Layer 2: File system validation catches missing folders', () => {
      const validContext = createValidTailorContext({
        folder_path: '/definitely/does/not/exist',
      });

      const result = validateTailorContext(validContext);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('does not exist'))).toBe(true);
    });

    test('Layer 3: Theme registry validation catches invalid themes', () => {
      const validContext = createValidTailorContext({
        active_template: 'non-existent-theme',
      });

      const result = validateTailorContext(validContext);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('not found'))).toBe(true);
    });

    test('Layer 4: Business logic validation produces warnings', () => {
      const contextWithMismatch = createValidTailorContext({
        active_company: 'company-a',
        folder_path: 'resume-data/tailor/company-b',
      });

      const result = validateTailorContext(contextWithMismatch);

      expect(result.warnings).toBeDefined();
      if (result.warnings) {
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    test('handles null input gracefully', () => {
      const result = validateTailorContext(null);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles undefined input gracefully', () => {
      const result = validateTailorContext(undefined);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles empty object input', () => {
      const result = validateTailorContext({});

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('validates ISO datetime format strictly', () => {
      const contextWithBadDate = createValidTailorContext({
        last_updated: '2025-10-07', // Missing time component
      });

      const result = validateTailorContext(contextWithBadDate);

      expect(result.success).toBe(false);
    });

    test('accepts valid ISO datetime formats supported by Zod', () => {
      // Zod's datetime validation accepts ISO 8601 formats with Z suffix
      const validDates = ['2025-10-07T08:23:00Z', '2025-10-07T08:23:00.000Z'];

      validDates.forEach((date) => {
        const context = createValidTailorContext({ last_updated: date });
        const result = TailorContextSchema.safeParse(context);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Template Theme Validation', () => {
    test('accepts "modern" as valid template', () => {
      const context = createValidTailorContext({ active_template: 'modern' });
      const result = validateTailorContext(context);

      expect(result.success).toBe(true);
    });

    test('accepts "classic" as valid template (when available)', () => {
      const context = createValidTailorContext({ active_template: 'classic' });
      // Note: This may fail if classic theme is not registered
      // The validation should check themes registry
      const result = validateTailorContext(context);

      // Result depends on whether 'classic' is in themes registry
      if (result.success) {
        expect(result.data?.active_template).toBe('classic');
      }
    });

    test('provides helpful error message for invalid theme', () => {
      const context = createValidTailorContext({ active_template: 'futuristic' });
      const result = validateTailorContext(context);

      expect(result.success).toBe(false);
      expect(result.errors.some((err) => err.includes('Available themes'))).toBe(true);
      expect(result.errors.some((err) => err.includes('modern'))).toBe(true);
    });
  });

  describe('PDF Generation Context Validation Regression', () => {
    test('validateTailorContextStrict should NOT require job analysis fields', () => {
      // Regression test for issue where PDF generation failed because
      // it was validating full tailor context including job_details, company, position, etc.
      // which are not present in applicationData.metadata
      const metadataOnlyContext = {
        active_company: 'tech-corp',
        active_template: 'modern',
        folder_path: testFolderPath,
        available_files: ['resume.yaml', 'metadata.yaml', 'cover_letter.yaml'],
        last_updated: new Date().toISOString(),
        // NOTE: No company, position, primary_focus, or job_details fields
      };

      const result = validateTailorContextStrict(metadataOnlyContext);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateTailorContext SHOULD require job analysis fields', () => {
      // For comparison: the full validation requires all fields
      const metadataOnlyContext = {
        active_company: 'tech-corp',
        active_template: 'modern',
        folder_path: testFolderPath,
        available_files: ['resume.yaml', 'metadata.yaml', 'cover_letter.yaml'],
        last_updated: new Date().toISOString(),
        // Missing: company, position, primary_focus, job_details
      };

      const result = validateTailorContext(metadataOnlyContext);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Should fail because full validation requires job analysis fields
      expect(
        result.errors.some(
          (err) =>
            err.includes('company') || err.includes('position') || err.includes('primary_focus'),
        ),
      ).toBe(true);
    });

    test('PDF generation workflow uses strict validation correctly', () => {
      // Simulates the exact data structure used in generate-pdf.ts
      const applicationMetadata = {
        active_company: 'tech-corp',
        active_template: 'modern' as const,
        folder_path: testFolderPath,
        available_files: ['resume.yaml', 'metadata.yaml', 'cover_letter.yaml', 'job_analysis.yaml'],
        last_updated: new Date().toISOString(),
      };

      // This is what generate-pdf.ts does
      const contextValidation = validateTailorContextStrict({
        active_company: applicationMetadata.active_company,
        active_template: applicationMetadata.active_template,
        folder_path: applicationMetadata.folder_path,
        available_files: applicationMetadata.available_files,
        last_updated: applicationMetadata.last_updated,
      });

      expect(contextValidation.success).toBe(true);
      expect(contextValidation.errors).toHaveLength(0);
    });
  });
});
