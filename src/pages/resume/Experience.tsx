import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { colors, spacing } from '../design-tokens';
import type { ProfessionalExperience, ResumeSchema } from '../../types';

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    marginRight: spacing.pagePadding / 3,
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: 'Lato Bold',
    fontSize: 12,
    marginBottom: spacing.pagePadding / 2,
  },
  experienceEntry: {
    marginBottom: spacing.pagePadding / 2,
  },
  companyHeader: {
    marginBottom: 2,
  },
  companyName: {
    fontFamily: 'Lato Bold',
    fontSize: 11,
    color: colors.primary,
  },
  positionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 2,
  },
  dateLocation: {
    fontSize: 9,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  companyDescription: {
    fontSize: 9,
    color: colors.darkGray,
    marginBottom: 6,
    lineHeight: 1.33,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  bullet: {
    width: 2,
    height: 2,
    backgroundColor: colors.darkGray,
    borderRadius: 500,
    marginRight: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  achievementText: {
    fontSize: 9,
    color: colors.darkGray,
    lineHeight: 1.3,
  },
});

// TODO: FIX THIS TS ISSUE
const ExperienceEntry = ({ experience, debug }: { experience: ProfessionalExperience, debug: boolean }) => {
  const { company, position, location, duration, company_description, achievements, name, linkedin } = experience as any;

  return (
    <View style={styles.experienceEntry} debug={debug}>
      <View style={styles.companyHeader}>
        <Text style={styles.companyName}>
          {linkedin ? (
            <Link style={styles.companyName} src={linkedin}>{company || name.split(' - ')[0]}</Link>
          ) : (
            company || name.split(' - ')[0]
          )}
        </Text>
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
        <View>
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

const Experience = ({resume, debug}: {resume: ResumeSchema, debug: boolean}) => (
  <View style={styles.container} debug={debug}>
    <Text style={styles.sectionTitle}>Independent Projects</Text>
        {resume.independent_projects.map((experience, index) => (
        <ExperienceEntry
          key={`${experience.name}-${experience.location}-${index}`}
          experience={experience}
          debug={debug}
        />
    ))}
    <Text style={styles.sectionTitle}>Professional Experience</Text>
    {resume.professional_experience.map((experience, index) => (
      <ExperienceEntry
        key={`${experience.company}-${experience.position}-${index}`}
        experience={experience}
        debug={debug}
      />
    ))}
  </View>
);

export default Experience;
