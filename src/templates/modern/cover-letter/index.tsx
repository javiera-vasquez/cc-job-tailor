import React from 'react';
import { Page, Document, View, Text, StyleSheet } from '@react-pdf/renderer';

import Header from './Header';
import DateLine from './DateLine';
import Title from './Title';
import Body from './Body';
import Signature from './Signature';

import { colors, spacing, typography } from '@design-tokens';
import type { CoverLetterSchema, ReactPDFProps } from '@types';


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

const CoverLetterDocument = ({ data }: { data?: CoverLetterSchema }): React.ReactElement => {
  if (!data) {
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
      author={data.personal_info.name || 'Resume Applicant'}
      keywords="cover letter, application, professional"
      subject={`Cover Letter for ${data.position} at ${data.company}`}
      title="Cover Letter"
    >
      <CoverLetter data={data} />
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

export default CoverLetterDocument;
