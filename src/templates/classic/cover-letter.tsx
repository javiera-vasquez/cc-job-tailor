import React from 'react';
import { Page, StyleSheet } from '@react-pdf/renderer';

import { tokens } from '@template-core/design-tokens';
import type { CoverLetterSchema, ReactPDFProps } from '@types';

import { COVER_LETTER_SECTIONS } from './section-registry';
import { getVisibleCoverLetterSections } from '@template-core/section-utils';

const { colors, spacing, typography } = tokens.classic;

/**
 * Configuration for the CoverLetter document wrapper
 */
export const coverLetterConfig = {
  getDocumentProps: (data: CoverLetterSchema) => ({
    title: 'Cover Letter',
    author: data.name || 'Resume Applicant',
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
  const visibleSections = getVisibleCoverLetterSections(COVER_LETTER_SECTIONS, coverLetter);

  return (
    <Page
      size={size}
      orientation={orientation}
      wrap={wrap}
      debug={debug}
      dpi={dpi}
      style={styles.letterPage}
    >
      {visibleSections.map((section) => {
        return <section.component key={section.id} data={coverLetter} debug={debug} />;
      })}
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
