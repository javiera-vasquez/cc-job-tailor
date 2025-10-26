import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  validateCompanyPath,
  validateFilePathsExists,
} from '@shared/validation/company-validation';
import type { FileToValidate } from '@shared/validation/types';
import { COMPANY_FILES } from '@shared/core/config';

/**
 * TODO: Type Safety Improvements (lines 105, 255-257)
 *
 * Issue: Type assertions and non-null assertions are used to work around TypeScript's
 * inability to properly narrow discriminated union types. Even with `if (result.success)`
 * guards, TypeScript doesn't guarantee that `result.data` is accessible.
 *
 * Current workaround: Cast to `{ success: true; data: FileToValidate[] }` and use `!` on array access
 *
 * Proper fix: Consider using a helper function that returns a properly narrowed type, or
 * improve the Result type definition to better support discriminated unions with better
 * type inference when accessing array elements after length checks.
 */

describe('Company Validation', () => {
  // Create temporary test directory structure
  const testBaseDir = join(process.cwd(), 'test-company-validation-temp');
  const validCompanyPath = join(testBaseDir, 'valid-company');
  const anotherCompanyPath = join(testBaseDir, 'another-company');

  beforeAll(() => {
    // Create test directory structure
    mkdirSync(testBaseDir, { recursive: true });
    mkdirSync(validCompanyPath, { recursive: true });
    mkdirSync(anotherCompanyPath, { recursive: true });

    // Create test files in valid company
    writeFileSync(join(validCompanyPath, 'metadata.yaml'), 'test: data');
    writeFileSync(join(validCompanyPath, 'resume.yaml'), 'test: data');
    writeFileSync(join(validCompanyPath, 'job_analysis.yaml'), 'test: data');
  });

  afterAll(() => {
    // Clean up test directories
    rmSync(testBaseDir, { recursive: true, force: true });
  });

  describe('validateCompanyPath', () => {
    test('returns success when company path exists', () => {
      const result = validateCompanyPath(validCompanyPath);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    test('returns error when company path does not exist', () => {
      const nonExistentPath = join(testBaseDir, 'non-existent-company');
      const result = validateCompanyPath(nonExistentPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Company folder not found');
        expect(result.error).toContain(nonExistentPath);
      }
    });

    test('includes available companies in error details', () => {
      const nonExistentPath = join(testBaseDir, 'non-existent-company');
      const result = validateCompanyPath(nonExistentPath);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should mention available companies (even if the list is empty)
        expect(result.details).toContain('Available companies');
      }
    });

    test('handles path with trailing slash', () => {
      const pathWithSlash = validCompanyPath + '/';
      const result = validateCompanyPath(pathWithSlash);

      expect(result.success).toBe(true);
    });

    test('handles special characters in company name', () => {
      const specialCompanyPath = join(testBaseDir, 'company-with-dashes-123');
      mkdirSync(specialCompanyPath, { recursive: true });

      try {
        const result = validateCompanyPath(specialCompanyPath);
        expect(result.success).toBe(true);
      } finally {
        rmSync(specialCompanyPath, { recursive: true, force: true });
      }
    });
  });

  describe('validateFilePathsExists', () => {
    test('returns success when all files exist', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any, // Type not used for existence check
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.RESUME,
          path: join(validCompanyPath, 'resume.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(true);
      if (result.success) {
        const data = (result as { success: true; data: FileToValidate[] }).data;
        expect(data).toHaveLength(2);
        expect(data[0]!.fileName).toBe(COMPANY_FILES.METADATA);
      }
    });

    test('returns error when a single file is missing', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.COVER_LETTER,
          path: join(validCompanyPath, 'cover_letter.yaml'), // This file doesn't exist
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing 1 required file');
        expect(result.details).toContain('cover_letter.yaml');
        expect(result.details).toContain('Expected files');
      }
    });

    test('returns error with all missing files listed', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.COVER_LETTER,
          path: join(validCompanyPath, 'cover_letter.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: 'custom.yaml' as any,
          path: join(validCompanyPath, 'custom.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Missing 2 required file');
        expect(result.details).toContain('cover_letter.yaml');
        expect(result.details).toContain('custom.yaml');
      }
    });

    test('returns error with found and expected files listed', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.RESUME,
          path: join(validCompanyPath, 'resume.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.COVER_LETTER,
          path: join(validCompanyPath, 'cover_letter.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details).toContain('Found files: metadata.yaml, resume.yaml');
        expect(result.details).toContain('Expected files');
        expect(result.details).toContain('cover_letter.yaml');
      }
    });

    test('handles empty file list', () => {
      const result = validateFilePathsExists([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });

    test('includes error details with newline separated format', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.COVER_LETTER,
          path: join(validCompanyPath, 'cover_letter.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(false);
      if (!result.success) {
        const detailsLines = result.details?.split('\n') || [];
        // Should have at least one line with " - " prefix for the missing file
        expect(detailsLines.some((line) => line.includes('cover_letter.yaml'))).toBe(true);
      }
    });

    test('preserves file metadata in returned data', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.RESUME,
          path: join(validCompanyPath, 'resume.yaml'),
          type: {} as any,
          wrapperKey: 'resume',
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(true);
      if (result.success) {
        const data = (result as { success: true; data: FileToValidate[] }).data;
        expect(data[0]!.wrapperKey).toBeNull();
        expect(data[1]!.wrapperKey).toBe('resume');
        expect(data[0]!.fileName).toBe(COMPANY_FILES.METADATA);
      }
    });

    test('handles multiple missing files from different locations', () => {
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(validCompanyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.COVER_LETTER,
          path: join(validCompanyPath, 'cover_letter.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.JOB_ANALYSIS,
          path: join(anotherCompanyPath, 'job_analysis.yaml'), // Different path, missing
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const result = validateFilePathsExists(filesToValidate);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Should report 2 missing files
        expect(result.error).toContain('Missing 2 required');
        expect(result.details).toContain('cover_letter.yaml');
        expect(result.details).toContain('job_analysis.yaml');
      }
    });
  });

  describe('Integration: Company validation workflow', () => {
    test('validates company path then checks files exist', () => {
      const companyPath = validCompanyPath;

      // First validate path exists
      const pathResult = validateCompanyPath(companyPath);
      expect(pathResult.success).toBe(true);

      // Then validate files exist
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(companyPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.RESUME,
          path: join(companyPath, 'resume.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
        {
          fileName: COMPANY_FILES.JOB_ANALYSIS,
          path: join(companyPath, 'job_analysis.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const filesResult = validateFilePathsExists(filesToValidate);
      expect(filesResult.success).toBe(true);
      if (filesResult.success) {
        expect(filesResult.data).toHaveLength(3);
      }
    });

    test('fails gracefully on invalid company path', () => {
      const nonExistentPath = join(testBaseDir, 'invalid-company');

      const pathResult = validateCompanyPath(nonExistentPath);
      expect(pathResult.success).toBe(false);

      // Even if path check failed, file validation should still handle it
      const filesToValidate: FileToValidate[] = [
        {
          fileName: COMPANY_FILES.METADATA,
          path: join(nonExistentPath, 'metadata.yaml'),
          type: {} as any,
          wrapperKey: null,
        },
      ];

      const filesResult = validateFilePathsExists(filesToValidate);
      expect(filesResult.success).toBe(false);
    });
  });
});
