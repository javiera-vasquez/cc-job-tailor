import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { themes } from '../src/templates';
import applicationData from '../src/data/application';
import path from 'path';
import { mkdir } from 'fs/promises';
import { parsePdfArgs } from './shared/cli-args';
import {
  throwNoCompanyError,
  throwInvalidDocumentTypeError,
  throwDataGenerationError,
} from './shared/error-messages';
import { validateTailorContext } from '../src/zod/tailor-context-schema';

// Dynamic theme selection based on metadata
const activeTemplate = applicationData.metadata?.active_template || 'modern';
const selectedTheme = themes[activeTemplate];

if (!selectedTheme) {
  console.error(
    `❌ Theme '${activeTemplate}' not found. Available themes: ${Object.keys(themes).join(', ')}`,
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
  console.warn(`Generating data for ${companyName}...`);
  try {
    const dataGenProcess = Bun.spawn({
      cmd: ['bun', 'run', 'scripts/generate-data.ts', '-C', companyName],
      cwd: process.cwd(),
      stdio: ['inherit', 'inherit', 'inherit'],
    });

    const exitCode = await dataGenProcess.exited;
    if (exitCode !== 0) {
      throwDataGenerationError(companyName, exitCode);
    }

    console.warn(`Data generation completed for ${companyName}`);
  } catch (error) {
    console.error(`Failed to generate data for ${companyName}:`, (error as Error).message);
    process.exit(1);
  }

  // Validate tailor context before generating PDF
  if (applicationData.metadata) {
    const contextValidation = validateTailorContext({
      active_company: companyName,
      active_template: applicationData.metadata.active_template,
      folder_path: applicationData.metadata.folder_path,
      available_files: applicationData.metadata.available_files,
      last_updated: applicationData.metadata.last_updated,
    });

    if (!contextValidation.success) {
      console.error('❌ Context validation failed:');
      contextValidation.errors.forEach((err) => console.error(`  - ${err}`));
      process.exit(1);
    }

    // Show warnings if any
    if (contextValidation.warnings && contextValidation.warnings.length > 0) {
      console.warn('⚠️  Context validation warnings:');
      contextValidation.warnings.forEach((warn) => console.warn(`  - ${warn}`));
    }

    console.warn(`✅ Using template: ${applicationData.metadata.active_template}`);
  }

  // Ensure tmp directory exists
  const tmpDir = path.join(import.meta.dir, '..', 'tmp');
  try {
    await mkdir(tmpDir, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }

  // Generate PDFs based on document type
  const generateDocument = async (docType: 'resume' | 'cover-letter') => {
    if (!ResumeDocument || !CoverLetterDocument) {
      throw new Error('Theme components not properly loaded');
    }

    const component =
      docType === 'resume'
        ? React.createElement(ResumeDocument, { data: applicationData.resume ?? undefined })
        : React.createElement(CoverLetterDocument, {
            data: applicationData.cover_letter ?? undefined,
          });

    const filePath = path.join(tmpDir, `${docType}-${companyName}.pdf`);

    console.warn(`Generating ${docType} PDF for ${companyName} at ${filePath}`);

    // Type assertion needed because renderToFile expects DocumentProps but our wrapper has custom props
    await renderToFile(component as any, filePath);

    console.warn(`${docType} PDF generated successfully for ${companyName}`);
  };

  // Generate documents based on specified type
  if (documentType === 'both') {
    await generateDocument('resume');
    await generateDocument('cover-letter');
  } else if (documentType === 'resume') {
    await generateDocument('resume');
  } else if (documentType === 'cover-letter') {
    await generateDocument('cover-letter');
  } else if (documentType) {
    throwInvalidDocumentTypeError(documentType);
  }
};

generatePdf();
