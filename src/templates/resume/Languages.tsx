import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { colors, spacing } from '../design-tokens';
import type { ResumeSchema } from '../../types';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: spacing.pagePadding / 2,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
  },
  languagesList: {
    flexDirection: 'column',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  // soft skills
  bullet: {
    width: 8,
    fontSize: 4,
    fontFamily: 'Lato',
    color: colors.primary,
    paddingTop: 3,
  },

  languageText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 8,
    lineHeight: 1.33,
    color: colors.primary,
  },
  language: {
    fontFamily: 'Lato Bold',
    fontSize: 8,
    color: colors.primary,
  },
});

const Languages = ({resume}: {resume: ResumeSchema}) => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>Languages</Text>
    <View style={styles.languagesList}>
      {resume.languages.map((language, index) => (
        <View key={index} style={styles.languageItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.languageText}>
            <Text style={styles.language}>{language.language}</Text> - {language.proficiency}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

export default Languages;