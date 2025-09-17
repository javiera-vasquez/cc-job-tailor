import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, typography } from '../design-tokens';
import type { CoverLetterSchema, ContactDetails } from '../../types';

const styles = StyleSheet.create({
  signatureContainer: {
    flexDirection: 'column',
    marginTop: 20,
  },
  closing: {
    fontSize: 11,
    fontFamily: 'Lato',
    color: colors.darkGray,
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 11,
    fontFamily: 'Lato',
    color: colors.darkGray,
  },
});

interface SignatureProps {
  coverLetter: CoverLetterSchema;
  personalInfo: ContactDetails & { name?: string };
}

const Signature = ({ coverLetter, personalInfo }: SignatureProps) => (
  <View style={styles.signatureContainer}>
    <Text style={styles.closing}>Sincerely,</Text>
    <Text style={styles.candidateName}>{personalInfo?.name || 'Javiera Vasquez'}</Text>
  </View>
);

export default Signature;