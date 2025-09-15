import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { colors } from '../design-tokens';
import type { ResumeSchema } from '../../types';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 11.7,
    color: colors.primary,
    marginBottom: 8,
  },
  languagesList: {
    flexDirection: 'column',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    width: 8,
    fontSize: 2.67,
    fontFamily: 'Lato',
    color: colors.primary,
    paddingTop: 2,
  },
  languageText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 7.8,
    lineHeight: 1.54,
    color: colors.primary,
  },
});

const Languages = ({resume}: {resume: ResumeSchema}) => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>LANGUAGES</Text>
    <View style={styles.languagesList}>
      {resume.languages.map((language, index) => (
        <View key={index} style={styles.languageItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.languageText}>
            {language.language}: {language.proficiency}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

export default Languages;