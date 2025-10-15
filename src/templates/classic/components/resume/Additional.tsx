import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.pagePadding,
    paddingTop: spacing.pagePadding,
    borderTop: `1px solid ${colors.separatorGray}`,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 11,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.pagePadding / 2,
  },
  subsectionContainer: {
    marginBottom: spacing.pagePadding / 3,
  },
  subsectionRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  subsectionLabel: {
    fontFamily: 'Lato Bold',
    fontSize: 10,
    color: colors.darkGray,
    marginRight: 4,
  },
  subsectionContent: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
    flex: 1,
  },
});

const Additional = ({ resume }: { resume: ResumeSchema }) => {
  const hasTechnicalExpertise = (resume.technical_expertise?.length ?? 0) > 0;
  const hasSoftSkills = (resume.skills?.length ?? 0) > 0;
  const hasLanguages = (resume.languages?.length ?? 0) > 0;

  // Don't render if all sections are empty (should be caught by registry, but defensive check)
  if (!hasTechnicalExpertise && !hasSoftSkills && !hasLanguages) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>ADDITIONAL</Text>

      {/* Technical Expertise */}
      {hasTechnicalExpertise && (
        <View style={styles.subsectionContainer}>
          {resume.technical_expertise.map((category, index) => (
            <View key={index} style={styles.subsectionRow}>
              <Text style={styles.subsectionLabel}>{category.resume_title}:</Text>
              <Text style={styles.subsectionContent}>{category.skills.join(', ')}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Soft Skills */}
      {hasSoftSkills && (
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>Soft Skills:</Text>
          <Text style={styles.subsectionContent}>{resume.skills.join(', ')}</Text>
        </View>
      )}

      {/* Languages */}
      {hasLanguages && (
        <View style={styles.subsectionRow}>
          <Text style={styles.subsectionLabel}>Languages:</Text>
          <Text style={styles.subsectionContent}>
            {resume.languages.map((lang) => `${lang.language} (${lang.proficiency})`).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Additional;
