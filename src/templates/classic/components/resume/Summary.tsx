import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.pagePadding,
    paddingTop: spacing.pagePadding,
    borderTop: `1px solid ${colors.separatorGray}`,
    marginBottom: spacing.pagePadding,
    paddingBottom: spacing.pagePadding,
    borderBottom: `1px solid ${colors.separatorGray}`,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.pagePadding / 2,
  },
  summaryText: {
    fontFamily: 'Lato',
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.darkGray,
  },
});

const Summary = ({ resume }: { resume: ResumeSchema }) => {
  // Only render if summary exists and is not empty
  if (!resume.summary || resume.summary.trim() === '') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SUMMARY</Text>
      <Text style={styles.summaryText}>{resume.summary}</Text>
    </View>
  );
};

export default Summary;
