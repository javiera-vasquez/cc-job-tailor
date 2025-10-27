import { describe, test, expect } from 'bun:test';
import {
  tryCatch,
  tryCatchAsync,
  chain,
  chainPipe,
  mapResults,
  tap,
} from '@shared/core/functional-utils';
import type { Result } from '@shared/validation/types';

/**
 * TODO: Type Safety Improvements (lines 396, 435, 450)
 *
 * Issue: Variables initialized to `null` (e.g., `let x: number | null = null`) don't properly
 * convey that the variable may be reassigned later. TypeScript narrows the type to just `null`,
 * losing the union type information, causing type mismatch errors when assigning values.
 *
 * Current workaround: Changed initialization from `null` to `undefined` (e.g., `let x: number | undefined`)
 *
 * Proper fix: Consider using a better pattern for tracking mutable state in tests, such as:
 * - Using a container object: `const state = { value: undefined as number | undefined }`
 * - Using a ref: `const ref = { current: undefined as number | undefined }`
 * - Or restructuring tests to avoid mutable state assignments
 */

describe('Functional Utilities', () => {
  describe('tryCatch', () => {
    test('wraps function execution and returns success Result', () => {
      const result = tryCatch(() => 42, 'Should not fail');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    test('returns success Result with complex data', () => {
      const obj = { name: 'test', value: 100 };
      const result = tryCatch(() => obj, 'Should not fail');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(obj);
      }
    });

    test('catches errors and returns error Result', () => {
      const result = tryCatch(() => {
        throw new Error('Test error');
      }, 'Function failed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Function failed');
        expect(result.details).toContain('Test error');
      }
    });

    test('preserves original error in originalError field', () => {
      const testError = new Error('Original error');
      const result = tryCatch(() => {
        throw testError;
      }, 'Failed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.originalError).toBe(testError);
      }
    });

    test('handles non-Error throws (primitive values)', () => {
      const result = tryCatch(() => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      }, 'Failed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details).toBe('string error');
      }
    });

    test('returns custom error message', () => {
      const customMsg = 'Custom error message';
      const result = tryCatch(() => {
        throw new Error('Original');
      }, customMsg);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(customMsg);
      }
    });

    test('handles functions with side effects', () => {
      let sideEffectRan = false;
      const result = tryCatch(() => {
        sideEffectRan = true;
        return 'success';
      }, 'Failed');

      expect(sideEffectRan).toBe(true);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success');
      }
    });
  });

  describe('tryCatchAsync', () => {
    test('wraps async function execution and returns success', async () => {
      const result = await tryCatchAsync(async () => 'success', 'Should not fail');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success');
      }
    });

    test('returns success Result with async data', async () => {
      const result = await tryCatchAsync(async () => {
        await Promise.resolve();
        return { key: 'value' };
      }, 'Should not fail');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ key: 'value' });
      }
    });

    test('catches async errors and returns error Result', async () => {
      const result = await tryCatchAsync(async () => {
        throw new Error('Async error');
      }, 'Async function failed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Async function failed');
        expect(result.details).toContain('Async error');
      }
    });

    test('preserves original async error', async () => {
      const testError = new Error('Async error');
      const result = await tryCatchAsync(async () => {
        throw testError;
      }, 'Failed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.originalError).toBe(testError);
      }
    });

    test('handles Promise rejection', async () => {
      const result = await tryCatchAsync(async () => {
        await Promise.reject(new Error('Promise rejected'));
      }, 'Failed');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details).toContain('Promise rejected');
      }
    });

    test('handles async functions with side effects', async () => {
      let sideEffectRan = false;
      const result = await tryCatchAsync(async () => {
        sideEffectRan = true;
        await Promise.resolve();
        return 'success';
      }, 'Failed');

      expect(sideEffectRan).toBe(true);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success');
      }
    });
  });

  describe('chain', () => {
    test('applies function to success Result data', () => {
      const result1: Result<number> = { success: true, data: 5 };
      const result = chain(result1, (n) => ({ success: true as const, data: n * 2 }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10);
      }
    });

    test('propagates error Result without calling function', () => {
      let functionCalled = false;
      const result1: Result<number> = { success: false, error: 'Initial error' };

      const result = chain(result1, (n) => {
        functionCalled = true;
        return { success: true as const, data: n };
      });

      expect(functionCalled).toBe(false);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Initial error');
      }
    });

    test('handles function that returns error Result', () => {
      const result1: Result<number> = { success: true, data: 5 };
      const result = chain(result1, () => ({ success: false as const, error: 'Transform error' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Transform error');
      }
    });

    test('chains multiple operations with nested chain calls', () => {
      const initial: Result<number> = { success: true, data: 2 };

      const result = chain(initial, (n) =>
        chain({ success: true as const, data: n * 3 }, (m) => ({
          success: true as const,
          data: m + 5,
        })),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(11); // (2 * 3) + 5
      }
    });
  });

  describe('chainPipe', () => {
    test('chains multiple functions left-to-right', () => {
      const result = chainPipe(
        5,
        (n: number) => ({ success: true as const, data: n * 2 }),
        (n: number) => ({ success: true as const, data: n + 3 }),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(13); // (5 * 2) + 3
      }
    });

    test('short-circuits on first error', () => {
      let thirdFnCalled = false;
      const result = chainPipe(
        5,
        (n: number) => ({ success: true as const, data: n * 2 }),
        () => ({ success: false as const, error: 'Failed at step 2' }),
        () => {
          thirdFnCalled = true;
          return { success: true as const, data: 999 };
        },
      );

      expect(thirdFnCalled).toBe(false);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed');
      }
    });

    test('handles single function', () => {
      const result = chainPipe(10, (n: number) => ({ success: true as const, data: n * 2 }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(20);
      }
    });

    test('handles function chain with data transformation', () => {
      const result = chainPipe(
        { value: 5 },
        (obj: { value: number }) => ({ success: true as const, data: obj.value }),
        (n: number) => ({ success: true as const, data: `Result: ${n}` }),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('Result: 5');
      }
    });

    test('threads data through pipeline without mutation', () => {
      const initial = { count: 1 };
      const result = chainPipe(
        initial,
        (obj: { count: number }) => ({
          success: true as const,
          data: { ...obj, count: obj.count + 1 },
        }),
        (obj: { count: number }) => ({
          success: true as const,
          data: { ...obj, count: obj.count * 2 },
        }),
      );

      expect(initial.count).toBe(1); // Original unchanged
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.count).toBe(4); // (1 + 1) * 2
      }
    });
  });

  describe('mapResults', () => {
    test('transforms array items with Result functions', () => {
      const items = [1, 2, 3];
      const result = mapResults(items, (n) => ({
        success: true as const,
        data: n * 2,
      }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([2, 4, 6]);
      }
    });

    test('accumulates successful results in order', () => {
      const items = ['a', 'b', 'c'];
      const result = mapResults(items, (s) => ({
        success: true as const,
        data: s.toUpperCase(),
      }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['A', 'B', 'C']);
      }
    });

    test('short-circuits on first error', () => {
      const items = [1, 2, 3, 4];
      let itemsProcessed = 0;

      const result = mapResults(items, (n) => {
        itemsProcessed++;
        if (n === 3) {
          return { success: false as const, error: 'Failed at 3' };
        }
        return { success: true as const, data: n };
      });

      expect(itemsProcessed).toBe(3); // Stopped at item 3
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Failed');
      }
    });

    test('handles empty array', () => {
      const result = mapResults([], (n: number) => ({
        success: true as const,
        data: n,
      }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    test('handles complex transformations', () => {
      interface Item {
        id: number;
        name: string;
      }

      const items: Item[] = [
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ];

      const result = mapResults(items, (item) => ({
        success: true as const,
        data: `${item.id}-${item.name}`,
      }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(['1-a', '2-b']);
      }
    });

    test('preserves error details when short-circuiting', () => {
      const items = [1, 2, 3];
      const result = mapResults(items, (n) => {
        if (n === 2) {
          return {
            success: false as const,
            error: 'Transform error',
            details: 'Item 2 failed',
          };
        }
        return { success: true as const, data: n };
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Transform error');
        expect(result.details).toBe('Item 2 failed');
      }
    });
  });

  describe('tap', () => {
    test('executes side effect on success', () => {
      let sideEffectRan = false;
      let sideEffectData: number | undefined;

      const result: Result<number> = { success: true, data: 42 };
      const tapped = tap(result, (data) => {
        sideEffectRan = true;
        sideEffectData = data;
      });

      expect(sideEffectRan).toBe(true);
      expect(sideEffectData).toBe(42);
      expect(tapped).toBe(result); // Returns original result
    });

    test('returns original result unchanged', () => {
      const result: Result<number> = { success: true, data: 42 };
      const tapped = tap(result, () => {
        // no-op
      });

      expect(tapped).toBe(result);
      expect(tapped.success).toBe(true);
      if (tapped.success) {
        expect(tapped.data).toBe(42);
      }
    });

    test('skips side effect on error', () => {
      let sideEffectRan = false;
      const result: Result<number> = { success: false, error: 'Failed' };

      const tapped = tap(result, () => {
        sideEffectRan = true;
      });

      expect(sideEffectRan).toBe(false);
      expect(tapped).toBe(result); // Still returns original
    });

    test('handles side effects with complex data', () => {
      let capturedData: { name: string; count: number } | undefined;

      const result: Result<{ name: string; count: number }> = {
        success: true,
        data: { name: 'test', count: 10 },
      };

      tap(result, (data) => {
        capturedData = data;
      });

      expect(capturedData).toEqual({ name: 'test', count: 10 });
    });

    test('can be used in functional pipelines', () => {
      let loggedValue: number | undefined;

      const result = chain({ success: true as const, data: 5 }, (n) => {
        const intermediate: Result<number> = { success: true, data: n * 2 };
        return tap(intermediate, (v) => {
          loggedValue = v;
        });
      });

      expect(loggedValue).toBe(10);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(10);
      }
    });
  });

  describe('Integration: Combined functional operations', () => {
    test('chains tryCatch with chain and tap', () => {
      let loggedValue = '';

      const result = chain(
        tryCatch(() => 10, 'Initial failed'),
        (n) => {
          const multipled: Result<number> = { success: true, data: n * 2 };
          return tap(multipled, (v) => {
            loggedValue = `Value: ${v}`;
          });
        },
      );

      expect(loggedValue).toBe('Value: 20');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(20);
      }
    });

    test('chainPipe with error short-circuiting behavior', () => {
      const result = chainPipe(
        [1, 2, 3],
        (items: number[]) => mapResults(items, (n) => ({ success: true as const, data: n * 2 })),
        (items: number[]) => ({
          success: true as const,
          data: items.reduce((a, b) => a + b, 0),
        }),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(12); // (1*2) + (2*2) + (3*2) = 12
      }
    });

    test('mapResults with chainPipe for each item', () => {
      const result = mapResults([1, 2, 3], (n) =>
        chainPipe(
          n,
          (num: number) => ({ success: true as const, data: num * 2 }),
          (num: number) => ({ success: true as const, data: num + 1 }),
        ),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([3, 5, 7]); // (1*2)+1, (2*2)+1, (3*2)+1
      }
    });
  });
});
