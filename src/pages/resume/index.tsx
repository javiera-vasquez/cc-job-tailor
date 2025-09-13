import React from 'react';
import {
  Text,
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
import { colors } from './constants';

Font.register({
  family: 'Open Sans',
  src: `https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf`,
});

Font.register({
  family: 'Lato',
  src: `https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wWw.ttf`,
});

Font.register({
  family: 'Lato Italic',
  src: `https://fonts.gstatic.com/s/lato/v16/S6u8w4BMUTPHjxsAXC-v.ttf`,
});

Font.register({
  family: 'Lato Bold',
  src: `https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPHA.ttf`,
});

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Lato',
    color: colors.darkGray,
    // Ensure A4 page sizing (595.5 × 842.25 points)
    size: 'A4',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    '@media max-width: 400': {
      flexDirection: 'column',
    },
  },
  leftColumn: {
    flexDirection: 'column',
    width: 200, // Updated to match Figma specs (~200px)
    paddingTop: 20,
    paddingRight: 20,
    borderRight: `0.75px solid ${colors.separatorGray}`, // Vertical separator line
    '@media max-width: 400': {
      width: '100%',
      paddingRight: 0,
      borderRight: 'none',
    },
  },
  rightColumn: {
    flexDirection: 'column',
    flex: 1,
    paddingLeft: 20,
    paddingTop: 20,
    '@media max-width: 400': {
      paddingLeft: 0,
    },
  },
  sectionSeparator: {
    borderBottom: `0.75px solid ${colors.separatorGray}`,
    marginVertical: 16,
  },
});



const Resume = (props) => (
  <Page {...props} style={styles.page}>
    <Header />
    
    <View style={styles.container}>
      {/* Left Column - Contact, Education, Skills, Languages */}
      <View style={styles.leftColumn}>
        <Contact />
        <Skills />
        <Languages />
      </View>
      
      {/* Right Column - Experience */}
      <View style={styles.rightColumn}>
        <Experience />
        <Education />
      </View>
    </View>
  </Page>
);

const ResumeDocument = () :React.ReactElement => (
  <Document
    author={data.resume.name}
    keywords="frontend, react, typescript, senior engineer"
    subject={`The resume of ${data.resume.name}`}
    title="Resume"
  >
    <Resume size="A4" />
  </Document>
);

export default {
  id: 'resume',
  name: 'Resume',
  description: '',
  Document: ResumeDocument,
};
