import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import data from '../../data/resume';
import { colors } from './constants';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '1.171875%',
    color: colors.primary,
    marginBottom: 8,
  },
  softSkillsSectionTitle: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '1.5625%',
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
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.darkGray,
    marginBottom: 4,
  },
  skillsList: {
    flexDirection: 'column',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    width: 8,
    fontSize: 6,
    fontFamily: 'Inter',
    fontWeight: 400,
    color: colors.darkGray,
    paddingTop: 1,
  },
  skillText: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: 400,
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
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 7.8,
    lineHeight: 1.28,
    color: colors.darkGray,
    letterSpacing: '-2.734375%',
  },
});

const TechnicalExpertiseSection = () => (
  <View style={styles.technicalExpertiseSection}>
    <Text style={styles.sectionTitle}>Technical Expertise</Text>
    {data.resume.technical_expertise.map((category, index) => (
      <View key={index} style={styles.skillCategory}>
        <Text style={styles.categoryTitle}>{category.resume_title}:</Text>
        <View style={styles.skillsList}>
          {category.skills.map((skill, skillIndex) => (
            <View key={skillIndex} style={styles.skillItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
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
