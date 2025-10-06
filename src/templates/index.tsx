import modernResume from './modern/resume/index';
import modernCoverLetter from './modern/cover-letter/index';

export const themes = {
  modern: {
    resume: modernResume,
    coverLetter: modernCoverLetter,
  },
} as const;

export type ThemeName = keyof typeof themes;
