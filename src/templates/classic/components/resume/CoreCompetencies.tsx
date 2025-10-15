import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.pagePadding,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  skillsText: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.4,
  },
  separator: {
    width: '100%',
    borderBottom: `1px solid ${colors.separatorGray}`,
    paddingTop: spacing.pagePadding / 2,
    marginBottom: spacing.pagePadding / 2,
  },
});

const CoreCompetencies = ({ resume }: { resume: ResumeSchema }) => {
  if (!resume.skills || resume.skills.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CORE COMPETENCIES</Text>
      <View style={styles.separator} />
      <Text style={styles.skillsText}>{resume.skills.join(' • ')}</Text>
    </View>
  );
};

export default CoreCompetencies;
