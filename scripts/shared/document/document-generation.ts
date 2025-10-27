import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { mkdir } from 'fs/promises';
import path from 'path';
import { themes } from '@templates/index';
import { DOCUMENT_TYPES } from '@shared/core/config';
import { loggers } from '@shared/core/logger';
import { tryCatchAsync } from '@shared/core/functional-utils';
import type { SuccessResult, ErrorResult } from '@shared/validation/types';

export interface GenerateDocumentParams {
  docTypes: (typeof DOCUMENT_TYPES.RESUME | typeof DOCUMENT_TYPES.COVER_LETTER)[];
  theme: any;
  applicationData: any;
  outputDir: string;
  companyName: string;
}

export interface GeneratedDocument {
  filePath: string;
  docType: string;
}

export interface ThemeSelectionContext {
  applicationData: any;
  theme: any;
  themeName: string;
}

export interface OutputDirectoryContext extends ThemeSelectionContext {
  outputDir: string;
}

/**
 * Selects and validates theme from application metadata.
 * Extracts active_template from metadata with 'modern' as default fallback.
 *
 * @param {any} applicationData - Validated application data with metadata field
 * @returns {SuccessResult<ThemeSelectionContext> | ErrorResult} Theme context if found, error if unavailable
 * @example
 * selectThemeFromMetadata(appData)
 * → { success: true, data: { applicationData, theme: {...}, themeName: 'modern' } }
 */
export const selectThemeFromMetadata = (
  applicationData: any,
): SuccessResult<ThemeSelectionContext> | ErrorResult => {
  const activeTemplate = applicationData.metadata?.active_template || 'modern';
  loggers.pdf.debug(`Using template: ${activeTemplate}`);

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
 * Ensures output directory exists for PDF generation.
 * Creates directory with recursive flag if missing.
 *
 * @param {ThemeSelectionContext} context - Context with application data and theme
 * @param {string} outputDir - Absolute path to the output directory
 * @returns {Promise<SuccessResult<OutputDirectoryContext> | ErrorResult>} Context with output path if successful, error if mkdir fails
 * @example
 * ensureOutputDirectory(themeContext, '/tmp/pdfs')
 * → { success: true, data: { ...context, outputDir: '/tmp/pdfs' } }
 */
export const ensureOutputDirectory = async (
  context: ThemeSelectionContext,
  outputDir: string,
): Promise<SuccessResult<OutputDirectoryContext> | ErrorResult> => {
  return tryCatchAsync(async () => {
    await mkdir(outputDir, { recursive: true });
    loggers.pdf.debug(`Output directory ready: ${outputDir}`);

    return { ...context, outputDir };
  }, 'Failed to create output directory');
};

/**
 * Generates a single PDF document (resume or cover letter) asynchronously.
 *
 * Renders the appropriate React component (resume or cover letter) from theme
 * and writes the PDF to the specified output directory with company-specific filename.
 *
 * @param {Object} params - Generation parameters
 * @param {typeof DOCUMENT_TYPES.RESUME | typeof DOCUMENT_TYPES.COVER_LETTER} params.docType - Document type to generate
 * @param {any} params.theme - Theme object with resume/coverLetter React components
 * @param {any} params.applicationData - Application data with resume/cover_letter content
 * @param {string} params.outputDir - Output directory for PDF file
 * @param {string} params.companyName - Company name for PDF filename
 * @returns {Promise<GeneratedDocument>} Generated document with filePath and docType
 */
const generateSingleDoc = async ({
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
}): Promise<GeneratedDocument> => {
  const component =
    docType === DOCUMENT_TYPES.RESUME
      ? React.createElement(theme.components.resume, { data: applicationData.resume ?? undefined })
      : React.createElement(theme.components.coverLetter, {
          data: applicationData.cover_letter ?? undefined,
        });

  const filePath = path.join(outputDir, `${docType}-${companyName}.pdf`);

  loggers.pdf.debug(`Generating ${docType} PDF: ${filePath}`);

  await renderToFile(component as any, filePath);

  loggers.pdf.debug(`${docType} PDF generated: ${filePath}`);

  return { filePath, docType };
};

/**
 * Generates multiple PDF documents in parallel using Promise.all.
 * Validates required theme components before rendering.
 *
 * @param {GenerateDocumentParams} params - Parameters for PDF generation
 * @param {(typeof DOCUMENT_TYPES.RESUME | typeof DOCUMENT_TYPES.COVER_LETTER)[]} params.docTypes - Document types to generate
 * @param {any} params.theme - Theme object with resume/coverLetter React components
 * @param {any} params.applicationData - Application data with resume/cover_letter content
 * @param {string} params.outputDir - Output directory for PDF files
 * @param {string} params.companyName - Company name for PDF filenames
 * @returns {Promise<SuccessResult<GeneratedDocument[]> | ErrorResult>} Array of generated files with paths, or error
 * @example
 * generateDocument({ docTypes: ['resume'], theme, applicationData, outputDir: '/tmp', companyName: 'acme' })
 * → { success: true, data: [{ filePath: '/tmp/resume-acme.pdf', docType: 'resume' }] }
 */
export const generateDocument = async ({
  docTypes,
  theme,
  applicationData,
  outputDir,
  companyName,
}: GenerateDocumentParams): Promise<SuccessResult<GeneratedDocument[]> | ErrorResult> => {
  // Only validate React templates we actually need
  const needsResume = docTypes.includes(DOCUMENT_TYPES.RESUME);
  const needsCoverLetter = docTypes.includes(DOCUMENT_TYPES.COVER_LETTER);

  const missingTemplates: string[] = [];

  if (needsResume && !theme.components.resume) {
    missingTemplates.push('resume');
  }

  if (needsCoverLetter && !theme.components.coverLetter) {
    missingTemplates.push('coverLetter');
  }

  if (missingTemplates.length > 0) {
    return {
      success: false,
      error: 'Required theme components not found',
      details: `Missing components: ${missingTemplates.join(', ')}`,
    } as const;
  }

  return tryCatchAsync(
    async () =>
      Promise.all(
        docTypes.map((docType) =>
          generateSingleDoc({
            docType,
            theme,
            applicationData,
            outputDir,
            companyName,
          }),
        ),
      ),
    `Failed to generate PDF documents`,
  );
};
