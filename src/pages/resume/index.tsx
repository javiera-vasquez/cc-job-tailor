import React from 'react';
import {
  Font,
  Page,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';

import Header from './Header';
import Contact from './Contact';
import Skills from './Skills';
import Languages from './Languages';
import Education from './Education';
import Experience from './Experience';

import data from "../../data/resume";
import { colors, spacing, typography } from '../design-tokens';
import type { ResumeSchema, ReactPDFProps } from '../../types';
import { registerFonts } from '../fonts-register';

// TODO: FIX THIS
const resumeData = data.resume as unknown as ResumeSchema;
// Register available fonts
registerFonts();

// 72 dpi is the default for PDF
// Ensure A4 page sizing (595.5 × 842.25 points)
const Resume = ({
  size = 'A4', 
  orientation = 'portrait', 
  wrap = true, 
  debug = false,
  dpi = 72,
  bookmark,
  data
}: ReactPDFProps) => (
  <Page 
    size={size} 
    orientation={orientation} 
    wrap={wrap} 
    debug={debug}
    dpi={dpi}
    bookmark={bookmark}
    style={styles.page}
  >
    <Header resume={data}/>
    
    <View style={styles.container}>
      {/* Left Column - Contact, Education, Skills, Languages */}
      <View style={styles.leftColumn} debug={debug}>
        <Contact resume={data}/>
        <Skills resume={data}/>
        <Languages resume={data}/>
      </View>
      
      {/* Right Column - Experience */}
      <View style={styles.rightColumn}>
        <Experience resume={data} debug={debug}/>
        <Education resume={data} debug={debug}/>
      </View>
    </View>
  </Page>
);

const ResumeDocument = () :React.ReactElement => (
  <Document
    author={resumeData.name}
    keywords="frontend, react, typescript, senior engineer"
    subject={`The resume of ${resumeData.name}`}
    title="Resume"
  >
    <Resume data={resumeData}/>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    fontFamily: typography.text.fontFamily,
    padding: spacing.documentPadding,
    color: colors.darkGray,
  },
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  leftColumn: {
    flexDirection: 'column',
    width: spacing.columnWidth, 
    paddingTop: spacing.pagePadding,
    paddingRight: spacing.pagePadding,
    borderRight: `1px solid ${colors.separatorGray}`, // Vertical separator line
  },
  rightColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: spacing.pagePadding,
    paddingTop: spacing.pagePadding,
  }
});

export default {
  id: 'resume',
  name: 'Resume',
  description: '',
  Document: ResumeDocument,
};
