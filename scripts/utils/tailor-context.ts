import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import yaml from 'js-yaml';
import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import { MetadataSchema } from '../../src/zod/schemas';
import { TailorContextSchema, type TailorContext } from '../../src/zod/tailor-context-schema';
import { PATHS, type CompanyFileValue } from '../shared/config';
import type { z } from 'zod';

// Result type for functional error handling
export type Result<T, E = { error: string; details?: string }> =
  | { success: true; data: T }
  | ({ success: false } & E);

export interface FileToValidate {
  fileName: CompanyFileValue;
  path: string;
  type: z.ZodSchema<unknown>;
  wrapperKey: string | null; // Key to extract nested data from YAML (e.g., 'job_analysis', 'resume'), or null if no wrapper
}

type FileToValidateWithYamlData = FileToValidate & { data: unknown };

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
}

export type SetContextResult = SetContextSuccess | SetContextError;

// ============================================================================
// Path Validation
// ============================================================================
export const validateCompanyPath = (companyPath: string): Result<void> => {
  return existsSync(companyPath)
    ? { success: true, data: void 0 }
    : {
        success: false,
        error: `Company folder not found: ${companyPath}`,
        details: `Available companies: ${getAvailableCompanies(PATHS.TAILOR_BASE).join(', ') || 'none'}`,
      };
};

export const validateFilePathsExists = (
  pathsToValidate: FileToValidate[],
): Result<FileToValidate[]> => {
  return pathsToValidate.reduce<Result<FileToValidate[]>>(
    (acc, item) => {
      if (!acc.success) {
        return acc;
      }

      if (!existsSync(item.path)) {
        return {
          success: false,
          error: `${item.fileName} not found: ${item.path}`,
        };
      }

      return acc;
    },
    { success: true, data: pathsToValidate },
  );
};

// ============================================================================
// File Reading
// ============================================================================

/**
 * Loads YAML files from the given paths and extracts nested data based on wrapperKey.
 * Handles files that have a wrapper structure (e.g., { job_analysis: {...} }).
 *
 * @param pathsToValidate - Array of files to load with their metadata and optional wrapperKey
 * @returns Result containing files with loaded YAML data, or first error encountered
 */
export const loadYamlFilesFromPath = (
  pathsToValidate: FileToValidate[],
): Result<FileToValidateWithYamlData[]> => {
  return mapResults(pathsToValidate, (file) =>
    pipe(readYaml(file.path), (r) =>
      chain(r, (rawData) => {
        // Extract data from wrapper if wrapperKey is specified
        const extractedData = file.wrapperKey
          ? (rawData as Record<string, unknown>)?.[file.wrapperKey] || rawData
          : rawData;

        // Return the file with extracted data (not yet validated)
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
 * Preserves the file metadata while validating the data.
 *
 * @param filesToValidate - Array of files with loaded YAML data to validate
 * @returns Result containing validated files or first validation error
 */
export const validateYamlFileAgainstZodSchema = (
  filesToValidate: FileToValidateWithYamlData[],
): Result<FileToValidateWithYamlData[]> => {
  return mapResults(filesToValidate, (file) =>
    pipe(validateSchema(file.type as z.ZodSchema<unknown>, file.data, file.fileName), (r) =>
      chain(r, (validatedData) => ({
        success: true as const,
        data: { ...file, data: validatedData },
      })),
    ),
  );
};

// ============================================================================
// Context Generation and Writing
// ============================================================================
export const extractMetadata = (
  files: FileToValidateWithYamlData[],
  fileName: CompanyFileValue,
): Result<z.infer<typeof MetadataSchema>> => {
  const metadataFile = files.find((f) => f.fileName === fileName);
  return metadataFile
    ? { success: true, data: metadataFile.data as z.infer<typeof MetadataSchema> }
    : { success: false, error: 'Metadata file not found in validated files' };
};

export const generateAndWriteInitialTailorContext = (
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

const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((i) => `  - ${i.path.length > 0 ? i.path.join('.') : 'root'}: ${i.message}`)
    .join('\n');

/**
 * Generate YAML content for tailor context using schema-driven approach
 * This is the single source of truth - all YAML generation flows through this function
 */
const generateContextYaml = (
  companyName: string,
  meta: z.infer<typeof MetadataSchema>,
  timestamp: string,
): string => {
  // Construct data object from schema
  // Note: active_template has a default value in MetadataSchema, so it's always defined after parsing
  const contextData: TailorContext = {
    active_company: companyName,
    company: meta.company,
    folder_path: meta.folder_path,
    available_files: meta.available_files,
    active_template: meta.active_template ?? 'modern', // Fallback to 'modern' if somehow undefined
    position: meta.position,
    primary_focus: meta.primary_focus,
    job_summary: meta.job_summary,
    job_details: meta.job_details,
    last_updated: timestamp,
  };

  // Validate against schema before serialization
  const validation = TailorContextSchema.safeParse(contextData);
  if (!validation.success) {
    const errorDetails = formatZodError(validation.error);
    throw new Error(`Context data validation failed:\n${errorDetails}`);
  }

  // Generate YAML with header comments
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

export const chain = <A, B>(result: Result<A>, f: (data: A) => Result<B>): Result<B> =>
  match(result)
    .with({ success: true }, ({ data }) => f(data))
    .otherwise((error) => error);

/**
 * Chains multiple functions together in a pipeline, where each function
 * takes the success data from the previous Result and returns a new Result.
 * Stops at the first error encountered.
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
 * Maps over an array, applying a transformation that returns a Result.
 * Returns the first error encountered, or all successful results.
 * Uses reduce for functional composition with early exit on error.
 */
const mapResults = <T, U>(items: T[], transform: (item: T) => Result<U>): Result<U[]> => {
  return items.reduce<Result<U[]>>(
    (acc, item) => {
      if (!acc.success) {
        return acc; // Short-circuit on first error
      }

      const result = transform(item);
      if (!result.success) {
        return result as Result<U[]>; // Cast error to expected return type
      }

      // Accumulate successful result
      return {
        success: true,
        data: [...acc.data, result.data],
      };
    },
    { success: true, data: [] }, // Start with empty array
  );
};

const readYaml = (path: string): Result<unknown> =>
  pipe(
    tryCatch(() => readFileSync(path, 'utf-8'), `Failed to read ${path}`),
    (r) => chain(r, (content) => tryCatch(() => yaml.load(content), 'Invalid YAML')),
  );

const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown, name: string): Result<T> => {
  const validation = schema.safeParse(data);
  return validation.success
    ? { success: true, data: validation.data }
    : {
        success: false,
        error: `${name} validation failed`,
        details: formatZodError(validation.error),
      };
};
