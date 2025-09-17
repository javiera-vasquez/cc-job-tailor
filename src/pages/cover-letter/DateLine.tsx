import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema } from '../../types';

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: 'row',
    marginBottom: spacing.pagePadding * 1.5,
  },
  dateText: {
    fontSize: 9,
    fontFamily: 'Lato',
    color: colors.mediumGray,
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