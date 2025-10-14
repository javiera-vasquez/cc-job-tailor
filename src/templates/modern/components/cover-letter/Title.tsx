import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { CoverLetterSchema } from '@types';

const { colors, spacing } = tokens.modern;

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

const Title = ({ data }: { data: CoverLetterSchema }) => {
  // Use position if available, otherwise fall back to letter_title
  const titleText = data.position ? `Cover Letter ${data.position}` : data.content.letter_title;

  return (
    <View style={styles.titleContainer}>
      <Text style={styles.titleText}>{titleText}</Text>
    </View>
  );
};

export default Title;
