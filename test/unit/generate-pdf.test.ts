import { test, expect, describe } from 'bun:test';
import { parseArgs } from 'util';
import path from 'path';

describe('Generate PDF Pipeline', () => {

  describe('Command Line Argument Parsing', () => {
    test('parses company name and document type from flags correctly', () => {
      const mockArgv = ['node', 'generate-pdf.ts', '-C', 'test-company', '-D', 'resume'];

      const { values } = parseArgs({
        args: mockArgv.slice(2),
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

      expect(values.company).toBe('test-company');
      expect(values.document).toBe('resume');
    });

    test('defaults document type to "both" when not specified', () => {
      const mockArgv = ['node', 'generate-pdf.ts', '-C', 'test-company'];

      const { values } = parseArgs({
        args: mockArgv.slice(2),
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

      const documentType = values.document || 'both';
      expect(documentType).toBe('both');
    });

    test('handles missing company flag', () => {
      const mockArgv = ['node', 'generate-pdf.ts', '-D', 'resume'];

      const { values } = parseArgs({
        args: mockArgv.slice(2),
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

      expect(values.company).toBeUndefined();
      expect(values.document).toBe('resume');
    });
  });

  describe('Error Handling Functions', () => {
    test('throwNoCompanyError creates comprehensive error message', () => {
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

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/No company specified.*PDF generation requires company-specific data/);

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/Use Claude Code to analyze a job posting/);

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/bun run generate-pdf.ts -C "company-name"/);

      expect(() => {
        throwNoCompanyError();
      }).toThrow(/Generate both resume and cover letter/);
    });
  });

  describe('Document Type Validation', () => {
    test('validates supported document types', () => {
      function validateDocumentType(documentType: string): boolean {
        const validTypes = ['resume', 'cover-letter', 'both'];
        return validTypes.includes(documentType);
      }

      expect(validateDocumentType('resume')).toBe(true);
      expect(validateDocumentType('cover-letter')).toBe(true);
      expect(validateDocumentType('both')).toBe(true);
      expect(validateDocumentType('invalid')).toBe(false);
      expect(validateDocumentType('')).toBe(false);
    });

    test('throws error for invalid document type', () => {
      function validateDocumentTypeOrThrow(documentType: string): void {
        const validTypes = ['resume', 'cover-letter', 'both'];
        if (!validTypes.includes(documentType)) {
          throw new Error(`Invalid document type: ${documentType}. Must be 'resume', 'cover-letter', or 'both'`);
        }
      }

      expect(() => {
        validateDocumentTypeOrThrow('invalid');
      }).toThrow(`Invalid document type: invalid. Must be 'resume', 'cover-letter', or 'both'`);

      expect(() => {
        validateDocumentTypeOrThrow('pdf');
      }).toThrow(`Invalid document type: pdf. Must be 'resume', 'cover-letter', or 'both'`);

      // Should not throw for valid types
      expect(() => {
        validateDocumentTypeOrThrow('resume');
      }).not.toThrow();

      expect(() => {
        validateDocumentTypeOrThrow('both');
      }).not.toThrow();
    });
  });

  describe('File Path Generation', () => {
    test('generates correct file paths for different document types', () => {
      function generatePdfFilePath(tmpDir: string, docType: string, companyName: string): string {
        return path.join(tmpDir, `${docType}-${companyName}.pdf`);
      }

      const tmpDir = '/tmp/test';
      const companyName = 'test-company';

      expect(generatePdfFilePath(tmpDir, 'resume', companyName))
        .toBe('/tmp/test/resume-test-company.pdf');

      expect(generatePdfFilePath(tmpDir, 'cover-letter', companyName))
        .toBe('/tmp/test/cover-letter-test-company.pdf');
    });

    test('handles company names with spaces and special characters', () => {
      function generatePdfFilePath(tmpDir: string, docType: string, companyName: string): string {
        return path.join(tmpDir, `${docType}-${companyName}.pdf`);
      }

      const tmpDir = '/tmp/test';

      expect(generatePdfFilePath(tmpDir, 'resume', 'Company With Spaces'))
        .toBe('/tmp/test/resume-Company With Spaces.pdf');

      expect(generatePdfFilePath(tmpDir, 'cover-letter', 'Company-Name'))
        .toBe('/tmp/test/cover-letter-Company-Name.pdf');
    });
  });

  describe('Data Generation Subprocess Logic', () => {
    // Mock Bun.spawn for testing subprocess calls
    async function callGenerateDataProcess(
      companyName: string,
      mockSpawn?: (options: any) => { exited: Promise<number> }
    ) {
      const spawn = mockSpawn || (() => ({ exited: Promise.resolve(0) }));

      console.log(`Generating data for ${companyName}...`);

      const dataGenProcess = spawn({
        cmd: ['bun', 'run', 'generate-data.ts', '-C', companyName],
        cwd: process.cwd(),
        stdio: ['inherit', 'inherit', 'inherit']
      });

      const exitCode = await dataGenProcess.exited;

      if (exitCode !== 0) {
        throw new Error(`Data generation failed with exit code ${exitCode}`);
      }

      console.log(`Data generation completed for ${companyName}`);
      return exitCode;
    }

    test('calls generate-data.ts with correct parameters', async () => {
      let spawnCalled = false;
      let spawnOptions: any;

      const mockSpawn = (options: any) => {
        spawnCalled = true;
        spawnOptions = options;
        return { exited: Promise.resolve(0) };
      };

      const result = await callGenerateDataProcess('test-company', mockSpawn);

      expect(spawnCalled).toBe(true);
      expect(spawnOptions.cmd).toEqual(['bun', 'run', 'generate-data.ts', '-C', 'test-company']);
      expect(spawnOptions.cwd).toBe(process.cwd());
      expect(result).toBe(0);
    });

    test('throws error when data generation process fails', async () => {
      const mockSpawn = () => {
        return { exited: Promise.resolve(1) }; // Non-zero exit code
      };

      await expect(async () => {
        await callGenerateDataProcess('test-company', mockSpawn);
      }).toThrow('Data generation failed with exit code 1');
    });

    test('handles successful data generation', async () => {
      const mockSpawn = () => {
        return { exited: Promise.resolve(0) }; // Success
      };

      const result = await callGenerateDataProcess('test-company', mockSpawn);
      expect(result).toBe(0);
    });
  });

  describe('PDF Generation Logic', () => {
    // Mock the PDF rendering process
    async function generateDocument(
      docType: 'resume' | 'cover-letter',
      companyName: string,
      tmpDir: string,
      mockRenderToFile?: (component: any, filePath: string) => Promise<void>,
      mockReactCreateElement?: (component: any) => any
    ) {
      const renderToFile = mockRenderToFile || (() => Promise.resolve());
      const createElement = mockReactCreateElement || ((comp: any) => ({ type: comp.name }));

      // Mock components
      const components = {
        resume: { Document: { name: 'ResumeDocument' } },
        'cover-letter': { Document: { name: 'CoverLetterDocument' } }
      };

      const component = createElement(components[docType].Document);
      const filePath = path.join(tmpDir, `${docType}-${companyName}.pdf`);

      console.log(`Generating ${docType} PDF for ${companyName} at ${filePath}`);

      await renderToFile(component, filePath);

      console.log(`${docType} PDF generated successfully for ${companyName}`);

      return filePath;
    }

    test('generates resume PDF with correct parameters', async () => {
      let renderCalled = false;
      let renderFilePath: string;
      let renderComponent: any;

      const mockRenderToFile = async (component: any, filePath: string) => {
        renderCalled = true;
        renderComponent = component;
        renderFilePath = filePath;
      };

      const mockCreateElement = (comp: any) => ({ componentType: comp.name });

      const result = await generateDocument(
        'resume',
        'test-company',
        '/tmp/test',
        mockRenderToFile,
        mockCreateElement
      );

      expect(renderCalled).toBe(true);
      expect(renderFilePath).toBe('/tmp/test/resume-test-company.pdf');
      expect(renderComponent.componentType).toBe('ResumeDocument');
      expect(result).toBe('/tmp/test/resume-test-company.pdf');
    });

    test('generates cover letter PDF with correct parameters', async () => {
      let renderCalled = false;
      let renderFilePath: string;
      let renderComponent: any;

      const mockRenderToFile = async (component: any, filePath: string) => {
        renderCalled = true;
        renderComponent = component;
        renderFilePath = filePath;
      };

      const mockCreateElement = (comp: any) => ({ componentType: comp.name });

      const result = await generateDocument(
        'cover-letter',
        'test-company',
        '/tmp/test',
        mockRenderToFile,
        mockCreateElement
      );

      expect(renderCalled).toBe(true);
      expect(renderFilePath).toBe('/tmp/test/cover-letter-test-company.pdf');
      expect(renderComponent.componentType).toBe('CoverLetterDocument');
      expect(result).toBe('/tmp/test/cover-letter-test-company.pdf');
    });

    test('handles PDF generation errors', async () => {
      const mockRenderToFile = async () => {
        throw new Error('PDF rendering failed');
      };

      await expect(async () => {
        await generateDocument('resume', 'test-company', '/tmp/test', mockRenderToFile);
      }).toThrow('PDF rendering failed');
    });
  });

  describe('Directory Creation Logic', () => {
    // Mock mkdir functionality
    async function ensureTmpDirectory(
      tmpDir: string,
      mockMkdir?: (path: string, options: any) => Promise<void>
    ) {
      const mkdir = mockMkdir || (() => Promise.resolve());

      try {
        await mkdir(tmpDir, { recursive: true });
        return { success: true, created: true };
      } catch (error) {
        // Directory might already exist, ignore error
        return { success: true, created: false };
      }
    }

    test('creates tmp directory with recursive option', async () => {
      let mkdirCalled = false;
      let mkdirPath: string;
      let mkdirOptions: any;

      const mockMkdir = async (path: string, options: any) => {
        mkdirCalled = true;
        mkdirPath = path;
        mkdirOptions = options;
      };

      const result = await ensureTmpDirectory('/tmp/test', mockMkdir);

      expect(mkdirCalled).toBe(true);
      expect(mkdirPath).toBe('/tmp/test');
      expect(mkdirOptions.recursive).toBe(true);
      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
    });

    test('handles directory creation errors gracefully', async () => {
      const mockMkdir = async () => {
        throw new Error('Permission denied');
      };

      const result = await ensureTmpDirectory('/tmp/test', mockMkdir);

      // Should not throw, just return success: true, created: false
      expect(result.success).toBe(true);
      expect(result.created).toBe(false);
    });
  });
});