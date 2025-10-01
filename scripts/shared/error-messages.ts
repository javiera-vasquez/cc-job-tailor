/**
 * Standard error messages for script operations
 */

export function throwNoCompanyError(): never {
  throw new Error(
    `No company specified. Resume data must be tailored for specific job applications.\n\n` +
      `To get started:\n` +
      `1. Use Claude Code to analyze a job posting\n` +
      `2. Run: @agent-job-tailor analyze job [file|url]\n` +
      `3. Then use -C flag with the company name\n\n` +
      `Example: bun run generate-data -C "company-name"`,
  );
}

export function throwCompanyNotFoundError(
  company: string,
  availableCompanies: string[],
  tailorPath: string,
): never {
  if (availableCompanies.length > 0) {
    throw new Error(
      `Company "${company}" not found in ${tailorPath}.\n` +
        `Available companies: ${availableCompanies.join(', ')}`,
    );
  } else {
    throw new Error(`Company "${company}" not found and no companies available in ${tailorPath}`);
  }
}

export function throwMissingTailorDirectoryError(tailorPath: string): never {
  throw new Error(`Tailor directory does not exist at: ${tailorPath}`);
}

export function throwInvalidDocumentTypeError(documentType: string): never {
  throw new Error(
    `Invalid document type: ${documentType}. Must be 'resume', 'cover-letter', or 'both'`,
  );
}

export function throwDataGenerationError(company: string, exitCode: number): never {
  throw new Error(`Data generation failed for ${company} with exit code ${exitCode}`);
}

export function throwNoFilesFoundError(company: string, companyPath: string): never {
  throw new Error(
    `No data files found for company "${company}" in ${companyPath}\n` +
      `Expected at least one of: metadata.yaml, resume.yaml, job_analysis.yaml, cover_letter.yaml`,
  );
}
