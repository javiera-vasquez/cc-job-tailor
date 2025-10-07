import React from 'react';
import { Page, StyleSheet } from '@react-pdf/renderer';

import Header from './components/Header';
import DateLine from './components/DateLine';
import Title from './components/Title';
import Body from './components/Body';
import Signature from './components/Signature';

import { tokens } from '@template-core/design-tokens';
import type { CoverLetterSchema, ReactPDFProps } from '@types';

const { colors, spacing, typography } = tokens.classic;

/**
 * Configuration for the CoverLetter document wrapper
 */
export const coverLetterConfig = {
  getDocumentProps: (data: CoverLetterSchema) => ({
    title: 'Cover Letter',
    author: data.personal_info.name || 'Resume Applicant',
    subject: `Cover Letter for ${data.position} at ${data.company}`,
  }),
  emptyStateMessage: 'No cover letter data available. Please ensure cover letter data exists.',
};

export const CoverLetter = ({
  size = 'A4',
  orientation = 'portrait',
  wrap = true,
  debug = false,
  dpi = 72,
  bookmark: _bookmark,
  data,
}: ReactPDFProps) => {
  const coverLetter = data as CoverLetterSchema;

  return (
    <Page
      size={size}
      orientation={orientation}
      wrap={wrap}
      debug={debug}
      dpi={dpi}
      style={styles.letterPage}
    >
      <Header data={coverLetter} />
      <DateLine data={coverLetter} />
      <Title data={coverLetter} />
      <Body data={coverLetter} />
      <Signature data={coverLetter} />
    </Page>
  );
};

// Business letter styling with professional margins and typography
const styles = StyleSheet.create({
  letterPage: {
    fontFamily: typography.text.fontFamily,
    padding: spacing.documentPadding,
    color: colors.darkGray,
  },
});
