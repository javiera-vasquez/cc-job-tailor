import { type TailorThemeProps } from '../types';
import modernTheme from './modern';
import classicTheme from './classic';

export const themes: Record<string, TailorThemeProps> = {
  modern: modernTheme,
  classic: classicTheme,
} as const;

export type ThemeName = keyof typeof themes;
