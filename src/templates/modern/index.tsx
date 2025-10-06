import { type TailorThemeProps } from '@/types';
import ResumeDocument from './resume/index';
import CoverLetterDocument from './cover-letter/index';

const modernTheme: TailorThemeProps = {
  id: 'modern',
  name: 'Modern',
  description: 'A clean, modern template design',
  documents: ['resume', 'cover-letter'],
  components: {
    resume: ResumeDocument,
    coverLetter: CoverLetterDocument,
  },
};

export default modernTheme;
