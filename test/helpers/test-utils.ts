import type { ApplicationData } from '../../src/types';

// Console output capture for validation error testing
export function captureConsoleOutput(fn: () => void): string[] {
  const originalError = console.error;
  const capturedOutput: string[] = [];

  console.error = (...args: unknown[]) => {
    const message = args.map((arg) => String(arg)).join(' ');
    capturedOutput.push(message);
    // Show in console with test context indicator
    originalError(`[Expected Validation Error] ${message}`);
  };

  try {
    fn();
  } finally {
    console.error = originalError;
  }

  return capturedOutput;
}

// Mock data generators
export function createValidApplicationData(): ApplicationData {
  return {
    metadata: {
      company: 'Test Company',
      position: 'Software Engineer',
      last_updated: '2024-01-01',
      transformation_decisions: 'Test transformation',
      job_focus_used: 'engineering',
    },
    resume: {
      name: 'John Doe',
      profile_picture: 'profile.jpg',
      title: 'Software Engineer',
      summary: 'Experienced software engineer',
      contact: {
        name: 'John Doe',
        phone: '+1-234-567-8900',
        email: 'john@example.com',
        address: '123 Main St, City, State',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
      },
      technical_expertise: [
        {
          resume_title: 'Frontend Development',
          skills: ['React', 'TypeScript'],
        },
      ],
      skills: ['JavaScript', 'Python'],
      languages: [
        {
          language: 'English',
          proficiency: 'Native',
        },
      ],
      professional_experience: [
        {
          company: 'Tech Corp',
          position: 'Developer',
          location: 'Remote',
          duration: '2023-2024',
          company_description: 'Technology company',
          linkedin: 'https://linkedin.com/company/techcorp',
          achievements: ['Built scalable applications'],
        },
      ],
      independent_projects: [
        {
          name: 'Test Project',
          description: 'A test project',
          location: 'Remote',
          duration: '2024',
          achievements: ['Delivered on time'],
        },
      ],
      education: [
        {
          institution: 'University',
          program: 'Computer Science',
          location: 'City, State',
          duration: '2020-2024',
        },
      ],
    },
    job_analysis: null,
    cover_letter: null,
  };
}

export function createValidJobFocus() {
  return [
    {
      primary_area: 'engineer' as const,
      specialties: ['react' as const, 'typescript' as const],
      weight: 1.0,
    },
  ];
}

export function createInvalidJobFocus() {
  return [
    {
      primary_area: 'engineer' as const,
      specialties: ['react' as const],
      weight: 0.7,
    },
    {
      primary_area: 'senior_engineer' as const,
      specialties: ['python' as const],
      weight: 0.4, // Sum = 1.1, should fail validation
    },
  ];
}

export function createMinimalValidApplicationData(): ApplicationData {
  return {
    metadata: null,
    resume: null,
    job_analysis: null,
    cover_letter: null,
  };
}

// Invalid data generators for different error scenarios
export function createInvalidApplicationData(errorType: string): unknown {
  switch (errorType) {
    case 'invalid-email':
      const validData = createValidApplicationData();
      if (validData.resume?.contact) {
        validData.resume.contact.email = 'invalid-email';
      }
      return validData;

    case 'missing-required-field':
      const validData2 = createValidApplicationData();
      if (validData2.resume) {
        delete (validData2.resume as Record<string, unknown>).name;
      }
      return validData2;

    case 'invalid-url':
      const validData3 = createValidApplicationData();
      if (validData3.resume?.contact) {
        validData3.resume.contact.linkedin = 'not-a-url';
      }
      return validData3;

    case 'empty-array':
      const validData4 = createValidApplicationData();
      if (validData4.resume) {
        validData4.resume.technical_expertise = [];
      }
      return validData4;

    default:
      return null;
  }
}

// File system mocking utilities
export function mockYAMLContent(content: object): string {
  return JSON.stringify(content, null, 2);
}

// Mock file system operations for testing
export function createMockExistsSync() {
  const mockExistsSync = (_path: string): boolean => {
    // Default implementation - can be overridden by specific tests
    return false;
  };
  return mockExistsSync;
}

export function createMockReaddirSync() {
  const mockReaddirSync = (_path: string): string[] => {
    // Default implementation - can be overridden by specific tests
    return [];
  };
  return mockReaddirSync;
}

export function createMockBunFile() {
  const mockBunFile = (_path: string) => ({
    text: async (): Promise<string> => {
      // Default YAML content for testing
      return 'metadata:\n  company: "Test Company"\nresume:\n  name: "Test User"';
    },
  });
  return mockBunFile;
}

// Helper to create realistic company folder structure
export interface MockCompanyStructure {
  [companyName: string]: {
    hasResume?: boolean;
    hasJobAnalysis?: boolean;
    hasCoverLetter?: boolean;
    resumeContent?: object;
    jobAnalysisContent?: object;
    coverLetterContent?: object;
  };
}

export function setupMockCompanyFolders(structure: MockCompanyStructure) {
  const mockExistsSync = (path: string): boolean => {
    // Check for tailor directory
    if (path === './resume-data/tailor') {
      return true;
    }

    // Check for company folders and their files
    for (const [companyName, config] of Object.entries(structure)) {
      const companyPath = `./resume-data/tailor/${companyName}`;

      if (path === companyPath) {
        return true;
      }

      if (path === `${companyPath}/resume.yaml` && config.hasResume) {
        return true;
      }

      if (path === `${companyPath}/job_analysis.yaml` && config.hasJobAnalysis) {
        return true;
      }

      if (path === `${companyPath}/cover_letter.yaml` && config.hasCoverLetter) {
        return true;
      }
    }

    return false;
  };

  const mockReaddirSync = (path: string): string[] => {
    if (path === './resume-data/tailor') {
      return Object.keys(structure);
    }
    return [];
  };

  const mockBunFile = (path: string) => ({
    text: async (): Promise<string> => {
      for (const [companyName, config] of Object.entries(structure)) {
        const companyPath = `./resume-data/tailor/${companyName}`;

        if (path === `${companyPath}/resume.yaml` && config.resumeContent) {
          return mockYAMLContent(config.resumeContent);
        }

        if (path === `${companyPath}/job_analysis.yaml` && config.jobAnalysisContent) {
          return mockYAMLContent(config.jobAnalysisContent);
        }

        if (path === `${companyPath}/cover_letter.yaml` && config.coverLetterContent) {
          return mockYAMLContent(config.coverLetterContent);
        }
      }

      // Default content
      return mockYAMLContent({
        metadata: { company: 'Default Company' },
        resume: { name: 'Default User' },
      });
    },
  });

  return { mockExistsSync, mockReaddirSync, mockBunFile };
}

// Test assertion helpers
export function expectValidationError(fn: () => void, expectedMessage?: string): void {
  let threwError = false;
  let actualMessage = '';

  try {
    fn();
  } catch (error) {
    threwError = true;
    actualMessage = error instanceof Error ? error.message : String(error);
  }

  if (!threwError) {
    throw new Error('Expected function to throw validation error, but it did not');
  }

  if (expectedMessage && !actualMessage.includes(expectedMessage)) {
    throw new Error(
      `Expected error message to contain "${expectedMessage}", but got "${actualMessage}"`,
    );
  }
}
