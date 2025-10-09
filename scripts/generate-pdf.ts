import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { themes } from '../src/templates';
import applicationData from '../src/data/application';
import path from 'path';
import { mkdir } from 'fs/promises';
import { parsePdfArgs } from './shared/cli-args';
import { throwNoCompanyError, throwInvalidDocumentTypeError } from './shared/error-messages';
import { validateTailorContextStrict } from '../src/zod/tailor-context-schema';
import { PATHS, DOCUMENT_TYPES } from './shared/config';
import { loggers } from './shared/logger';

// Dynamic theme selection based on metadata
const activeTemplate = applicationData.metadata?.active_template || 'modern';
const selectedTheme = themes[activeTemplate];

if (!selectedTheme) {
  loggers.pdf.error(
    `Theme '${activeTemplate}' not found. Available themes: ${Object.keys(themes).join(', ')}`,
  );
  process.exit(1);
}

const ResumeDocument = selectedTheme.components.resume;
const CoverLetterDocument = selectedTheme.components.coverLetter;

// Parse command line arguments
const { company: companyName, document: documentType } = parsePdfArgs();

const generatePdf = async () => {
  if (!companyName) {
    throwNoCompanyError();
  }

  // First, generate the data for the specified company
  loggers.pdf.loading(`Generating data for ${companyName}...`);
  try {
    const dataGenProcess = Bun.spawn({
      cmd: ['bun', 'run', 'scripts/generate-data.ts', '-C', companyName],
      cwd: process.cwd(),
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    const exitCode = await dataGenProcess.exited;
    if (exitCode !== 0) {
      // Subprocess already displayed the error - just exit with same code
      process.exit(exitCode);
    }

    loggers.pdf.success(`Data generation completed for ${companyName}`);
  } catch {
    // Only handle spawn errors here (not validation errors from subprocess)
    loggers.pdf.error(`Failed to spawn data generation process for ${companyName}`);
    process.exit(1);
  }

  // Validate tailor context before generating PDF (only required fields)
  if (applicationData.metadata) {
    const contextValidation = validateTailorContextStrict({
      active_company: companyName,
      active_template: applicationData.metadata.active_template,
      folder_path: applicationData.metadata.folder_path,
      available_files: applicationData.metadata.available_files,
      last_updated: applicationData.metadata.last_updated,
    });

    if (!contextValidation.success) {
      loggers.pdf.error('Context validation failed:');
      contextValidation.errors.forEach((err) => loggers.pdf.error(`  - ${err}`));
      process.exit(1);
    }

    // Show warnings if any
    if (contextValidation.warnings && contextValidation.warnings.length > 0) {
      loggers.pdf.warn('Context validation warnings:');
      contextValidation.warnings.forEach((warn) => loggers.pdf.warn(`  - ${warn}`));
    }

    loggers.pdf.info(`Using template: ${applicationData.metadata.active_template}`);
  }

  // Ensure tmp directory exists
  const tmpDir = path.join(import.meta.dir, '..', PATHS.TEMP_PDF);
  try {
    await mkdir(tmpDir, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }

  // Generate PDFs based on document type
  const generateDocument = async (
    docType: typeof DOCUMENT_TYPES.RESUME | typeof DOCUMENT_TYPES.COVER_LETTER,
  ) => {
    if (!ResumeDocument || !CoverLetterDocument) {
      throw new Error('Theme components not properly loaded');
    }

    const component =
      docType === DOCUMENT_TYPES.RESUME
        ? React.createElement(ResumeDocument, { data: applicationData.resume ?? undefined })
        : React.createElement(CoverLetterDocument, {
            data: applicationData.cover_letter ?? undefined,
          });

    const filePath = path.join(tmpDir, `${docType}-${companyName}.pdf`);

    loggers.pdf.loading(`Generating ${docType} PDF for ${companyName}`);
    loggers.pdf.debug(`Output path: ${filePath}`);

    // Type assertion needed because renderToFile expects DocumentProps but our wrapper has custom props
    await renderToFile(component as any, filePath);

    loggers.pdf.success(`${docType} PDF generated successfully for ${companyName}`);
  };

  // Generate documents based on specified type
  if (documentType === DOCUMENT_TYPES.BOTH) {
    await generateDocument(DOCUMENT_TYPES.RESUME);
    await generateDocument(DOCUMENT_TYPES.COVER_LETTER);
  } else if (documentType === DOCUMENT_TYPES.RESUME) {
    await generateDocument(DOCUMENT_TYPES.RESUME);
  } else if (documentType === DOCUMENT_TYPES.COVER_LETTER) {
    await generateDocument(DOCUMENT_TYPES.COVER_LETTER);
  } else if (documentType) {
    throwInvalidDocumentTypeError(documentType);
  }
};

generatePdf();
