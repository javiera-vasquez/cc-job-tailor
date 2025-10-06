import { type TailorThemeProps } from '../types';
import modernTheme from './modern';

export const themes: Record<string, TailorThemeProps> = {
  modern: modernTheme,
} as const;

export type ThemeName = keyof typeof themes;
