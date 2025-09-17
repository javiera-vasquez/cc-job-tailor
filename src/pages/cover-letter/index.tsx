import React from 'react';
import {
  Page,
  Document,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';

import Header from './Header';
import DateLine from './DateLine';
import Title from './Title';
import Body from './Body';
import Signature from './Signature';

import applicationData from "../../data/application";
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema, ContactDetails } from '../../types';
import { registerFonts } from '../fonts-register';

console.log('applicationData cover', applicationData);

// Register fonts
registerFonts();

// Get cover letter data from application data
const coverLetterData: CoverLetterSchema | null = applicationData.cover_letter || null;
// Extract contact info and name from resume data
const personalInfo: ContactDetails & { name?: string } | null = applicationData.resume
  ? { ...applicationData.resume.contact, name: applicationData.resume.name }
  : null;

const CoverLetterPage = ({
  coverLetter,
  personalInfo,
  debug = false
}: {
  coverLetter: CoverLetterSchema;
  personalInfo: ContactDetails & { name?: string };
  debug?: boolean;
}) => (
  <Page style={styles.letterPage} debug={debug}>
    <Header coverLetter={coverLetter} personalInfo={personalInfo} />
    <DateLine coverLetter={coverLetter} />
    <Title coverLetter={coverLetter} />
    <Body coverLetter={coverLetter} />
    <Signature coverLetter={coverLetter} personalInfo={personalInfo} />
  </Page>
);

const CoverLetterDocument = (): React.ReactElement => {
  if (!coverLetterData || !personalInfo) {
    // Return empty document if no cover letter data available
    return (
      <Document title="No Cover Letter Data Available">
        <Page size="A4" style={styles.letterPage}>
          <View style={{ padding: 50, textAlign: 'center' }}>
            <Text style={{ fontSize: 16, color: colors.darkGray }}>
              No cover letter data available. Please ensure cover letter data exists.
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document
      author={personalInfo.name || 'Resume Applicant'}
      keywords="cover letter, application, professional"
      subject={`Cover Letter for ${coverLetterData.position} at ${coverLetterData.company}`}
      title="Cover Letter"
    >
      <CoverLetterPage 
        coverLetter={coverLetterData} 
        personalInfo={personalInfo}
      />
    </Document>
  );
};

// Business letter styling with professional margins and typography
const styles = StyleSheet.create({
  letterPage: {
    fontFamily: typography.text.fontFamily,
    padding: 50, // Business letter margins
    color: colors.darkGray,
    lineHeight: 1.4,
    fontSize: 11, // Professional business letter font size
  },
});

export default {
  id: 'cover-letter',
  name: 'Cover Letter',
  description: 'Professional cover letter template',
  Document: CoverLetterDocument,
};