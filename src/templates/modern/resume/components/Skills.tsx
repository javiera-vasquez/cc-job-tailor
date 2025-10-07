import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.modern;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: spacing.pagePadding / 2,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
  },
  categoryTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 8,
    color: colors.darkGray,
    marginBottom: 3,
  },

  groupBySection: {
    marginBottom: spacing.pagePadding / 3,
  },

  // technical expertise
  skillsList: {
    flexDirection: 'row',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },

  // soft skills
  bullet: {
    width: 8,
    fontSize: 4,
    fontFamily: 'Lato',
    color: colors.primary,
    paddingTop: 0,
  },

  skillText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 8,
    lineHeight: 1.33,
    color: colors.primary,
  },
});

const TechnicalExpertiseSection = ({ resume }: { resume: ResumeSchema }) => (
  <View>
    <Text style={styles.sectionTitle}>Technical Expertise</Text>
    {resume.technical_expertise.map((category, index) => (
      <View key={index} style={styles.groupBySection}>
        <Text style={styles.categoryTitle}>{category.resume_title}</Text>
        <View style={styles.skillsList}>
          <Text style={styles.skillText}>{category.skills.join(', ')}</Text>
        </View>
      </View>
    ))}
  </View>
);

const SoftSkillsSection = ({ resume }: { resume: ResumeSchema }) => (
  <View>
    <Text style={styles.sectionTitle}>Soft Skills</Text>
    {resume.skills.map((skill, index) => (
      <View key={index} style={styles.skillItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.skillText}>{skill}</Text>
      </View>
    ))}
  </View>
);

const Skills = ({ resume }: { resume: ResumeSchema }) => (
  <>
    <View style={styles.container}>
      <TechnicalExpertiseSection resume={resume} />
    </View>
    <View style={styles.container}>
      <SoftSkillsSection resume={resume} />
    </View>
  </>
);

export default Skills;
