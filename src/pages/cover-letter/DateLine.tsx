import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, typography } from '../design-tokens';
import type { CoverLetterSchema } from '../../types';

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Lato',
    color: colors.darkGray,
  },
});

interface DateLineProps {
  coverLetter: CoverLetterSchema;
}

const DateLine = ({ coverLetter }: DateLineProps) => (
  <View style={styles.dateContainer}>
    <Text style={styles.dateText}>{coverLetter.date}</Text>
  </View>
);

export default DateLine;