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
      company: 'test-company',
      folder_path: 'resume-data/tailor/test-company',
      available_files: ['metadata.yaml', 'resume.yaml', 'job_analysis.yaml', 'cover_letter.yaml'],
      position: 'Software Engineer',
      primary_focus: 'engineer + [react, typescript]',
      job_summary: 'Test company building modern applications',
      job_details: {
        company: 'Test Company',
        location: 'Remote',
        experience_level: 'Mid-level',
        employment_type: 'Full-time',
        must_have_skills: ['JavaScript', 'React', 'TypeScript'],
        nice_to_have_skills: ['Node.js', 'GraphQL'],
        team_context: 'Small agile team',
        user_scale: '10,000 users',
      },
      active_template: 'modern' as const,
      last_updated: '2024-01-01T00:00:00Z',
    },
    resume: {
      name: 'John Doe',
      profile_picture: 'profile.jpg',
      title: 'Software Engineer',
      summary: 'Experienced software engineer',
      contact: {
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
    job_analysis: {
      company: 'Tech Corp',
      position: 'Developer',
      location: 'Remote',
      experience_level: 'Mid-level',
      employment_type: 'Full-time',
      job_focus: [
        {
          primary_area: 'engineer',
          specialties: ['react', 'typescript'],
          weight: 1.0,
        },
      ],
      requirements: {
        must_have_skills: [{ skill: 'TypeScript', priority: 1 }],
        nice_to_have_skills: [],
        soft_skills: ['Communication'],
        experience_years: 3,
        education: 'Bachelor',
      },
      responsibilities: {
        primary: ['Write code'],
        secondary: [],
      },
      role_context: {
        department: 'Engineering',
        team_size: 'Small',
        key_points: ['Build features'],
      },
      application_info: {
        posting_url: 'https://example.com/job',
        posting_date: '2024-01-01',
        deadline: '2024-12-31',
      },
      candidate_alignment: {
        strong_matches: ['TypeScript'],
        gaps_to_address: [],
        transferable_skills: [],
        emphasis_strategy: 'Highlight skills',
      },
      section_priorities: {
        technical_expertise: ['TypeScript'],
        experience_focus: 'Recent work',
        project_relevance: 'Web apps',
      },
      optimization_actions: {
        LEAD_WITH: ['TypeScript'],
        EMPHASIZE: [],
        QUANTIFY: [],
        DOWNPLAY: [],
      },
      ats_analysis: {
        title_variations: ['Developer', 'Engineer'],
        critical_phrases: ['TypeScript'],
      },
    },
    cover_letter: {
      company: 'Tech Corp',
      name: 'John Doe',
      date: '2024-01-01',
      personal_info: {
        phone: '+1-234-567-8900',
        email: 'john@example.com',
      },
      content: {
        letter_title: 'Application for Developer Position',
        opening_line: 'Dear Hiring Manager',
        body: ['I am interested in this position.'],
        signature: 'Sincerely, John Doe',
      },
    },
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
    metadata: {
      company: 'Test Company',
      folder_path: 'test-path',
      available_files: ['resume.yaml'],
      position: 'Engineer',
      primary_focus: 'engineer',
      job_summary: 'Test job',
      job_details: {
        company: 'Test Company',
        location: 'Remote',
        experience_level: 'Mid',
        employment_type: 'Full-time',
        must_have_skills: ['TypeScript'],
        nice_to_have_skills: [],
        team_context: 'Small team',
        user_scale: '1000 users',
      },
      active_template: 'modern' as const,
      last_updated: new Date().toISOString(),
    },
    resume: {
      name: 'John Doe',
      title: 'Software Engineer',
      contact: {
        phone: '+1234567890',
        email: 'john@example.com',
      },
      professional_experience: [
        {
          company: 'Test Corp',
          position: 'Engineer',
          location: 'Remote',
          duration: '2020-2024',
          achievements: [],
        },
      ],
      education: [
        {
          institution: 'University',
          program: 'Computer Science',
          location: 'City',
          duration: '2016-2020',
        },
      ],
      skills: ['TypeScript'],
      technical_expertise: [],
      languages: [],
      independent_projects: [],
    },
    job_analysis: {
      company: 'Test Company',
      position: 'Engineer',
      location: 'Remote',
      experience_level: 'Mid',
      employment_type: 'Full-time',
      job_focus: [
        {
          primary_area: 'engineer',
          specialties: ['typescript'],
          weight: 1.0,
        },
      ],
      requirements: {
        must_have_skills: [{ skill: 'TypeScript', priority: 1 }],
        nice_to_have_skills: [],
        soft_skills: ['Communication'],
        experience_years: 3,
        education: 'Bachelor',
      },
      responsibilities: {
        primary: ['Write code'],
        secondary: [],
      },
      role_context: {
        department: 'Engineering',
        team_size: 'Small',
        key_points: ['Build features'],
      },
      application_info: {
        posting_url: 'https://example.com/job',
        posting_date: '2024-01-01',
        deadline: '2024-12-31',
      },
      candidate_alignment: {
        strong_matches: ['TypeScript'],
        gaps_to_address: [],
        transferable_skills: [],
        emphasis_strategy: 'Highlight TS skills',
      },
      section_priorities: {
        technical_expertise: ['TypeScript'],
        experience_focus: 'Recent work',
        project_relevance: 'Web apps',
      },
      optimization_actions: {
        LEAD_WITH: ['TypeScript'],
        EMPHASIZE: [],
        QUANTIFY: [],
        DOWNPLAY: [],
      },
      ats_analysis: {
        title_variations: ['Engineer', 'Developer'],
        critical_phrases: ['TypeScript'],
      },
    },
    cover_letter: {
      company: 'Test Company',
      name: 'John Doe',
      date: '2024-01-01',
      personal_info: {
        phone: '+1234567890',
        email: 'john@example.com',
      },
      content: {
        letter_title: 'Application',
        opening_line: 'Dear Hiring Manager',
        body: ['I am interested in this position.'],
        signature: 'Sincerely, John Doe',
      },
    },
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

// Theme validation helper functions
export function createMockThemeComponent(name: string = 'MockComponent') {
  const Component = ({ data }: { data?: any }) => {
    return { type: 'mock', name, data };
  };
  Component.displayName = name;
  return Component;
}

export function createValidTheme(overrides?: Partial<any>) {
  const MockResumeComponent = createMockThemeComponent('ResumeComponent');
  const MockCoverLetterComponent = createMockThemeComponent('CoverLetterComponent');

  return {
    id: 'test-theme',
    name: 'Test Theme',
    description: 'A test theme for unit testing',
    documents: ['resume', 'cover-letter'],
    components: {
      resume: MockResumeComponent,
      coverLetter: MockCoverLetterComponent,
    },
    initialize: () => {
      console.log('Test theme initialized');
    },
    ...overrides,
  };
}

export function createValidThemeRegistry() {
  return {
    modern: createValidTheme({ id: 'modern', name: 'Modern Theme' }),
    classic: createValidTheme({ id: 'classic', name: 'Classic Theme' }),
  };
}

// WithPDFWrapper test helpers
export function createMockDocumentConfig<T>(overrides?: Partial<any>) {
  return {
    getDocumentProps: (_data: T) => ({
      author: 'Test Author',
      subject: 'Test Subject',
      title: 'Test Document',
    }),
    emptyStateMessage: 'No data available',
    ...overrides,
  };
}

// TailorContext test helpers
export function createValidTailorContext(overrides?: Partial<any>) {
  return {
    active_company: 'test-company',
    company: 'Test Company',
    active_template: 'modern',
    folder_path: 'resume-data/tailor/test-company',
    available_files: ['metadata.yaml', 'resume.yaml', 'job_analysis.yaml', 'cover_letter.yaml'],
    position: 'Software Engineer',
    primary_focus: 'engineer + [react, typescript]',
    job_summary: 'Test company building modern applications',
    job_details: {
      company: 'Test Company',
      location: 'Remote',
      experience_level: 'Mid-level',
      employment_type: 'Full-time',
      must_have_skills: ['JavaScript', 'React', 'TypeScript'],
      nice_to_have_skills: ['Node.js', 'GraphQL'],
      team_context: 'Small agile team',
      user_scale: '10,000 users',
    },
    last_updated: '2025-10-07T00:00:00Z',
    ...overrides,
  };
}

export function createMinimalValidTailorContext() {
  return {
    active_company: 'test-company',
    company: 'Test Company',
    active_template: 'modern',
    folder_path: 'resume-data/tailor/test-company',
    available_files: ['metadata.yaml'],
    position: 'Software Engineer',
    primary_focus: 'engineer + [react, typescript]',
    job_details: {
      company: 'Test Company',
      location: 'Remote',
      experience_level: 'Mid-level',
      employment_type: 'Full-time',
      must_have_skills: ['JavaScript', 'React'],
      nice_to_have_skills: ['Node.js'],
      team_context: 'Small team',
      user_scale: '1,000 users',
    },
    last_updated: '2025-10-07T00:00:00Z',
  };
}

export function createInvalidTailorContext(errorType: string): unknown {
  const baseValid = createMinimalValidTailorContext();

  switch (errorType) {
    case 'missing-active-company':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { active_company, ...withoutCompany } = baseValid;
      return withoutCompany;

    case 'missing-active-template':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { active_template, ...withoutTemplate } = baseValid;
      return withoutTemplate;

    case 'invalid-template-name':
      return {
        ...baseValid,
        active_template: 'invalid-theme-name',
      };

    case 'invalid-datetime':
      return {
        ...baseValid,
        last_updated: 'not-a-datetime',
      };

    case 'empty-available-files':
      return {
        ...baseValid,
        available_files: [],
      };

    case 'missing-folder-path':
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { folder_path, ...withoutFolder } = baseValid;
      return withoutFolder;

    case 'non-existent-folder':
      return {
        ...baseValid,
        folder_path: '/non/existent/path',
      };

    case 'mismatched-folder-company':
      return {
        ...baseValid,
        active_company: 'test-company',
        folder_path: 'resume-data/tailor/different-company',
      };

    default:
      return null;
  }
}
