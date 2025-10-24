import { match } from 'ts-pattern';
import type { Result } from '@shared/validation/validation-pipeline';

/**
 * Wraps a function in try-catch and returns a Result type.
 *
 * Executes the function and returns success Result on completion, or error Result
 * with message and details on exception.
 *
 * @template T - Return type of the wrapped function
 * @param {() => T} fn - Function to execute
 * @param {string} errorMsg - Error message to use if function throws
 * @returns {Result<T>} Success with function result or error with details
 */
export const tryCatch = <T>(fn: () => T, errorMsg: string): Result<T> => {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    return {
      success: false,
      error: errorMsg,
      details: error instanceof Error ? error.message : String(error),
      originalError: error,
    };
  }
};

/**
 * Wraps an async function in try-catch and returns a Promise of Result type.
 *
 * Executes the async function and returns success Result on completion, or error Result
 * with message and details on exception. Async version of tryCatch.
 *
 * @template T - Return type of the wrapped async function
 * @param {() => Promise<T>} fn - Async function to execute
 * @param {string} errorMsg - Error message to use if function throws
 * @returns {Promise<Result<T>>} Promise of success with function result or error with details
 */
export const tryCatchAsync = async <T>(
  fn: () => Promise<T>,
  errorMsg: string,
): Promise<Result<T>> => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: errorMsg,
      details: error instanceof Error ? error.message : String(error),
      originalError: error,
    };
  }
};

/**
 * Monadic chain operation for Result type (flatMap/bind).
 *
 * If result is success, applies function to the data and returns the new Result.
 * If result is error, propagates the error without calling the function.
 * Enables functional composition of operations that may fail.
 *
 * @template A - Type of the input Result's data
 * @template B - Type of the output Result's data
 * @param {Result<A>} result - Input Result to chain from
 * @param {(data: A) => Result<B>} f - Function to apply if result is success
 * @returns {Result<B>} New Result from function, or propagated error
 */
export const chain = <A, B>(result: Result<A>, f: (data: A) => Result<B>): Result<B> =>
  match(result)
    .with({ success: true }, ({ data }) => f(data))
    .otherwise((error) => error);

/**
 * Chains multiple functions together in a pipeline using left-to-right composition.
 *
 * Each function takes the success data from the previous Result and returns a new Result.
 * The pipeline stops at the first error encountered and propagates it through.
 * Wraps initial value in success Result before applying functions.
 *
 * @template T - Type of the initial data
 * @param {T} initial - Initial data to start the pipeline
 * @param {...Array<(data: any) => Result<any>>} fns - Functions to chain together
 * @returns {Result<any>} Final Result from pipeline, or first error encountered
 *
 * @example
 * chainPipe(
 *   initialData,
 *   validateData,
 *   transformData,
 *   saveData
 * )
 */
export const chainPipe = <T>(
  initial: T,
  ...fns: Array<(data: any) => Result<any>>
): Result<any> => {
  return fns.reduce<Result<any>>((result, fn) => chain(result, fn), {
    success: true,
    data: initial,
  });
};

/**
 * Maps over an array applying a transformation that returns a Result.
 *
 * Accumulates all successful results into an array. Returns the first error encountered,
 * short-circuiting remaining items. Uses reduce for functional composition with early exit.
 *
 * @template T - Type of input array items
 * @template U - Type of transformed items
 * @param {T[]} items - Array of items to transform
 * @param {(item: T) => Result<U>} transform - Transformation function returning Result
 * @returns {Result<U[]>} Success with array of transformed items, or first error encountered
 */
export const mapResults = <T, U>(items: T[], transform: (item: T) => Result<U>): Result<U[]> => {
  return items.reduce<Result<U[]>>(
    (acc, item) => {
      if (!acc.success) {
        return acc;
      }

      const result = transform(item);
      if (!result.success) {
        return result as Result<U[]>;
      }

      return {
        success: true,
        data: [...acc.data, result.data],
      };
    },
    { success: true, data: [] },
  );
};

/**
 * Executes a side effect on successful Result without modifying the data.
 *
 * If result is success, runs the side effect function with the data and returns the original result.
 * If result is error, returns the error unchanged without running the side effect.
 * Useful for logging, analytics, or other side effects in functional pipelines.
 *
 * @template T - Type of the Result's data
 * @param {Result<T>} result - Input Result to tap into
 * @param {(data: T) => void} sideEffect - Side effect function to run on success
 * @returns {Result<T>} Original Result unchanged
 *
 * @example
 * pipe(
 *   validateData(input),
 *   (r) => tap(r, (data) => logger.info('Validation passed')),
 *   (r) => chain(r, transformData)
 * )
 */
export const tap = <T>(result: Result<T>, sideEffect: (data: T) => void): Result<T> => {
  if (result.success) {
    sideEffect(result.data);
  }
  return result;
};
