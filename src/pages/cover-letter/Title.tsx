import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, typography } from '../design-tokens';
import type { CoverLetterSchema } from '../../types';

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Lato Bold',
    color: colors.primary,
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