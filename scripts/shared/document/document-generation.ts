import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { mkdir } from 'fs/promises';
import path from 'path';
import { themes } from '@templates/index';
import { DOCUMENT_TYPES } from '@shared/core/config';
import { loggers } from '@shared/core/logger';
import { tryCatchAsync } from '@shared/core/functional-utils';
import type { SuccessResult, ErrorResult } from '@shared/validation/validation-pipeline';

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
 * Selects and validates theme from application metadata
 *
 * @param {any} applicationData - Validated application data
 * @returns {SuccessResult<ThemeSelectionContext> | ErrorResult} Result with selected theme or error
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
 * Ensures output directory exists for PDF generation
 *
 * @param {ThemeSelectionContext} context - Context with application data and theme
 * @param {string} tmpDir - Absolute path to the output directory
 * @returns {Promise<SuccessResult<OutputDirectoryContext> | ErrorResult>} Result with context and output directory path
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
 * Generates a single PDF document (resume or cover letter)
 * IMPORTANT: Add proper types for template and data management
 *
 * @param {Object} params - Generation parameters for a single document
 * @returns {Promise<GeneratedDocument>} Promise resolving to generated document metadata
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
 * Generates multiple PDF documents in parallel using Promise.all
 *
 * @param {GenerateDocumentParams} params - Generation parameters with array of document types
 * @returns {Promise<SuccessResult<GeneratedDocument[]> | ErrorResult>} Result with array of generated documents or error
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
