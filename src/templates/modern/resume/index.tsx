import React from 'react';
import { Page, View, Text, Document, StyleSheet } from '@react-pdf/renderer';

import Header from './Header';
import Contact from './Contact';
import Skills from './Skills';
import Languages from './Languages';
import Education from './Education';
import Experience from './Experience';

import { colors, spacing, typography } from '@design-tokens';
import type { ResumeSchema, ReactPDFProps } from '@types';
import { registerFonts } from '@fonts-register';

// Register available fonts
registerFonts();

// Transform source data format to ResumeSchema when needed
function transformSourceToResumeSchema(sourceData: any): ResumeSchema {
  // Convert technical_expertise from object to array format
  const technicalExpertise = Object.entries(sourceData.technical_expertise).map(
    ([key, skills]) => ({
      resume_title: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      skills: skills as string[],
    }),
  );

  // Flatten soft_skills into a simple array
  const softSkills = Object.values(sourceData.soft_skills).flat() as string[];

  return {
    name: sourceData.personal_info.name,
    profile_picture: sourceData.personal_info.profile_picture,
    title: sourceData.personal_info.titles.frontend_focused, // Default to frontend
    summary: sourceData.personal_info.summaries.frontend_focused, // Default to frontend
    contact: sourceData.contact,
    technical_expertise: technicalExpertise,
    skills: softSkills,
    languages: sourceData.languages,
    professional_experience: sourceData.professional_experience,
    independent_projects: sourceData.independent_projects,
    education: sourceData.education,
  };
}


// 72 dpi is the default for PDF
// Ensure A4 page sizing (595.5 × 842.25 points)
const Resume = ({
  size = 'A4',
  orientation = 'portrait',
  wrap = true,
  debug = false,
  dpi = 72,
  bookmark,
  data,
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
    {/* fix type error */}
    <Header resume={data as ResumeSchema} />

    <View style={styles.container}>
      {/* Left Column - Contact, Education, Skills, Languages */}
      <View style={styles.leftColumn} debug={debug}>
        <Contact resume={data as ResumeSchema} />
        <Skills resume={data as ResumeSchema} />
        <Languages resume={data as ResumeSchema} />
      </View>

      {/* Right Column - Experience */}
      <View style={styles.rightColumn}>
        <Experience resume={data as ResumeSchema} debug={debug} />
        <Education resume={data as ResumeSchema} debug={debug} />
      </View>
    </View>
  </Page>
);

const ResumeDocument = ({ data }: { data?: ResumeSchema }): React.ReactElement => {
  if (!data) {
    // Return empty document if no resume data available
    return (
      <Document title="No Resume Data Available">
        <Page size="A4" style={styles.page}>
          <View style={{ padding: 50, textAlign: 'center' }}>
            <Header resume={{} as ResumeSchema} />
            <View style={{ marginTop: 100 }}>
              <Text style={{ fontSize: 16, color: colors.darkGray }}>
                No resume data available. Please ensure source files exist or use -C flag to specify
                a company folder.
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  // Check if data needs transformation (source format vs tailored format)
  const resumeData = (data as any).personal_info
    ? transformSourceToResumeSchema(data) // Source data format - needs transformation
    : data; // Tailored format

  return (
    <Document
      author={resumeData.name}
      keywords="frontend, react, typescript, senior engineer"
      subject={`The resume of ${resumeData.name}`}
      title="Resume"
    >
      <Resume data={resumeData} />
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    fontFamily: typography.text.fontFamily,
    padding: spacing.documentPadding,
    color: colors.darkGray,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flexDirection: 'column',
    width: spacing.columnWidth,
    paddingTop: spacing.pagePadding,
    paddingRight: spacing.pagePadding,
    borderRight: `1px solid ${colors.separatorGray}`,
  },
  rightColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: spacing.pagePadding,
    paddingTop: spacing.pagePadding,
  },
});

export default {
  id: 'resume',
  name: 'Resume',
  description: '',
  Document: ResumeDocument,
};
