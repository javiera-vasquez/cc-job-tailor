import React from 'react';
import { Page, StyleSheet } from '@react-pdf/renderer';

import Header from './Header';
import DateLine from './DateLine';
import Title from './Title';
import Body from './Body';
import Signature from './Signature';

import { colors, spacing, typography } from '@design-tokens';
import type { CoverLetterSchema, ReactPDFProps } from '@types';

/**
 * Configuration for the CoverLetter document wrapper
 */
export const coverLetterConfig = {
  getDocumentProps: (data: CoverLetterSchema) => ({
    author: data.personal_info.name || 'Resume Applicant',
    keywords: 'cover letter, application, professional',
    subject: `Cover Letter for ${data.position} at ${data.company}`,
    title: 'Cover Letter',
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
