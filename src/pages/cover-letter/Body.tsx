import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, typography } from '../design-tokens';
import type { CoverLetterSchema } from '../../types';

const styles = StyleSheet.create({
  bodyContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 11,
    fontFamily: 'Lato',
    color: colors.darkGray,
    marginBottom: 12,
    lineHeight: 1.4,
  },
  paragraph: {
    fontSize: 11,
    fontFamily: 'Lato',
    color: colors.darkGray,
    marginBottom: 12,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
});

interface BodyProps {
  coverLetter: CoverLetterSchema;
}

const Body = ({ coverLetter }: BodyProps) => (
  <View style={styles.bodyContainer}>
    <Text style={styles.greeting}>Dear Hiring Team at {coverLetter.company},</Text>
    
    <Text style={styles.paragraph}>{coverLetter.content.opening_paragraph}</Text>
    
    <Text style={styles.paragraph}>{coverLetter.content.body_paragraph_1}</Text>
    
    <Text style={styles.paragraph}>{coverLetter.content.body_paragraph_2}</Text>
    
    <Text style={styles.paragraph}>{coverLetter.content.closing_paragraph}</Text>
  </View>
);

export default Body;