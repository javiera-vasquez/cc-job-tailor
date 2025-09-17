import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema, ContactDetails } from '../../types';

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

interface SignatureProps {
  coverLetter: CoverLetterSchema;
  personalInfo: ContactDetails & { name?: string };
}

const Signature = ({ coverLetter, personalInfo }: SignatureProps) => (
  <View style={styles.signatureContainer}>
    <Text style={styles.closing}>Sincerely,</Text>
    <Text style={styles.candidateName}>{personalInfo.name}</Text>
  </View>
);

export default Signature;