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
  languagesText: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.4,
    marginBottom: spacing.pagePadding / 2,
  },
  separator: {
    width: '100%',
    borderBottom: `1px solid ${colors.separatorGray}`,
    paddingTop: spacing.pagePadding / 2,
    marginBottom: spacing.pagePadding / 2,
  },
});

const Languages = ({ resume }: { resume: ResumeSchema }) => {
  if (!resume.languages || resume.languages.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>LANGUAGES</Text>
      <View style={styles.separator} />
      <Text style={styles.languagesText}>
        {resume.languages.map((lang) => `${lang.language} (${lang.proficiency})`).join(' • ')}
      </Text>
    </View>
  );
};

export default Languages;
