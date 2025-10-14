import React from 'react';
import { Page, View, StyleSheet } from '@react-pdf/renderer';

import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema, ReactPDFProps } from '@types';

// Import section registry utilities
import { getVisibleResumeSectionsByColumn } from './section-registry';

const { colors, spacing, typography } = tokens.modern;

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
 * Resume PDF Component with dynamic section rendering
 * 72 dpi is the default for PDF
 * Ensure A4 page sizing (595.5 × 842.25 points)
 */
export const Resume = ({
  size = 'A4',
  orientation = 'portrait',
  wrap = true,
  debug = false,
  dpi = 72,
  bookmark,
  data,
}: ReactPDFProps) => {
  const resumeData = data as ResumeSchema;

  // Get visible sections organized by column
  const headerSections = getVisibleResumeSectionsByColumn(resumeData, 'header');
  const leftSections = getVisibleResumeSectionsByColumn(resumeData, 'left');
  const rightSections = getVisibleResumeSectionsByColumn(resumeData, 'right');

  return (
    <Page
      size={size}
      orientation={orientation}
      wrap={wrap}
      debug={debug}
      dpi={dpi}
      bookmark={bookmark}
      style={styles.page}
    >
      {/* Header sections (name, title, profile, summary) */}
      {headerSections.map((section) => {
        const Component = section.component;
        return <Component key={section.id} resume={resumeData} debug={debug} />;
      })}

      {/* Two-column layout */}
      <View style={styles.container}>
        {/* Left Column - Contact, Skills, Languages */}
        <View style={styles.leftColumn} debug={debug}>
          {leftSections.map((section) => {
            const Component = section.component;
            return <Component key={section.id} resume={resumeData} debug={debug} />;
          })}
        </View>

        {/* Right Column - Experience, Education */}
        <View style={styles.rightColumn}>
          {rightSections.map((section) => {
            const Component = section.component;
            return <Component key={section.id} resume={resumeData} debug={debug} />;
          })}
        </View>
      </View>
    </Page>
  );
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
