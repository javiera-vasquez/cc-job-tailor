import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing } from '@design-tokens';
import type { CoverLetterSchema } from '@types';

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

const Body = ({ data }: { data: CoverLetterSchema }) => {
  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.paragraph}>{data.content.opening_line}</Text>
      {data.content.body.map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
};

export default Body;
