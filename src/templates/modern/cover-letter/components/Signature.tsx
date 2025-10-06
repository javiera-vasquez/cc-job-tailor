import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing } from '@design-tokens';
import type { CoverLetterSchema } from '@types';

const styles = StyleSheet.create({
  signatureContainer: {
    flexDirection: 'column',
    marginTop: spacing.pagePadding / 2,
  },
  closing: {
    fontSize: 10,
    color: colors.primary,
    lineHeight: 1.5,
  },
  candidateName: {
    fontSize: 10,
    color: colors.primary,
    lineHeight: 1.5,
  },
});

const Signature = ({ data }: { data: CoverLetterSchema }) => (
  <View style={styles.signatureContainer}>
    <Text style={styles.candidateName}>{data.content.signature}</Text>
  </View>
);

export default Signature;
