import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing } from '@template-core/design-tokens';
import type { CoverLetterSchema } from '@types';

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

const DateLine = ({ data }: { data: CoverLetterSchema }) => (
  <View style={styles.dateContainer}>
    <Text style={styles.dateText}>{data.date}</Text>
  </View>
);

export default DateLine;
