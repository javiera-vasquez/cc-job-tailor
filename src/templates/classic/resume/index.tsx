import React from 'react';
import { Page, View, StyleSheet } from '@react-pdf/renderer';

import Header from './components/Header';
import Summary from './components/Summary';
import Additional from './components/Additional';
import Education from './components/Education';
import Experience from './components/Experience';

import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema, ReactPDFProps } from '@types';

const { colors, spacing, typography } = tokens.classic;

/**
 * Configuration for the Resume document wrapper
 */
export const resumeConfig = {
  getDocumentProps: (data: ResumeSchema) => ({
    title: 'Resume',
    author: data.name,
    subject: `The resume of ${data.name}`,
  }),
  transformData: (data: any) => (data.personal_info ? transformSourceToResumeSchema(data) : data),
  emptyStateMessage:
    'No resume data available. Please ensure source files exist or use -C flag to specify a company folder.',
};

/**
 * Transform source data format to ResumeSchema when needed
 * Used by the HOC wrapper to normalize data before rendering
 */
export function transformSourceToResumeSchema(sourceData: any): ResumeSchema {
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
export const Resume = ({
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
    <Header resume={data as ResumeSchema} />

    {/* Single column layout */}
    <View style={styles.container}>
      <Summary resume={data as ResumeSchema} />
      <Education resume={data as ResumeSchema} debug={debug} />
      <Experience resume={data as ResumeSchema} debug={debug} />
      <Additional resume={data as ResumeSchema} />
    </View>
  </Page>
);

const styles = StyleSheet.create({
  page: {
    fontFamily: typography.text.fontFamily,
    padding: spacing.documentPadding,
    color: colors.darkGray,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});
