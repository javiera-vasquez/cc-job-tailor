import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.pagePadding,
    paddingBottom: spacing.pagePadding,
    borderBottom: `1px solid ${colors.separatorGray}`,
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: 'Lato Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: spacing.pagePadding / 2,
  },
  educationEntry: {
    marginBottom: spacing.pagePadding / 2,
  },
  institution: {
    fontFamily: 'Lato Bold',
    fontSize: 10,
    color: colors.primary,
    marginBottom: 2,
  },
  program: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
    marginBottom: 2,
  },
  locationDuration: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.mediumGray,
  },
});

const Education = ({ resume, debug = false }: { resume: ResumeSchema; debug?: boolean }) => {
  // Don't render if education is empty (should be caught by registry, but defensive check)
  if (!resume.education || resume.education.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} debug={debug}>
      {/* Section title */}
      <Text style={styles.sectionTitle}>EDUCATION</Text>

      {/* Education entries */}
      {resume.education.map((edu, index) => (
        <View key={index} style={styles.educationEntry}>
          <Text style={styles.institution}>{edu.institution}</Text>
          <Text style={styles.program}>{edu.program}</Text>
          <Text style={styles.locationDuration}>
            {edu.location} | {edu.duration}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default Education;
