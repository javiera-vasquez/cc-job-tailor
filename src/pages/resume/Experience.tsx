import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import data from '../../data/resume';
import { colors } from './constants';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '1.5625%',
    color: colors.primary,
    marginBottom: 12,
  },
  experienceEntry: {
    marginBottom: 16,
  },
  companyHeader: {
    marginBottom: 2,
  },
  companyName: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 10.6,
    color: colors.primary,
    marginBottom: 2,
  },
  companyUnderline: {
    borderBottomWidth: 0.75,
    borderBottomColor: colors.primary,
    marginBottom: 4,
  },
  positionTitle: {
    fontFamily: 'Inter',
    fontWeight: 700,
    fontSize: 8,
    letterSpacing: '0.78125%',
    color: colors.primary,
    marginBottom: 2,
  },
  dateLocation: {
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 8.2,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  companyDescription: {
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 7.8,
    color: colors.darkGray,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  achievementsList: {
    marginTop: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 2.67,
    backgroundColor: colors.primary,
    borderRadius: 500,
    marginRight: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  achievementText: {
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 7.8,
    color: colors.primary,
    lineHeight: 1.28,
    flex: 1,
  },
});

const ExperienceEntry = ({ experience }) => {
  const { company, position, location, duration, company_description, achievements } = experience;

  return (
    <View style={styles.experienceEntry}>
      <View style={styles.companyHeader}>
        <Text style={styles.companyName}>{company}</Text>
        <View style={styles.companyUnderline} />
      </View>
      
      <Text style={styles.positionTitle}>{position}</Text>
      
      <Text style={styles.dateLocation}>
        {location} | {duration}
      </Text>
      
      {company_description && (
        <Text style={styles.companyDescription}>
          {company_description}
        </Text>
      )}
      
      {achievements && achievements.length > 0 && (
        <View style={styles.achievementsList}>
          {achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <View style={styles.bullet} />
              <Text style={styles.achievementText}>
                {achievement}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const Experience = () => (
  <View style={styles.container}>
    <Text style={styles.sectionTitle}>Professional Experience</Text>
    {data.resume.professional_experience.map((experience, index) => (
      <ExperienceEntry
        key={`${experience.company}-${experience.position}-${index}`}
        experience={experience}
      />
    ))}
  </View>
);

export default Experience;
