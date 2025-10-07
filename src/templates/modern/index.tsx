import React from 'react';
import { type TailorThemeProps, type ResumeSchema, type CoverLetterSchema } from '@/types';
import { registerFonts } from '@template-core/fonts-register';
import { WithPDFWrapper } from '@template-core/with-pdf-wrapper';
import { Resume, resumeConfig } from './resume';
import { CoverLetter, coverLetterConfig } from './cover-letter';

// Wrapped Resume component using render prop pattern
const ResumeDocument = ({ data }: { data?: ResumeSchema }): React.ReactElement => (
  <WithPDFWrapper data={data} config={resumeConfig}>
    {(transformedData) => <Resume data={transformedData} />}
  </WithPDFWrapper>
);

// Wrapped CoverLetter component using render prop pattern
const CoverLetterDocument = ({ data }: { data?: CoverLetterSchema }): React.ReactElement => (
  <WithPDFWrapper data={data} config={coverLetterConfig}>
    {(transformedData) => <CoverLetter data={transformedData} />}
  </WithPDFWrapper>
);

const modernTheme: TailorThemeProps = {
  id: 'modern',
  name: 'Modern',
  description: 'A clean, modern template design',
  documents: ['resume', 'cover-letter'] as const,
  components: {
    resume: ResumeDocument,
    coverLetter: CoverLetterDocument,
  },
  initialize: () => {
    // Register fonts once at theme level
    registerFonts();
  },
};

// Initialize theme on module load
modernTheme.initialize?.();

export default modernTheme;
