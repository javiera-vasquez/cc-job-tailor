import React from 'react';
import { Page, Document, View, Text, StyleSheet } from '@react-pdf/renderer';

import Header from './Header';
import DateLine from './DateLine';
import Title from './Title';
import Body from './Body';
import Signature from './Signature';

import applicationData from '../../data/application';
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema, ContactDetails, ReactPDFProps } from '../../types';
import { registerFonts } from '../fonts-register';

// Register fonts
registerFonts();

// Get cover letter data from application data
const coverLetterData: CoverLetterSchema | null = applicationData.cover_letter || null;
// Extract contact info and name from resume data
const personalInfo: (ContactDetails & { name?: string }) | null = applicationData.resume
  ? { ...applicationData.resume.contact, name: applicationData.resume.name }
  : null;

const CoverLetter = ({
  size = 'A4',
  orientation = 'portrait',
  wrap = true,
  debug = false,
  dpi = 72,
  bookmark: _bookmark,
  data,
}: ReactPDFProps) => {
  const coverLetter = data as CoverLetterSchema;

  return (
    <Page
      size={size}
      orientation={orientation}
      wrap={wrap}
      debug={debug}
      dpi={dpi}
      style={styles.letterPage}
    >
      <Header data={coverLetter} />
      <DateLine data={coverLetter} />
      <Title data={coverLetter} />
      <Body data={coverLetter} />
      <Signature data={coverLetter} />
    </Page>
  );
};

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
      <CoverLetter data={coverLetterData} />
    </Document>
  );
};

// Business letter styling with professional margins and typography
const styles = StyleSheet.create({
  letterPage: {
    fontFamily: typography.text.fontFamily,
    padding: spacing.documentPadding,
    color: colors.darkGray,
  },
});

export default {
  id: 'cover-letter',
  name: 'Cover Letter',
  description: 'Professional cover letter template',
  Document: CoverLetterDocument,
};
