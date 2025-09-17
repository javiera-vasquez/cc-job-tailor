import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema } from '../../types';

const styles = StyleSheet.create({
  bodyContainer: {
    flexDirection: 'column',
    marginBottom: spacing.pagePadding / 2,
  },
  paragraph: {
    fontSize: 10,
    fontFamily: 'Lato',
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
    lineHeight: 1.5,
  },
});

interface BodyProps {
  coverLetter: CoverLetterSchema;
}

const Body = ({ coverLetter }: BodyProps) => {
  
  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.paragraph}>{coverLetter.content.opening_paragraph}</Text>
      <Text style={styles.paragraph}>{coverLetter.content.body_paragraph_1}</Text>
      <Text style={styles.paragraph}>{coverLetter.content.body_paragraph_2}</Text>
      <Text style={styles.paragraph}>{coverLetter.content.closing_paragraph}</Text>
    </View>
  );
};

export default Body;