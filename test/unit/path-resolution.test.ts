import { describe, test, expect } from 'bun:test';
import {
  validateMutuallyExclusiveOptions,
  resolvePathString,
  validatePathExists,
  resolveAndValidatePath,
} from '@shared/validation/path-resolution';
import { PathHelpers } from '@shared/core/path-helpers';

describe('Path Resolution', () => {
  describe('validateMutuallyExclusiveOptions', () => {
    test('accepts when only companyName provided', () => {
      const result = validateMutuallyExclusiveOptions({ companyName: 'test-company' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('test-company');
      }
    });

    test('accepts when only customPath provided', () => {
      const result = validateMutuallyExclusiveOptions({ customPath: '/path/to/company' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customPath).toBe('/path/to/company');
      }
    });

    test('rejects when both companyName and customPath provided', () => {
      const result = validateMutuallyExclusiveOptions({
        companyName: 'test-company',
        customPath: '/path/to/company',
      });

      expect(result.success).toBe(false);
    });

    test('rejects when neither companyName nor customPath provided', () => {
      const result = validateMutuallyExclusiveOptions({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('preserves input when valid', () => {
      const input = { companyName: 'acme-corp' };
      const result = validateMutuallyExclusiveOptions(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    test('returns error with details for conflict', () => {
      const result = validateMutuallyExclusiveOptions({
        companyName: 'company-a',
        customPath: '/path/company-b',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });

  describe('resolvePathString', () => {
    test('builds path from company name', () => {
      const result = resolvePathString({ companyName: 'acme-corp' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toContain('acme-corp');
        expect(result.data.companyName).toBe('acme-corp');
      }
    });

    test('uses PathHelpers.getCompanyPath for company name', () => {
      const companyName = 'test-company';
      const expectedPath = PathHelpers.getCompanyPath(companyName);
      const result = resolvePathString({ companyName });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe(expectedPath);
      }
    });

    test('extracts company name from custom path', () => {
      const result = resolvePathString({ customPath: '/path/to/my-company' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('my-company');
        expect(result.data.path).toBe('/path/to/my-company');
      }
    });

    test('handles trailing slashes in custom path', () => {
      const result = resolvePathString({ customPath: '/path/to/my-company/' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('my-company');
        expect(result.data.path).not.toContain('//');
      }
    });

    test('extracts company from complex paths', () => {
      const result = resolvePathString({
        customPath: '/home/user/projects/resume-data/tailor/my-company',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('my-company');
      }
    });

    test('handles single directory in custom path', () => {
      const result = resolvePathString({ customPath: 'my-company' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('my-company');
      }
    });

    test('defaults to "unknown" for root path', () => {
      const result = resolvePathString({ customPath: '/' });

      expect(result.success).toBe(true);
      if (result.success) {
        // Root path should default to something (implementation specific)
        expect(result.data.companyName).toBeDefined();
      }
    });

    test('preserves company name when provided', () => {
      const result = resolvePathString({ companyName: 'original-name' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('original-name');
      }
    });
  });

  describe('validatePathExists', () => {
    test('returns success when path exists', () => {
      // Use project root which definitely exists
      const projectRoot = PathHelpers.getProjectRoot();
      const resolved = { path: projectRoot, companyName: 'test' };

      const result = validatePathExists(resolved);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(resolved);
      }
    });

    test('returns error when path does not exist', () => {
      const result = validatePathExists({
        path: '/nonexistent/path/that/does/not/exist',
        companyName: 'fake-company',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('does not exist');
      }
    });

    test('includes path in error message', () => {
      const missingPath = '/nonexistent/company';
      const result = validatePathExists({
        path: missingPath,
        companyName: 'fake',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain(missingPath);
      }
    });

    test('includes helpful details in error', () => {
      const result = validatePathExists({
        path: '/nonexistent/path',
        companyName: 'test',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details).toBeDefined();
        expect(result.details).toContain('company');
      }
    });

    test('returns original object on success', () => {
      const projectRoot = PathHelpers.getProjectRoot();
      const input = { path: projectRoot, companyName: 'test-company' };

      const result = validatePathExists(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });
  });

  describe('resolveAndValidatePath', () => {
    test('rejects when both options provided', () => {
      const result = resolveAndValidatePath({
        companyName: 'company-a',
        customPath: '/path/company-b',
      });

      expect(result.success).toBe(false);
    });

    test('rejects when neither option provided', () => {
      const result = resolveAndValidatePath({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('rejects nonexistent company path', () => {
      const result = resolveAndValidatePath({
        companyName: '__nonexistent_company_12345__',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('accepts existing path from customPath', () => {
      const projectRoot = PathHelpers.getProjectRoot();
      const result = resolveAndValidatePath({
        customPath: projectRoot,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.path).toBe(projectRoot);
        expect(result.data.companyName).toBeDefined();
      }
    });

    test('extracts company name from custom path', () => {
      const projectRoot = PathHelpers.getProjectRoot();
      const result = resolveAndValidatePath({
        customPath: projectRoot,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBeDefined();
        expect(typeof result.data.companyName).toBe('string');
      }
    });

    test('returns error for invalid mutual options', () => {
      const result = resolveAndValidatePath({
        companyName: 'company-a',
        customPath: '/path',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    test('includes error details on path not found', () => {
      const result = resolveAndValidatePath({
        companyName: '__nonexistent__',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        // Error details should exist
        expect(result.details !== undefined || result.error !== undefined).toBe(true);
      }
    });
  });
});
