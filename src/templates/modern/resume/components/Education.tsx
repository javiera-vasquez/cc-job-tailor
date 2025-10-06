import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { colors, spacing } from '@design-tokens';
import type { ResumeSchema } from '@types';

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.pagePadding / 2,
    paddingTop: spacing.pagePadding,
    borderTop: `1px solid ${colors.separatorGray}`,
  },

  sectionTitle: {
    color: colors.primary,
    fontFamily: 'Lato Bold',
    fontSize: 12,
    marginBottom: spacing.pagePadding / 2,
  },
  educationEntry: {
    marginBottom: spacing.pagePadding / 2,
  },
  institution: {
    fontFamily: 'Lato Bold',
    fontSize: 9,
    color: colors.primary,
    marginBottom: 2,
  },
  program: {
    fontSize: 8,
    color: colors.darkGray,
    marginBottom: 2,
  },
  locationDuration: {
    fontFamily: 'Lato',
    fontSize: 8,
    color: colors.mediumGray,
  },
});

const Education = ({ resume, debug }: { resume: ResumeSchema; debug: boolean }) => (
  <View style={styles.container} debug={debug}>
    {/* Section title */}
    <Text style={styles.sectionTitle}>Education</Text>

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

export default Education;
