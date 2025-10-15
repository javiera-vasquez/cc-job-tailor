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
    color: colors.primary,
    fontFamily: 'Lato Bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  categoryLabel: {
    fontFamily: 'Lato Bold',
    fontSize: 10,
    color: colors.darkGray,
    marginRight: 4,
  },
  categoryContent: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
    flex: 1,
  },
  separator: {
    width: '100%',
    borderBottom: `1px solid ${colors.separatorGray}`,
    paddingTop: spacing.pagePadding / 2,
    marginBottom: spacing.pagePadding / 2,
  },
});

const TechnicalSkills = ({ resume }: { resume: ResumeSchema }) => {
  if (!resume.technical_expertise || resume.technical_expertise.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>TECHNICAL SKILLS</Text>
      <View style={styles.separator} />
      {resume.technical_expertise.map((category, index) => (
        <View key={index} style={styles.categoryRow}>
          <Text style={styles.categoryLabel}>{category.resume_title}:</Text>
          <Text style={styles.categoryContent}>{category.skills.join(', ')}</Text>
        </View>
      ))}
    </View>
  );
};

export default TechnicalSkills;
