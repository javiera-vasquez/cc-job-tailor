import { type TailorThemeProps } from '@/types';
import { registerFonts } from '@fonts-register';
import ResumeDocument from './resume/index';
import CoverLetterDocument from './cover-letter/index';

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
