import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema } from '../../types';

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: spacing.pagePadding / 1.5,
  },
  titleText: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: colors.primary,
    marginBottom: 6,
    lineHeight: 1.33,
  },
});

interface TitleProps {
  coverLetter: CoverLetterSchema;
}

const Title = ({ coverLetter }: TitleProps) => (
  <View style={styles.titleContainer}>
    <Text style={styles.titleText}>Cover Letter {coverLetter.position}</Text>
  </View>
);

export default Title;