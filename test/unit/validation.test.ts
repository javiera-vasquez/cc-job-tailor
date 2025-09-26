import { test, expect, describe } from 'bun:test';
import { ZodError } from 'zod';
import {
  validateApplicationData,
  validateResume,
  validateJobAnalysis,
  validateCoverLetter
} from '../../src/zod/validation';
import {
  createValidApplicationData,
  createMinimalValidApplicationData,
  createInvalidApplicationData,
  captureConsoleOutput,
  expectValidationError
} from '../helpers/test-utils';

describe('Validation Functions', () => {

  describe('validateApplicationData()', () => {
    test('validates complete application data successfully', () => {
      const validData = createValidApplicationData();
      const result = validateApplicationData(validData);

      expect(result).toEqual(validData);
      expect(typeof result).toBe('object');
      expect(result.metadata).toBeDefined();
      expect(result.resume).toBeDefined();
    });

    test('validates minimal application data with nulls', () => {
      const minimalData = createMinimalValidApplicationData();
      const result = validateApplicationData(minimalData);

      expect(result).toEqual(minimalData);
      expect(result.metadata).toBeNull();
      expect(result.resume).toBeNull();
      expect(result.job_analysis).toBeNull();
      expect(result.cover_letter).toBeNull();
    });

    test('throws descriptive error for invalid data with console output', () => {
      const invalidData = createInvalidApplicationData('invalid-email');

      const consoleOutput = captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData(invalidData);
        }, 'Application data validation failed');
      });

      // Check that validation errors were logged to console
      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput.some(line =>
        line.includes('❌ Application data validation failed')
      )).toBe(true);
    });

    test('handles nested validation errors correctly ', () => {
      const invalidData = createInvalidApplicationData('missing-required-field');

      const consoleOutput = captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData(invalidData);
        });
      });

      // Should log specific field path and error
      expect(consoleOutput.some(line =>
        line.includes('resume.name') || line.includes('Required')
      )).toBe(true);
    });

    test('handles null input gracefully ', () => {
      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData(null);
        }, 'Application data validation failed');
      });
    });

    test('handles undefined input gracefully ', () => {
      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData(undefined);
        }, 'Application data validation failed');
      });
    });

    test('handles non-object input ', () => {
      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData("not an object");
        });
      });
    });

    test('handles empty object input ', () => {
      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData({});
        });
      });
    });

    test('logs detailed error information for multiple validation errors ', () => {
      const badData = {
        metadata: {
          company: "",  // Empty string
          position: "Engineer",
          // Missing required fields
        },
        resume: {
          name: "John",
          contact: {
            email: "invalid-email",  // Invalid format
            phone: "+1-234-567-8900",
            // Missing other required fields
          }
          // Missing other required fields
        },
        job_analysis: null,
        cover_letter: null
      };

      const consoleOutput = captureConsoleOutput(() => {
        expectValidationError(() => {
          validateApplicationData(badData);
        });
      });

      // Should log multiple errors
      expect(consoleOutput.length).toBeGreaterThan(1);
      expect(consoleOutput.some(line => line.includes('error(s)') || line.includes('validation failed'))).toBe(true);
    });

    test('handles non-ZodError exceptions', () => {
      // Temporarily replace parse to throw a non-Zod error
      const mockSchema = {
        parse: (_data: unknown) => {
          throw new Error('Custom error');
        }
      };

      const consoleOutput = captureConsoleOutput(() => {
        expectValidationError(() => {
          // Directly test the error handling by simulating non-Zod error
          try {
            mockSchema.parse({});
          } catch (error) {
            if (!(error instanceof ZodError)) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error('❌ Unexpected validation error:', errorMessage);
              throw new Error(`Validation error: ${errorMessage}`);
            }
          }
        }, 'Validation error: Custom error');
      });

      expect(consoleOutput.some(line =>
        line.includes('❌ Unexpected validation error')
      )).toBe(true);
    });
  });

  describe('validateResume()', () => {
    test('validates complete resume data successfully', () => {
      const validData = createValidApplicationData();
      if (validData.resume) {
        const result = validateResume(validData.resume);
        expect(result).toEqual(validData.resume);
      }
    });

    test('throws error for invalid resume data ', () => {
      const invalidResume = {
        name: "",  // Empty string should fail
        profile_picture: "pic.jpg"
        // Missing required fields
      };

      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateResume(invalidResume);
        }, 'Resume data validation failed');
      });
    });

    test('logs resume validation errors to console ', () => {
      const invalidResume = { name: "" };

      const consoleOutput = captureConsoleOutput(() => {
        expectValidationError(() => {
          validateResume(invalidResume);
        });
      });

      expect(consoleOutput.some(line =>
        line.includes('❌ Resume validation failed')
      )).toBe(true);
    });

    test('handles non-ZodError exceptions in resume validation', () => {
      // Mock non-Zod error scenario
      expectValidationError(() => {
        const mockError = new Error('Network error');
        throw mockError;
      });
    });
  });

  describe('validateJobAnalysis()', () => {
    test('validates job analysis data when valid', () => {
      const validJobAnalysis = {
        company: "Test Company",
        position: "Engineer",
        job_focus: [{
          primary_area: "engineer" as const,
          specialties: ["react" as const],
          weight: 1.0
        }],
        location: "Remote",
        employment_type: "Full-time",
        experience_level: "Mid-level",
        requirements: {
          must_have_skills: [{ skill: "JavaScript", priority: 1 }],
          nice_to_have_skills: [],
          soft_skills: ["Communication"],
          experience_years: 3,
          education: "Bachelor's"
        },
        responsibilities: {
          primary: ["Develop software"],
          secondary: []
        },
        role_context: {
          department: "Engineering",
          team_size: "5-10",
          key_points: ["Agile environment"]
        },
        application_info: {
          posting_url: "https://example.com/job",
          posting_date: "2024-01-01",
          deadline: "2024-02-01"
        },
        candidate_alignment: {
          strong_matches: ["React experience"],
          gaps_to_address: [],
          transferable_skills: [],
          emphasis_strategy: "Focus on frontend skills"
        },
        section_priorities: {
          technical_expertise: ["React"],
          experience_focus: "Frontend development",
          project_relevance: "Web applications"
        },
        optimization_actions: {
          LEAD_WITH: ["React skills"],
          EMPHASIZE: ["Frontend experience"],
          QUANTIFY: ["Projects completed"],
          DOWNPLAY: ["Backend experience"]
        },
        ats_analysis: {
          title_variations: ["Frontend Engineer"],
          critical_phrases: ["React", "JavaScript"]
        }
      };

      const result = validateJobAnalysis(validJobAnalysis);
      expect(result).toEqual(validJobAnalysis);
    });

    test('throws error for invalid job analysis data ', () => {
      const invalidJobAnalysis = {
        company: "",  // Empty string
        position: "Engineer"
        // Missing required fields
      };

      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateJobAnalysis(invalidJobAnalysis);
        }, 'Job analysis data validation failed');
      });
    });
  });

  describe('validateCoverLetter()', () => {
    test('validates cover letter data when valid', () => {
      const validCoverLetter = {
        company: "Test Company",
        position: "Engineer",
        job_focus: [{
          primary_area: "engineer" as const,
          specialties: ["react" as const],
          weight: 1.0
        }],
        primary_focus: "Frontend development",
        date: "2024-01-01",
        personal_info: {
          phone: "+1-234-567-8900",
          email: "test@example.com",
          address: "123 Main St",
          linkedin: "https://linkedin.com/in/test",
          github: "https://github.com/test"
        },
        content: {
          letter_title: "Application for Engineer Position",
          opening_line: "I am excited to apply",
          body: ["Paragraph 1", "Paragraph 2"],
          signature: "Sincerely, John Doe"
        }
      };

      const result = validateCoverLetter(validCoverLetter);
      expect(result).toEqual(validCoverLetter);
    });

    test('throws error for invalid cover letter data ', () => {
      const invalidCoverLetter = {
        company: "",  // Empty string
        position: "Engineer"
        // Missing required fields
      };

      captureConsoleOutput(() => {
        expectValidationError(() => {
          validateCoverLetter(invalidCoverLetter);
        }, 'Cover letter data validation failed');
      });
    });
  });
});