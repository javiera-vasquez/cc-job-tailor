import { z } from 'zod';
import {
  ApplicationDataSchema,
  ResumeSchema,
  JobAnalysisSchema,
  CoverLetterSchema
} from './schemas';
import type {
  ApplicationData,
  ResumeSchema as ResumeType,
  JobAnalysisSchema as JobAnalysisType,
  CoverLetterSchema as CoverLetterType
} from '../types';

// Validation functions with detailed error reporting
export function validateApplicationData(data: unknown): ApplicationData {
  try {
    return ApplicationDataSchema.parse(data);
  } catch (error) {
    // Check if it's a ZodError (can be checked by name or by issues property)
    if (error instanceof z.ZodError || (error && typeof error === 'object' && 'issues' in error)) {
      const zodError = error as z.ZodError;
      const errors = zodError.issues;

      console.error('❌ Application data validation failed:');
      errors.forEach(err => {
        const path = err.path.join('.');
        const received = 'received' in err ? ` (received: ${err.received})` : '';
        console.error(`  • ${path}: ${err.message}${received}`);
      });

      throw new Error(`Application data validation failed with ${errors.length} error(s)`);
    } else {
      // Handle non-Zod errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Unexpected validation error:', errorMessage);
      throw new Error(`Validation error: ${errorMessage}`);
    }
  }
}

export function validateResume(data: unknown): ResumeType {
  try {
    return ResumeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Resume validation failed:', error.issues);
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
      console.error('❌ Job analysis validation failed:', error.issues);
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
      console.error('❌ Cover letter validation failed:', error.issues);
      throw new Error('Cover letter data validation failed');
    }
    throw error;
  }
}