import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { resume, coverLetter } from './src';
import path from 'path';
import { parseArgs } from 'util';
import { mkdir } from 'fs/promises';

// Parse command line arguments
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    company: {
      type: 'string',
      short: 'C',
      multiple: false,
    },
    document: {
      type: 'string',
      short: 'D',
      multiple: false,
    },
  },
  strict: true,
  allowPositionals: false,
});

const companyName = values.company;
const documentType = values.document || 'both'; // 'resume', 'cover-letter', or 'both'

// Function to provide error guidance when no company is specified
function throwNoCompanyError(): never {
  throw new Error(
    `No company specified. PDF generation requires company-specific data.\n\n` +
    `To generate a PDF:\n` +
    `1. Use Claude Code to analyze a job posting\n` +
    `2. Run: @agent-job-tailor analyze job [file|url]\n` +
    `3. Then use -C flag with the company name to generate PDF\n\n` +
    `Examples:\n` +
    `  bun run generate-pdf.ts -C "company-name"                    # Generate both resume and cover letter\n` +
    `  bun run generate-pdf.ts -C "company-name" -D resume          # Generate resume only\n` +
    `  bun run generate-pdf.ts -C "company-name" -D cover-letter    # Generate cover letter only`
  );
}

const generatePdf = async () => {
  if (!companyName) {
    throwNoCompanyError();
  }

  // First, generate the data for the specified company
  console.warn(`Generating data for ${companyName}...`);
  try {
    const dataGenProcess = Bun.spawn({
      cmd: ['bun', 'run', 'generate-data.ts', '-C', companyName],
      cwd: process.cwd(),
      stdio: ['inherit', 'inherit', 'inherit']
    });

    const exitCode = await dataGenProcess.exited;
    if (exitCode !== 0) {
      throw new Error(`Data generation failed with exit code ${exitCode}`);
    }

    console.warn(`Data generation completed for ${companyName}`);
  } catch (error) {
    console.error(`Failed to generate data for ${companyName}:`, (error as Error).message);
    process.exit(1);
  }

  // Ensure tmp directory exists
  const tmpDir = path.join(__dirname, 'tmp');
  try {
    await mkdir(tmpDir, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }

  // Generate PDFs based on document type
  const generateDocument = async (docType: 'resume' | 'cover-letter') => {
    const component = docType === 'resume'
      ? React.createElement(resume.Document)
      : React.createElement(coverLetter.Document);

    const filePath = path.join(tmpDir, `${docType}-${companyName}.pdf`);

    console.warn(`Generating ${docType} PDF for ${companyName} at ${filePath}`);

    await renderToFile(component, filePath);

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
  } else {
    throw new Error(`Invalid document type: ${documentType}. Must be 'resume', 'cover-letter', or 'both'`);
  }
};

generatePdf();