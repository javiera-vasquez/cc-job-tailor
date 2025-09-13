import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import data from '../../data/resume';
import { colors } from './constants';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 13,
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
    fontFamily: 'Lato Bold',
    fontSize: 10.6,
    color: colors.primary,
    marginBottom: 2,
  },
  positionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 8,
    color: colors.primary,
    marginBottom: 2,
  },
  dateLocation: {
    fontFamily: 'Lato',
    fontSize: 8.2,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  companyDescription: {
    fontFamily: 'Lato',
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
    width: 2,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 500,
    marginRight: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  achievementText: {
    fontFamily: 'Lato',
    fontSize: 7.8,
    color: colors.primary,
    lineHeight: 1.28,
    flex: 1,
  },
});

const ExperienceEntry = ({ experience }) => {
  const { company, position, location, duration, company_description, achievements, name } = experience;

  return (
    <View style={styles.experienceEntry}>
      <View style={styles.companyHeader}>
        <Text style={styles.companyName}>{company || name.split(' - ')[0]}</Text>
      </View>
      
      <Text style={styles.positionTitle}>{position || name.split(' - ')[1]}</Text>
      
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
    <Text style={styles.sectionTitle}>Independent Projects</Text>
        {data.resume.independent_projects.map((experience, index) => (
        <ExperienceEntry
          key={`${experience.name}-${experience.location}-${index}`}
          experience={experience}
        />
    ))}
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
