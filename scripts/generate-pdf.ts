import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { pipe } from 'remeda';
import { match } from 'ts-pattern';
import { themes } from '../src/templates';
import path from 'path';
import { mkdir } from 'fs/promises';
import { parseCliArgs, validateRequiredArg } from './shared/cli-args';
import { throwInvalidDocumentTypeError } from './shared/error-messages';
import {
  PATHS,
  DOCUMENT_TYPES,
  TAILOR_YAML_FILES_AND_SCHEMAS,
  PathHelpers,
} from './shared/config';
import { validateCompanyPath } from './shared/company-validation';
import { loggers } from './shared/logger';
import {
  validateYamlFilesAgainstSchemasPipeline,
  type YamlFilesAndSchemasToWatch,
} from './shared/validation-pipeline';
import { generateApplicationDataInMemory } from './shared/data-generation';
import { handlePipelineError } from './shared/error-handlers';
import { chain, tap, tryCatchAsync } from './shared/functional-utils';

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
  const result = await executePdfGenerationPipeline(companyName, yamlDocumentsToValidate);

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
const executePdfGenerationPipeline = async (
  companyName: string,
  yamlDocumentsToValidate: YamlFilesAndSchemasToWatch[],
): Promise<
  | { success: true; data: { files: readonly string[] } }
  | {
      success: false;
      error: string;
      details?: string;
      originalError?: unknown;
      filePath?: string;
    }
> => {
  // Step 1-3: Validation and data generation (synchronous)
  const dataResult = pipe(
    validateAndGenerateDataPipeline(companyName, yamlDocumentsToValidate),
    (r) => tap(r, () => loggers.pdf.loading('Data generation completed')),
  );

  if (!dataResult.success) {
    return dataResult;
  }

  // Step 4: Theme selection (synchronous)
  loggers.pdf.loading('Selecting theme...');
  const themeResult = selectThemeFromMetadata(dataResult.data);

  if (!themeResult.success) {
    return themeResult;
  }

  // Step 5: Directory creation (async)
  loggers.pdf.loading('Preparing output directory...');
  const dirResult = await ensureOutputDirectory(themeResult.data);

  if (!dirResult.success) {
    return dirResult;
  }

  // Step 6: PDF generation (async)
  loggers.pdf.loading('Generating PDF documents...');
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
    (r) => tap(r, () => loggers.pdf.loading(`Validating YAML files for ${companyName}...`)),
    (r) =>
      chain(r, () => validateYamlFilesAgainstSchemasPipeline(companyName, yamlFilesAndSchemas)),
    (r) => tap(r, () => loggers.pdf.loading(`Generating application data for ${companyName}...`)),
    (r) => chain(r, generateApplicationDataInMemory),
    (r) => tap(r, () => loggers.pdf.success(`Data generation completed for ${companyName}`)),
  );
};

/**
 * Selects and validates theme from application metadata
 *
 * @param {ApplicationData} applicationData - Validated application data
 * @returns {Result} Result with application data and selected theme
 */
const selectThemeFromMetadata = (applicationData: any) => {
  const activeTemplate = applicationData.metadata?.active_template || 'modern';
  loggers.pdf.info(`Using template: ${activeTemplate}`);

  const selectedTheme = themes[activeTemplate];

  if (!selectedTheme) {
    return {
      success: false,
      error: `Theme '${activeTemplate}' not found`,
      details: `Available themes: ${Object.keys(themes).join(', ')}`,
    } as const;
  }

  return {
    success: true,
    data: {
      applicationData,
      theme: selectedTheme,
      themeName: activeTemplate,
    },
  } as const;
};

/**
 * Ensures output directory exists for PDF generation
 *
 * @param {Object} context - Context with application data and theme
 * @returns {Promise<Result>} Result with context and output directory path
 */
const ensureOutputDirectory = async (context: {
  applicationData: any;
  theme: any;
  themeName: string;
}) => {
  const tmpDir = path.join(import.meta.dir, '..', PATHS.TEMP_PDF);

  const result = await tryCatchAsync(async () => {
    await mkdir(tmpDir, { recursive: true });
    loggers.pdf.debug(`Output directory ready: ${tmpDir}`);

    return {
      ...context,
      outputDir: tmpDir,
    };
  }, 'Failed to create output directory');

  return result;
};

/**
 * Generates a single PDF document
 *
 * @param {Object} params - Generation parameters
 * @returns {Promise<Result>} Result with generated file path
 */
const generateSingleDocument = async ({
  docType,
  theme,
  applicationData,
  outputDir,
  companyName,
}: {
  docType: typeof DOCUMENT_TYPES.RESUME | typeof DOCUMENT_TYPES.COVER_LETTER;
  theme: any;
  applicationData: any;
  outputDir: string;
  companyName: string;
}) => {
  const ResumeDocument = theme.components.resume;
  const CoverLetterDocument = theme.components.coverLetter;

  if (!ResumeDocument || !CoverLetterDocument) {
    return {
      success: false,
      error: 'Theme components not properly loaded',
      details: `Missing resume or cover letter component in theme`,
    } as const;
  }

  const result = await tryCatchAsync(async () => {
    const component =
      docType === DOCUMENT_TYPES.RESUME
        ? React.createElement(ResumeDocument, { data: applicationData.resume ?? undefined })
        : React.createElement(CoverLetterDocument, {
            data: applicationData.cover_letter ?? undefined,
          });

    const filePath = path.join(outputDir, `${docType}-${companyName}.pdf`);

    loggers.pdf.loading(`Generating ${docType} PDF for ${companyName}`);
    loggers.pdf.debug(`Output path: ${filePath}`);

    await renderToFile(component as any, filePath);

    loggers.pdf.success(`${docType} PDF generated successfully for ${companyName}`);

    return { filePath, docType };
  }, `Failed to generate ${docType} PDF`);

  return result;
};

/**
 * Generates PDF documents based on document type
 *
 * @param {string} documentType - Type of document to generate
 * @param {string} companyName - Company name for file naming
 * @returns {Function} Function that takes context and generates PDFs
 */
const generatePdfDocuments =
  (documentType: string, companyName: string) =>
  async (context: { applicationData: any; theme: any; themeName: string; outputDir: string }) => {
    const { applicationData, theme, outputDir } = context;

    const generateParams = {
      theme,
      applicationData,
      outputDir,
      companyName,
    };

    // Generate documents based on specified type
    const result = await match(documentType)
      .with(DOCUMENT_TYPES.BOTH, async () => {
        const resumeResult = await generateSingleDocument({
          ...generateParams,
          docType: DOCUMENT_TYPES.RESUME,
        });

        if (!resumeResult.success) {
          return resumeResult;
        }

        const coverLetterResult = await generateSingleDocument({
          ...generateParams,
          docType: DOCUMENT_TYPES.COVER_LETTER,
        });

        if (!coverLetterResult.success) {
          return coverLetterResult;
        }

        return {
          success: true,
          data: {
            files: [resumeResult.data.filePath, coverLetterResult.data.filePath],
          },
        } as const;
      })
      .with(DOCUMENT_TYPES.RESUME, async () => {
        const result = await generateSingleDocument({
          ...generateParams,
          docType: DOCUMENT_TYPES.RESUME,
        });
        return result.success
          ? ({ success: true, data: { files: [result.data.filePath] } } as const)
          : result;
      })
      .with(DOCUMENT_TYPES.COVER_LETTER, async () => {
        const result = await generateSingleDocument({
          ...generateParams,
          docType: DOCUMENT_TYPES.COVER_LETTER,
        });
        return result.success
          ? ({ success: true, data: { files: [result.data.filePath] } } as const)
          : result;
      })
      .otherwise((_type) => {
        // This should never happen with proper validation, but provide a safe fallback
        return {
          success: false,
          error: 'Invalid document type',
          details: `Received unexpected document type`,
        } as const;
      });

    return result;
  };

/**
 * Handles successful PDF generation
 *
 * @param {Object} result - Result with generated file paths
 * @returns {void} Exits process with code 0
 */
const onSuccess = (result: { files: readonly string[] }): void => {
  loggers.pdf.success(`All PDFs generated successfully`);
  loggers.pdf.info(`Generated files: ${result.files.join(', ')}`);
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
