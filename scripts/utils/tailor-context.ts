import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import yaml from 'js-yaml';
import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import { MetadataSchema } from '../../src/zod/schemas';
import { TailorContextSchema, type TailorContext } from '../../src/zod/tailor-context-schema';
import { PATHS, type CompanyFileValue } from '../shared/config';
import { validateApplicationData } from '../../src/zod/validation';
import {
  transformFilesToApplicationData,
  generateTypeScriptModule,
} from './application-data-generator';
import { loggers } from '../shared/logger';
import type { z } from 'zod';
import type { ApplicationData } from '../../src/types';

// Result type for functional error handling
export type Result<
  T,
  E = { error: string; details?: string; originalError?: unknown; filePath?: string },
> = { success: true; data: T } | ({ success: false } & E);

export interface FileToValidate {
  fileName: CompanyFileValue;
  path: string;
  type: z.ZodSchema<unknown>;
  wrapperKey: string | null; // Key to extract nested data from YAML (e.g., 'job_analysis', 'resume'), or null if no wrapper
}

export type FileToValidateWithYamlData = FileToValidate & { data: unknown };

export interface SetContextSuccess {
  success: true;
  data: {
    company: string;
    path: string;
    availableFiles: string[];
    position: string;
    primaryFocus: string;
    timestamp: string;
  };
}

export interface SetContextError {
  success: false;
  error: string;
  details?: string;
  originalError?: unknown;
  filePath?: string;
}

export type SetContextResult = SetContextSuccess | SetContextError;

// ============================================================================
// Path Validation
// ============================================================================

/**
 * Validates that the company directory exists in the tailor base path.
 *
 * @param {string} companyPath - Absolute path to the company folder
 * @returns {Result<void>} Success if directory exists, error with available companies list if not
 *
 * @example
 * validateCompanyPath('/path/to/resume-data/tailor/acme-corp')
 * // => { success: true, data: undefined }
 */
export const validateCompanyPath = (companyPath: string): Result<void> => {
  return existsSync(companyPath)
    ? { success: true, data: void 0 }
    : {
        success: false,
        error: `Company folder not found: ${companyPath}`,
        details: `Available companies: ${getAvailableCompanies(PATHS.TAILOR_BASE).join(', ') || 'none'}`,
      };
};

/**
 * Validates that all required company files exist on the filesystem.
 *
 * Checks each file path and returns a detailed error message listing all missing files
 * if any are not found. Returns the original array on success for pipeline continuation.
 *
 * @param {FileToValidate[]} pathsToValidate - Array of file metadata with paths to validate
 * @returns {Result<FileToValidate[]>} Success with files array, or error with missing files details
 *
 * @example
 * validateFilePathsExists([
 *   { fileName: 'metadata.yaml', path: '/path/to/metadata.yaml', type: MetadataSchema, wrapperKey: null }
 * ])
 * // => { success: true, data: [...] }
 */
export const validateFilePathsExists = (
  pathsToValidate: FileToValidate[],
): Result<FileToValidate[]> => {
  const missingFiles = pathsToValidate.filter((item) => !existsSync(item.path));

  if (missingFiles.length > 0) {
    const expectedFiles = pathsToValidate.map((f) => f.fileName);
    const foundFiles = pathsToValidate.filter((f) => existsSync(f.path)).map((f) => f.fileName);
    const missingFileNames = missingFiles.map((f) => f.fileName);

    const errorLines = [
      `Missing ${missingFiles.length} required file(s):`,
      ...missingFileNames.map((name) => `  - ${name}`),
      `Expected files: ${expectedFiles.join(', ')}`,
      `Found files: ${foundFiles.length > 0 ? foundFiles.join(', ') : 'none'}`,
    ];

    return {
      success: false,
      error: errorLines[0] || 'Missing required files',
      details: errorLines.slice(1).join('\n'),
    };
  }

  return { success: true, data: pathsToValidate };
};

// ============================================================================
// File Reading
// ============================================================================

/**
 * Loads YAML files from the given paths and extracts nested data based on wrapperKey.
 *
 * Handles files with wrapper structures (e.g., `{ job_analysis: {...} }`) by extracting
 * the nested data when wrapperKey is specified. Data is loaded but not yet validated.
 *
 * @param {FileToValidate[]} pathsToValidate - Array of files to load with their metadata and optional wrapperKey
 * @returns {Result<FileToValidateWithYamlData[]>} Result containing files with loaded YAML data, or first error encountered
 *
 * @example
 * loadYamlFilesFromPath([
 *   { fileName: 'job-analysis.yaml', path: '/path/to/file.yaml', type: JobAnalysisSchema, wrapperKey: 'job_analysis' }
 * ])
 * // Extracts data from { job_analysis: { ... } } structure
 */
export const loadYamlFilesFromPath = (
  pathsToValidate: FileToValidate[],
): Result<FileToValidateWithYamlData[]> => {
  return mapResults(pathsToValidate, (file) =>
    pipe(readYaml(file.path), (r) =>
      chain(r, (rawData) => {
        const extractedData = file.wrapperKey
          ? (rawData as Record<string, unknown>)?.[file.wrapperKey] || rawData
          : rawData;

        return {
          success: true as const,
          data: { ...file, data: extractedData },
        };
      }),
    ),
  );
};

/**
 * Validates loaded YAML files against their associated Zod schemas.
 *
 * Preserves the file metadata while validating the data. Returns detailed validation
 * errors including field paths and file locations on failure.
 *
 * @param {FileToValidateWithYamlData[]} filesToValidate - Array of files with loaded YAML data to validate
 * @returns {Result<FileToValidateWithYamlData[]>} Result containing validated files or first validation error
 *
 * @example
 * validateYamlFileAgainstZodSchema([
 *   { fileName: 'metadata.yaml', path: '/path/to/file.yaml', type: MetadataSchema, wrapperKey: null, data: {...} }
 * ])
 * // => { success: true, data: [...] } if valid
 * // => { success: false, error: '...', details: '...', filePath: '...' } if invalid
 */
export const validateYamlFileAgainstZodSchema = (
  filesToValidate: FileToValidateWithYamlData[],
): Result<FileToValidateWithYamlData[]> => {
  return mapResults(filesToValidate, (file) =>
    pipe(
      validateSchema(file.type as z.ZodSchema<unknown>, file.data, file.fileName, file.path),
      (r) =>
        chain(r, (validatedData) => ({
          success: true as const,
          data: { ...file, data: validatedData },
        })),
    ),
  );
};

// ============================================================================
// Application Data Generation
// ============================================================================

/**
 * Transforms validated YAML files to ApplicationData using fileName mapping.
 *
 * Maps each file's fileName to the corresponding ApplicationData property
 * (metadata, job_analysis, resume, cover_letter) using the transformation utility.
 *
 * @param {FileToValidateWithYamlData[]} files - Validated YAML files with extracted data
 * @returns {Result<ApplicationData>} Result containing ApplicationData object or transformation error
 */
const transformToApplicationData = (
  files: FileToValidateWithYamlData[],
): Result<ApplicationData> => {
  loggers.generate.info('Generating application data module');
  return transformFilesToApplicationData(files);
};

/**
 * Validates ApplicationData against the complete Zod schema.
 *
 * Ensures all required fields are present and properly typed before generating
 * the TypeScript module. Logs success or returns detailed validation errors.
 *
 * @param {ApplicationData} applicationData - Complete application data to validate
 * @returns {Result<ApplicationData>} Result containing validated data or Zod validation errors
 */
const validateApplicationDataSchema = (
  applicationData: ApplicationData,
): Result<ApplicationData> => {
  const result = tryCatch(
    () => validateApplicationData(applicationData),
    'Application data validation failed',
  );

  if (result.success) {
    loggers.generate.success('Application data validation passed');
  }

  return result.success ? { success: true, data: applicationData } : result;
};

/**
 * Generates TypeScript module content from ApplicationData.
 *
 * Returns a curried function that transforms ApplicationData into a TypeScript module
 * string with proper imports, types, and exports.
 *
 * @param {string} companyName - Company name for module comments and metadata
 * @returns {Function} Function that accepts ApplicationData and returns Result with TypeScript module string
 */
const generateTypeScriptContent = (
  companyName: string,
): ((data: ApplicationData) => Result<string>) => {
  return (applicationData) => {
    const tsContent = generateTypeScriptModule(applicationData, companyName);
    return { success: true, data: tsContent };
  };
};

/**
 * Writes TypeScript module to disk at the configured path.
 *
 * Uses Bun.write for efficient file writing and logs success with file path.
 * Returns the TypeScript content on success for pipeline continuation.
 *
 * @param {string} tsContent - TypeScript module content to write
 * @returns {Result<string>} Result containing the TypeScript content or write error
 */
const writeTypeScriptModule = (tsContent: string): Result<string> => {
  const writeResult = tryCatch(
    () => Bun.write(PATHS.GENERATED_DATA, tsContent),
    'Failed to write application data',
  );

  if (writeResult.success) {
    loggers.generate.success(`Application data written to ${PATHS.GENERATED_DATA}`);
  }

  return writeResult.success ? { success: true, data: tsContent } : writeResult;
};

/**
 * Generates ApplicationData TypeScript module from validated files using a pure functional pipeline.
 *
 * Orchestrates the complete data generation flow:
 * 1. Transforms validated files to ApplicationData object
 * 2. Validates the complete ApplicationData against Zod schema
 * 3. Generates TypeScript module content
 * 4. Writes module to disk at configured path
 *
 * Returns the original files unchanged for pipeline continuation.
 *
 * @param {string} companyName - Name of the company for module comments and metadata
 * @param {FileToValidateWithYamlData[]} files - Validated YAML files with extracted data
 * @returns {Result<FileToValidateWithYamlData[]>} Result containing the same files for pipeline continuation
 */
export const generateApplicationData = (
  companyName: string,
  files: FileToValidateWithYamlData[],
): Result<FileToValidateWithYamlData[]> => {
  return pipe(
    chainPipe(
      files,
      transformToApplicationData,
      validateApplicationDataSchema,
      generateTypeScriptContent(companyName),
      writeTypeScriptModule,
    ),
    (result) =>
      chain(result, () => ({
        success: true as const,
        data: files,
      })),
  );
};

// ============================================================================
// Context Generation and Writing
// ============================================================================

/**
 * Extracts metadata from the validated files array by fileName.
 *
 * Searches the files array for the metadata file and returns its validated data.
 *
 * @param {FileToValidateWithYamlData[]} files - Array of validated files with data
 * @param {CompanyFileValue} fileName - File name to search for (typically COMPANY_FILES.METADATA)
 * @returns {Result<MetadataSchema>} Result containing metadata or error if not found
 */
export const extractMetadata = (
  files: FileToValidateWithYamlData[],
  fileName: CompanyFileValue,
): Result<z.infer<typeof MetadataSchema>> => {
  const metadataFile = files.find((f) => f.fileName === fileName);
  return metadataFile
    ? { success: true, data: metadataFile.data as z.infer<typeof MetadataSchema> }
    : { success: false, error: 'Metadata file not found in validated files' };
};

/**
 * Generates and writes the tailor-context.yaml file with company metadata.
 *
 * Creates the YAML context configuration with schema validation, header comments,
 * and timestamp. Ensures active_template has a default value if not specified.
 *
 * @param {string} companyName - Company name for context
 * @param {MetadataSchema} metadata - Validated metadata from company files
 * @param {string} contextPath - Absolute path to write tailor-context.yaml
 * @returns {Result<SetContextSuccess['data']>} Result containing context summary or write error
 */
export const generateAndWriteTailorContext = (
  companyName: string,
  metadata: z.infer<typeof MetadataSchema>,
  contextPath: string,
): Result<SetContextSuccess['data']> => {
  const ts = new Date().toISOString();
  const metaWithTemplate = {
    ...metadata,
    active_template: metadata.active_template ?? ('modern' as const),
  };

  const yaml = generateContextYaml(companyName, metaWithTemplate, ts);
  const write = tryCatch(
    () => writeFileSync(contextPath, yaml, 'utf-8'),
    'Failed to write context',
  );

  return write.success
    ? {
        success: true as const,
        data: {
          company: metadata.company,
          path: metadata.folder_path,
          availableFiles: metadata.available_files,
          position: metadata.position,
          primaryFocus: metadata.primary_focus,
          timestamp: ts,
        },
      }
    : write;
};

/**
 * Gets list of available company directories in the tailor base path.
 *
 * @param {string} base - Base path containing company directories
 * @returns {string[]} Array of company directory names, or empty array if path doesn't exist or on error
 */
const getAvailableCompanies = (base: string): string[] => {
  if (!existsSync(base)) return [];
  try {
    return readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
};

/**
 * Formats Zod validation error into human-readable string.
 *
 * Converts Zod error issues into formatted list with field paths and messages.
 *
 * @param {z.ZodError} error - Zod validation error
 * @returns {string} Formatted error string with one issue per line
 */
const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((i) => `  - ${i.path.length > 0 ? i.path.join('.') : 'root'}: ${i.message}`)
    .join('\n');

/**
 * Generates YAML content for tailor-context.yaml using schema-driven approach.
 *
 * Creates TailorContext object from metadata, validates against TailorContextSchema,
 * and serializes to YAML with header comments. This is the single source of truth
 * for YAML generation.
 *
 * @param {string} companyName - Company name for active_company field
 * @param {MetadataSchema} meta - Validated metadata with active_template default
 * @param {string} timestamp - ISO timestamp for last_updated field
 * @returns {string} YAML string with header comments
 * @throws {Error} If context data fails TailorContextSchema validation
 */
const generateContextYaml = (
  companyName: string,
  meta: z.infer<typeof MetadataSchema>,
  timestamp: string,
): string => {
  const contextData: TailorContext = {
    active_company: companyName,
    company: meta.company,
    folder_path: meta.folder_path,
    available_files: meta.available_files,
    active_template: meta.active_template ?? 'modern',
    position: meta.position,
    primary_focus: meta.primary_focus,
    job_summary: meta.job_summary,
    job_details: meta.job_details,
    last_updated: timestamp,
  };

  const validation = TailorContextSchema.safeParse(contextData);
  if (!validation.success) {
    const errorDetails = formatZodError(validation.error);
    throw new Error(`Context data validation failed:\n${errorDetails}`);
  }

  const header = [
    '# Auto-generated by /tailor command',
    `# Last updated: ${timestamp}`,
    `# Active company: ${companyName}`,
    '',
  ].join('\n');

  return (
    header +
    yaml.dump(validation.data, {
      indent: 2,
      lineWidth: 120,
      quotingType: '"',
      forceQuotes: false,
    })
  );
};

// ============================================================================
// Functional Helpers
// ============================================================================

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
const tryCatch = <T>(fn: () => T, errorMsg: string): Result<T> => {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    return {
      success: false,
      error: errorMsg,
      details: error instanceof Error ? error.message : String(error),
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
const mapResults = <T, U>(items: T[], transform: (item: T) => Result<U>): Result<U[]> => {
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
 * Reads and parses a YAML file from the filesystem.
 *
 * Combines file reading and YAML parsing in a functional pipeline.
 * Returns detailed errors for both file reading and YAML parsing failures.
 *
 * @param {string} path - Absolute path to YAML file
 * @returns {Result<unknown>} Success with parsed YAML data, or error with details
 */
const readYaml = (path: string): Result<unknown> =>
  pipe(
    tryCatch(() => readFileSync(path, 'utf-8'), `Failed to read ${path}`),
    (r) => chain(r, (content) => tryCatch(() => yaml.load(content), 'Invalid YAML')),
  );

/**
 * Validates data against a Zod schema with detailed error reporting.
 *
 * Performs Zod schema validation and returns formatted errors including field paths,
 * messages, and file location for debugging.
 *
 * @template T - Type of the validated data
 * @param {z.ZodSchema<T>} schema - Zod schema to validate against
 * @param {unknown} data - Data to validate
 * @param {string} name - Display name for error messages
 * @param {string} filePath - File path for error context
 * @returns {Result<T>} Success with validated data, or error with formatted details and original ZodError
 */
const validateSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  name: string,
  filePath: string,
): Result<T> => {
  const validation = schema.safeParse(data);
  return validation.success
    ? { success: true, data: validation.data }
    : {
        success: false,
        error: `${name} validation failed`,
        details: formatZodError(validation.error),
        originalError: validation.error,
        filePath,
      };
};
