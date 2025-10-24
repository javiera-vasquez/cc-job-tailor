import { z } from 'zod';
import {
  ApplicationDataSchema,
  ResumeSchema,
  JobAnalysisSchema,
  CoverLetterSchema,
} from './schemas';
import type {
  ApplicationData,
  ResumeSchema as ResumeType,
  JobAnalysisSchema as JobAnalysisType,
  CoverLetterSchema as CoverLetterType,
} from '@types';
import { loggers } from '@shared/core/logger';

// Validation functions with detailed error reporting
// Note: Error formatting is handled by the centralized validation-error-handler
export function validateApplicationData(data: unknown): ApplicationData {
  return ApplicationDataSchema.parse(data);
}

export function validateResume(data: unknown): ResumeType {
  try {
    return ResumeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      loggers.validation.error('Resume validation failed:', error, { issues: error.issues });
      throw new Error('Resume data validation failed');
    }
    throw error;
  }
}

export function validateJobAnalysis(data: unknown): JobAnalysisType {
  try {
    return JobAnalysisSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      loggers.validation.error('Job analysis validation failed:', error, { issues: error.issues });
      throw new Error('Job analysis data validation failed');
    }
    throw error;
  }
}

export function validateCoverLetter(data: unknown): CoverLetterType {
  try {
    return CoverLetterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      loggers.validation.error('Cover letter validation failed:', error, { issues: error.issues });
      throw new Error('Cover letter data validation failed');
    }
    throw error;
  }
}
