import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import data from '../../data/resume';
import { colors } from './constants';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
  },
  softSkillsSectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
  },
  technicalExpertiseSection: {
    marginBottom: 16,
  },
  skillCategory: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.darkGray,
    marginBottom: 2,
  },
  skillsList: {
    flexDirection: 'row',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    fontSize: 6,
    fontFamily: 'Lato',
    color: colors.darkGray,
    paddingTop: 1,
  },
  skillText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.darkGray,
    letterSpacing: 0,
  },
  softSkillsSection: {
    flexDirection: 'column',
  },
  softSkillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1.5,
  },
  softSkillText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 7.8,
    lineHeight: 1.28,
    color: colors.darkGray,
  },
});

const TechnicalExpertiseSection = () => (
  <View style={styles.technicalExpertiseSection}>
    <Text style={styles.sectionTitle}>Technical Expertise</Text>
    {data.resume.technical_expertise.map((category, index) => (
      <View key={index} style={styles.skillCategory}>
        <Text style={styles.categoryTitle}>{category.resume_title}:</Text>
        <View style={styles.skillsList}>
          <Text style={styles.skillText}>{category.skills.join(', ')}</Text>
        </View>
      </View>
    ))}
  </View>
);

const SoftSkillsSection = () => (
  <View style={styles.softSkillsSection}>
    <Text style={styles.softSkillsSectionTitle}>Soft Skills</Text>
    {data.resume.skills.map((skill, index) => (
      <View key={index} style={styles.softSkillItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.softSkillText}>{skill}</Text>
      </View>
    ))}
  </View>
);

const Skills = () => (
  <View style={styles.container}>
    <TechnicalExpertiseSection />
    <SoftSkillsSection />
  </View>
);

export default Skills;
