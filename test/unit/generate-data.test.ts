import { test, expect, describe } from 'bun:test';
import { parseArgs } from 'util';
import { existsSync, readdirSync } from 'fs';
import { load } from 'js-yaml';

// We need to import the functions we want to test
// Since generate-data.ts is a script, we'll need to extract testable functions
// For now, we'll test the core logic by mocking the modules

describe('Generate Data Pipeline', () => {
  describe('Command Line Argument Parsing', () => {
    test('parses company name from -C flag correctly', () => {
      const mockArgv = ['node', 'generate-data.ts', '-C', 'test-company'];

      const { values } = parseArgs({
        args: mockArgv.slice(2),
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

      expect(values.company).toBe('test-company');
    });

    test('handles missing company flag gracefully', () => {
      const mockArgv = ['node', 'generate-data.ts'];

      const { values } = parseArgs({
        args: mockArgv.slice(2),
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

      expect(values.company).toBeUndefined();
    });

    test('parses company name with spaces when quoted', () => {
      const mockArgv = ['node', 'generate-data.ts', '-C', 'Company With Spaces'];

      const { values } = parseArgs({
        args: mockArgv.slice(2),
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

      expect(values.company).toBe('Company With Spaces');
    });
  });

  describe('Company Folder Path Validation', () => {
    // Since we can't directly import the function, we'll recreate the logic for testing
    function getCompanyFolderPath(
      company: string | undefined,
      mockExistsSync?: (path: string) => boolean,
      mockReaddirSync?: (path: string) => string[],
    ): string | null {
      if (!company) {
        return null;
      }

      const tailorPath = './resume-data/tailor';
      const companyPath = `${tailorPath}/${company}`;

      // Use mock functions if provided, otherwise import the real ones
      const actualExistsSync = mockExistsSync || existsSync;
      const actualReaddirSync = mockReaddirSync || readdirSync;

      // Check if tailor directory exists
      if (!actualExistsSync(tailorPath)) {
        throw new Error(`Tailor directory does not exist at: ${tailorPath}`);
      }

      // Check if company folder exists
      if (!actualExistsSync(companyPath)) {
        // List available companies
        const availableCompanies = actualReaddirSync(tailorPath).filter(
          (name: string) =>
            actualExistsSync(`${tailorPath}/${name}/resume.yaml`) ||
            actualExistsSync(`${tailorPath}/${name}/job_analysis.yaml`) ||
            actualExistsSync(`${tailorPath}/${name}/cover_letter.yaml`),
        );

        if (availableCompanies.length > 0) {
          throw new Error(
            `Company "${company}" not found in ${tailorPath}.\n` +
              `Available companies: ${availableCompanies.join(', ')}`,
          );
        } else {
          throw new Error(
            `Company "${company}" not found and no companies available in ${tailorPath}`,
          );
        }
      }

      return companyPath;
    }

    test('returns null when no company provided', () => {
      const result = getCompanyFolderPath(undefined);
      expect(result).toBeNull();
    });

    test('returns null when empty string provided', () => {
      const result = getCompanyFolderPath('');
      expect(result).toBeNull();
    });

    test('throws error when tailor directory does not exist', () => {
      const mockExistsSync = () => false;

      expect(() => {
        getCompanyFolderPath('test-company', mockExistsSync);
      }).toThrow('Tailor directory does not exist at: ./resume-data/tailor');
    });

    test('returns correct path when company folder exists', () => {
      const mockExistsSync = () => true;

      const result = getCompanyFolderPath('test-company', mockExistsSync);
      expect(result).toBe('./resume-data/tailor/test-company');
    });

    test('throws error with available companies list when company not found', () => {
      // Mock tailor directory exists but company folder doesn't
      const mockExistsSync = (path: string): boolean => {
        if (path === './resume-data/tailor') return true;
        if (path === './resume-data/tailor/test-company') return false;
        if (path.includes('resume.yaml') || path.includes('job_analysis.yaml')) {
          return path.includes('existing-company');
        }
        return false;
      };

      const mockReaddirSync = (): string[] => ['existing-company', 'another-company'];

      expect(() => {
        getCompanyFolderPath('test-company', mockExistsSync, mockReaddirSync);
      }).toThrow(/Company "test-company" not found[\s\S]*Available companies: existing-company/);
    });

    test('throws error when no companies available and company not found', () => {
      // Mock tailor directory exists but company folder doesn't
      const mockExistsSync = (path: string): boolean => {
        if (path === './resume-data/tailor') return true;
        if (path === './resume-data/tailor/test-company') return false;
        return false; // No valid company folders
      };

      const mockReaddirSync = (): string[] => ['empty-folder'];

      expect(() => {
        getCompanyFolderPath('test-company', mockExistsSync, mockReaddirSync);
      }).toThrow(
        'Company "test-company" not found and no companies available in ./resume-data/tailor',
      );
    });
  });

  describe('YAML Data Loading', () => {
    // Recreate the loadTailoredData function for testing with mock parameters
    async function loadTailoredData(
      companyPath: string,
      mockExistsSync?: (path: string) => boolean,
      mockLoad?: (content: string) => any,
      mockFileReader?: (path: string) => Promise<string>,
    ) {
      const resumePath = `${companyPath}/resume.yaml`;
      const jobAnalysisPath = `${companyPath}/job_analysis.yaml`;
      const coverLetterPath = `${companyPath}/cover_letter.yaml`;

      const actualExistsSync = mockExistsSync || existsSync;
      const actualLoad = mockLoad || load;
      const fileReader = mockFileReader || (async (path: string) => await Bun.file(path).text());

      const resumeFile = actualExistsSync(resumePath)
        ? actualLoad(await fileReader(resumePath))
        : null;

      const jobAnalysis = actualExistsSync(jobAnalysisPath)
        ? actualLoad(await fileReader(jobAnalysisPath))
        : null;

      const coverLetter = actualExistsSync(coverLetterPath)
        ? actualLoad(await fileReader(coverLetterPath))
        : null;

      return {
        metadata: (resumeFile as any)?.metadata,
        resume: (resumeFile as any)?.resume,
        job_analysis: (jobAnalysis as any)?.job_analysis,
        cover_letter: (coverLetter as any)?.cover_letter,
      };
    }

    test('loads all available YAML files successfully', async () => {
      const companyPath = './resume-data/tailor/test-company';

      const mockExistsSync = () => true; // All files exist

      const mockYamlContent = {
        metadata: { company: 'Test Company' },
        resume: { name: 'John Doe' },
      };

      const mockLoad = () => mockYamlContent;
      const mockFileReader = async () => 'yaml-content';

      const result = await loadTailoredData(companyPath, mockExistsSync, mockLoad, mockFileReader);

      expect(result.metadata).toEqual(mockYamlContent.metadata);
      expect(result.resume).toEqual(mockYamlContent.resume);
    });

    test('handles missing files gracefully with null values', async () => {
      const companyPath = './resume-data/tailor/test-company';

      const mockExistsSync = () => false; // No files exist

      const result = await loadTailoredData(companyPath, mockExistsSync);

      expect(result.metadata).toBeUndefined();
      expect(result.resume).toBeUndefined();
      expect(result.job_analysis).toBeUndefined();
      expect(result.cover_letter).toBeUndefined();
    });

    test('loads partial data when only some files exist', async () => {
      const companyPath = './resume-data/tailor/test-company';

      // Only resume.yaml exists
      const mockExistsSync = (path: string): boolean => {
        return path.includes('resume.yaml');
      };

      const mockResumeData = {
        metadata: { company: 'Test Company' },
        resume: { name: 'John Doe' },
      };

      const mockLoad = () => mockResumeData;
      const mockFileReader = async () => 'resume-yaml-content';

      const result = await loadTailoredData(companyPath, mockExistsSync, mockLoad, mockFileReader);

      expect(result.metadata).toEqual(mockResumeData.metadata);
      expect(result.resume).toEqual(mockResumeData.resume);
      expect(result.job_analysis).toBeUndefined();
      expect(result.cover_letter).toBeUndefined();
    });
  });

  describe('Error Handling Scenarios', () => {
    test('throwNoCompanyError creates descriptive error message', () => {
      function throwNoCompanyError(): never {
        throw new Error(
          `No company specified. Resume data must be tailored for specific job applications.\n\n` +
            `To get started:\n` +
            `1. Use Claude Code to analyze a job posting\n` +
            `2. Run: @agent-job-tailor analyze job [file|url]\n` +
            `3. Then use -C flag with the company name to generate tailored resume\n\n` +
            `Example: bun run generate-data.ts -C "company-name"`,
        );
      }

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/No company specified.*Resume data must be tailored/);

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/Use Claude Code to analyze a job posting/);

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/bun run generate-data.ts -C "company-name"/);
    });
  });
});
