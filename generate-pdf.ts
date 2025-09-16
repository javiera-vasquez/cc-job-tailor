import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { resume } from './src';
import path from 'path';
import { parseArgs } from 'util';

// Parse command line arguments
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    company: {
      type: 'string',
      short: 'C',
      multiple: false,
    },
  },
  strict: true,
  allowPositionals: false,
});

const companyName = values.company;

// Function to provide error guidance when no company is specified
function throwNoCompanyError(): never {
  throw new Error(
    `No company specified. PDF generation requires company-specific data.\n\n` +
    `To generate a PDF:\n` +
    `1. Use Claude Code to analyze a job posting\n` +
    `2. Run: @agent-job-tailor analyze job [file|url]\n` +
    `3. Then use -C flag with the company name to generate PDF\n\n` +
    `Example: bun run generate-pdf.ts -C "company-name"`
  );
}

const generatePdf = async () => {
  if (!companyName) {
    throwNoCompanyError();
  }

  // First, generate the data for the specified company
  console.log(`Generating data for ${companyName}...`);
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

    console.log(`Data generation completed for ${companyName}`);
  } catch (error) {
    console.error(`Failed to generate data for ${companyName}:`, (error as Error).message);
    process.exit(1);
  }

  const component = React.createElement(resume.Document);
  const filePath = path.join(__dirname, 'tmp', `resume-${companyName}.pdf`);

  console.log(`Generating PDF for ${companyName} at ${filePath}`);

  await renderToFile(component, filePath);

  console.log(`PDF generated successfully for ${companyName}`);
};

generatePdf();