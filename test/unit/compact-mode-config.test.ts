import { describe, it, expect } from 'bun:test';
import { COMPACT_MODE, PATHS, TIMEOUTS, LIMITS, PATTERNS } from '../../scripts/shared/config';

/**
 * Note: These tests verify the COMPACT_MODE configuration behavior.
 * Since ES modules are cached and the config reads process.env at module load time,
 * we test the current runtime value rather than dynamic environment changes.
 *
 * To test different environment configurations, run tests with the env var set:
 * TAILOR_SERVER_COMPACT_LOGS=true bun test
 */

describe('COMPACT_MODE Configuration', () => {
  describe('Configuration structure', () => {
    it('should have ENABLED property', () => {
      expect(COMPACT_MODE).toHaveProperty('ENABLED');
      expect(typeof COMPACT_MODE.ENABLED).toBe('boolean');
    });

    it('should be a readonly object at TypeScript level', () => {
      // TypeScript enforces const via 'as const', but object is not frozen at runtime
      // This test just verifies the object structure is correct
      expect(Object.keys(COMPACT_MODE)).toEqual(['ENABLED']);
    });

    it('should default to false in test environment', () => {
      // In test runs without the env var, it should be false
      // This documents the expected default behavior
      if (!process.env.TAILOR_SERVER_COMPACT_LOGS) {
        expect(COMPACT_MODE.ENABLED).toBe(false);
      }
    });
  });

  describe('Integration with other config', () => {
    it('should not affect other config values', () => {
      // Check that other configs are still present alongside COMPACT_MODE
      expect(PATHS).toBeDefined();
      expect(TIMEOUTS).toBeDefined();
      expect(LIMITS).toBeDefined();
      expect(PATTERNS).toBeDefined();
    });

    it('should work alongside FILE_WATCH_DEBOUNCE', () => {
      // Both COMPACT_MODE and FILE_WATCH_DEBOUNCE should be configurable
      expect(COMPACT_MODE).toHaveProperty('ENABLED');
      expect(TIMEOUTS).toHaveProperty('FILE_WATCH_DEBOUNCE');
      expect(typeof TIMEOUTS.FILE_WATCH_DEBOUNCE).toBe('number');
    });

    it('should be part of the main config module', () => {
      // COMPACT_MODE should be exported from the main config
      expect(COMPACT_MODE).toBeDefined();
      expect(COMPACT_MODE.ENABLED).toBeDefined();
    });
  });

  describe('Environment variable behavior documentation', () => {
    it('documents that COMPACT_MODE reads TAILOR_SERVER_COMPACT_LOGS env var', () => {
      // This test documents the expected behavior:
      // - When TAILOR_SERVER_COMPACT_LOGS is not set, ENABLED should be false
      // - When TAILOR_SERVER_COMPACT_LOGS="true" (case-insensitive), ENABLED should be true
      // - When TAILOR_SERVER_COMPACT_LOGS is any other value, ENABLED should be false

      // The actual value depends on how the test was run
      const envValue = process.env.TAILOR_SERVER_COMPACT_LOGS;
      const expectedEnabled = envValue?.toLowerCase() === 'true';

      expect(COMPACT_MODE.ENABLED).toBe(expectedEnabled);
    });

    it('confirms parseBoolean helper logic through observed behavior', () => {
      // Based on the config implementation:
      // - undefined/empty -> false (default)
      // - "true" (any case) -> true
      // - anything else -> false

      const envValue = process.env.TAILOR_SERVER_COMPACT_LOGS;

      if (!envValue) {
        expect(COMPACT_MODE.ENABLED).toBe(false);
      } else if (envValue.toLowerCase() === 'true') {
        expect(COMPACT_MODE.ENABLED).toBe(true);
      } else {
        expect(COMPACT_MODE.ENABLED).toBe(false);
      }
    });
  });
});
