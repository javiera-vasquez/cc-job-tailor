import path from 'path';
import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import { parseCliArgs, validateRequiredArg } from '@shared/cli/cli-args';
import { DOCUMENT_TYPES, PATHS, TAILOR_YAML_FILES_AND_SCHEMAS } from '@shared/core/config';
import { PathHelpers } from '@shared/core/path-helpers';
import { validateCompanyPath } from '@shared/validation/company-validation';
import { loggers } from '@shared/core/logger';
import { validateYamlFilesAgainstSchemasPipeline } from '@shared/validation/validation-pipeline';
import type {
  YamlFilesAndSchemasToWatch,
  PdfGenerationResult,
  SuccessResult,
} from '@shared/validation/types';
import { generateApplicationDataInMemory } from '@shared/data/data-generation';
import { handlePipelineError } from '@shared/handlers/result-handlers';
import { chain, tap } from '@shared/core/functional-utils';
import {
  selectThemeFromMetadata,
  ensureOutputDirectory,
  generateDocument,
  type OutputDirectoryContext,
  type GeneratedDocument,
} from '@shared/document/document-generation';

const USAGE_MESSAGE = 'Usage: bun run save-to-pdf -C company-name [-D resume|cover-letter|both]';

// Parse and validate command-line arguments
const values = parseCliArgs(
  {
    options: {
      C: {
        type: 'string',
        short: 'C',
        required: true,
      },
      D: {
        type: 'string',
        short: 'D',
        required: false,
      },
    },
  },
  loggers.pdf,
  USAGE_MESSAGE,
);

const companyName = validateRequiredArg(values.C, 'Company name', loggers.pdf, USAGE_MESSAGE);
const documentType = (values.D || DOCUMENT_TYPES.BOTH) as string;

/**
 * Executes the complete PDF generation pipeline using functional composition
 *
 * Pipeline flow:
 * 1. Validates company directory exists
 * 2. Validates YAML files against Zod schemas
 * 3. Generates ApplicationData in-memory
 * 4. Selects and validates theme from metadata
 * 5. Ensures output directory exists
 * 6. Generates PDF documents based on type
 *
 * Each step returns a Result type, enabling automatic error propagation.
 * The pipeline stops at the first error encountered.
 *
 * @param {string} companyName - Company name for tailor directory
 * @param {YamlFilesAndSchemasToWatch[]} yamlDocumentsToValidate - Files and schemas to validate
 * @returns {Promise<void>} Exits process with code 0 on success, 1 on failure
 */
const initPdfGeneration = async (
  companyName: string,
  yamlDocumentsToValidate: YamlFilesAndSchemasToWatch[],
): Promise<void> => {
  const result = await executePdfGeneration(companyName, yamlDocumentsToValidate);

  return match(result)
    .with({ success: true }, ({ data }) => onSuccess(data))
    .with({ success: false }, (errorResult) =>
      onError(
        errorResult.error,
        'details' in errorResult ? errorResult.details : undefined,
        'originalError' in errorResult ? errorResult.originalError : undefined,
        'filePath' in errorResult ? errorResult.filePath : undefined,
      ),
    )
    .exhaustive();
};

/**
 * Executes the full PDF generation pipeline with async support
 *
 * Chains synchronous validation/data generation with async theme selection,
 * directory creation, and PDF rendering. Uses early return pattern for error handling.
 *
 * @param {string} companyName - Company name for tailor directory
 * @param {YamlFilesAndSchemasToWatch[]} yamlDocumentsToValidate - Files and schemas to validate
 * @returns {Promise<Result>} Final result with generated files or error
 */
const executePdfGeneration = async (
  companyName: string,
  yamlDocumentsToValidate: YamlFilesAndSchemasToWatch[],
): Promise<PdfGenerationResult> => {
  // Step 1-3: Validation and data generation (synchronous)
  const dataResult = validateAndGenerateDataPipeline(companyName, yamlDocumentsToValidate);

  if (!dataResult.success) {
    return dataResult;
  }

  // Step 4: Theme selection (synchronous)
  const themeResult = selectThemeFromMetadata(dataResult.data);

  if (!themeResult.success) {
    return themeResult;
  }

  // Step 5: Directory creation (async)
  const outputDir = path.join(PathHelpers.getProjectRoot(), PATHS.TEMP_PDF);
  const dirResult = await ensureOutputDirectory(themeResult.data, outputDir);

  if (!dirResult.success) {
    return dirResult;
  }

  // Step 6: PDF generation (async)
  const pdfResult = await generatePdfDocuments(documentType, companyName)(dirResult.data);

  return pdfResult;
};

/**
 * Chains validation and data generation pipelines using functional composition
 *
 * Pipeline flow:
 * 1. Validates company directory exists
 * 2. Validates YAML files against schemas
 * 3. Generates ApplicationData in-memory from validated files
 *
 * Uses pipe for composition, chain for Result monad handling, and tap for side effects.
 * Stops at first error and propagates it through the chain.
 *
 * @param {string} companyName - Company name for tailor directory
 * @param {YamlFilesAndSchemasToWatch[]} yamlFilesAndSchemas - Files and schemas to validate
 * @returns {Result} Result object with success status and data or error details
 */
const validateAndGenerateDataPipeline = (
  companyName: string,
  yamlFilesAndSchemas: YamlFilesAndSchemasToWatch[],
) => {
  return pipe(
    validateCompanyPath(PathHelpers.getCompanyPath(companyName)),
    (r) =>
      chain(r, () => validateYamlFilesAgainstSchemasPipeline(companyName, yamlFilesAndSchemas)),
    (r) => chain(r, generateApplicationDataInMemory),
    (r) => tap(r, () => loggers.pdf.success('Data validated & generated')),
  );
};
/**
 * Transforms generated documents array into file paths result
 *
 * @param {GeneratedDocument[]} documents - Array of generated documents
 * @param {string} theme - Theme name used for generation
 * @returns {SuccessResult} Success result with file paths and theme
 */
const extractFilePaths = (
  documents: GeneratedDocument[],
  theme: string,
): SuccessResult<{ files: readonly string[]; theme: string }> =>
  ({
    success: true,
    data: {
      files: documents.map((doc) => doc.filePath),
      theme,
    },
  }) as const;

/**
 * Generates PDF documents based on document type specification
 *
 * Determines which documents to generate (resume, cover letter, or both)
 * and delegates to generateDocument with appropriate docTypes array.
 * Uses functional composition (pipe + chain) to transform results.
 *
 * @param {string} documentType - Type of document to generate
 * @param {string} companyName - Company name for file naming
 * @returns {Function} Function that takes context and generates PDFs
 */
const generatePdfDocuments =
  (documentType: string, companyName: string) =>
  async (context: OutputDirectoryContext): Promise<PdfGenerationResult> => {
    const { applicationData, theme, themeName, outputDir } = context;

    // Map document type to docTypes array
    const docTypesMap: Record<
      string,
      (typeof DOCUMENT_TYPES.RESUME | typeof DOCUMENT_TYPES.COVER_LETTER)[]
    > = {
      [DOCUMENT_TYPES.BOTH]: [DOCUMENT_TYPES.RESUME, DOCUMENT_TYPES.COVER_LETTER],
      [DOCUMENT_TYPES.RESUME]: [DOCUMENT_TYPES.RESUME],
      [DOCUMENT_TYPES.COVER_LETTER]: [DOCUMENT_TYPES.COVER_LETTER],
    };

    const docTypes = docTypesMap[documentType as keyof typeof docTypesMap];

    if (!docTypes) {
      return {
        success: false,
        error: 'Invalid document type',
        details: `Received unexpected document type: ${documentType}`,
      } as const;
    }

    return pipe(
      await generateDocument({
        docTypes,
        theme,
        applicationData,
        outputDir,
        companyName,
      }),
      (r) => chain(r, (docs) => extractFilePaths(docs, themeName)),
    );
  };

/**
 * Handles successful PDF generation
 *
 * @param {Object} result - Result with generated file paths and theme
 * @returns {void} Exits process with code 0
 */
const onSuccess = (result: { files: readonly string[]; theme: string }): void => {
  const projectRoot = PathHelpers.getProjectRoot();

  loggers.pdf.success(`PDFs created (${result.theme} theme)`);
  result.files.forEach((file) => {
    const relativePath = file.replace(projectRoot + '/', '');
    loggers.pdf.info(`→ ${relativePath}`);
  });
  process.exit(0);
};

/**
 * Handles pipeline errors by delegating to shared error handler
 *
 * Uses shared error handler for consistent formatting with specialized
 * ZodError handling. Process exits with code 1 after logging.
 *
 * @param {string} error - Primary error message
 * @param {string} [details] - Additional error details
 * @param {unknown} [originalError] - Original error object (checked for ZodError)
 * @param {string} [filePath] - Path to file where error occurred
 * @returns {void} Exits process with code 1
 */
const onError = (
  error: string,
  details?: string,
  originalError?: unknown,
  filePath?: string,
): void => {
  handlePipelineError(
    { success: false, error, details, originalError, filePath },
    {
      logger: loggers.pdf,
      shouldExit: true,
    },
  );
};

// Run pipeline
await initPdfGeneration(companyName, TAILOR_YAML_FILES_AND_SCHEMAS);
