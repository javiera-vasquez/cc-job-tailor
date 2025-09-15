import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { colors } from '../design-tokens';
import type { ResumeSchema } from '../../types';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  separator: {
    borderBottom: `0.75px solid ${colors.separatorGray}`,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12.7,
    color: colors.darkGray,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  educationEntry: {
    marginBottom: 10,
  },
  institution: {
    fontFamily: 'Lato Bold',
    fontSize: 7.8,
    color: colors.darkGray,
    marginBottom: 2,
  },
  program: {
    fontFamily: 'Lato',
    fontSize: 7.8,
    color: colors.darkGray,
    marginBottom: 1,
  },
  locationDuration: {
    fontFamily: 'Lato',
    fontSize: 8.2,
    color: colors.mediumGray,
  },
});

const Education = ({resume}: {resume: ResumeSchema}) => (
  <View style={styles.container} debug={true}>
    {/* Horizontal separator line above Education section */}
    <View style={styles.separator} />
    
    {/* Section title */}
    <Text style={styles.sectionTitle}>Education</Text>
    
    {/* Education entries */}
    {resume.education.map((edu, index) => (
      <View key={index} style={styles.educationEntry}>
        <Text style={styles.institution}>{edu.institution}</Text>
        <Text style={styles.program}>{edu.program}</Text>
        <Text style={styles.locationDuration}>{edu.location} | {edu.duration}</Text>
      </View>
    ))}
  </View>
);

export default Education;
