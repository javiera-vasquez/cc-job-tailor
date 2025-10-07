import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { ExperienceItem, ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  container: {
    // marginBottom: spacing.pagePadding,
    // paddingBottom: spacing.pagePadding,
    // borderBottom: `1px solid ${colors.separatorGray}`,
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: 'Lato Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: spacing.pagePadding / 2,
  },
  experienceEntry: {
    marginBottom: spacing.pagePadding,
  },
  companyHeader: {
    marginBottom: 2,
  },
  companyName: {
    fontFamily: 'Lato Bold',
    fontSize: 10,
    color: colors.primary,
  },
  positionTitle: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
    marginBottom: 2,
  },
  dateLocation: {
    fontSize: 10,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  companyDescription: {
    fontSize: 10,
    color: colors.darkGray,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  bullet: {
    fontSize: 10,
    color: colors.darkGray,
    marginRight: 6,
  },
  achievementText: {
    flex: 1,
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.4,
  },
});

const ExperienceEntry = ({ experience, debug }: { experience: ExperienceItem; debug: boolean }) => {
  const {
    company,
    position,
    location,
    duration,
    description,
    company_description,
    achievements,
    name,
    linkedin,
  } = experience as any;

  return (
    <View style={styles.experienceEntry} debug={debug}>
      <View style={styles.companyHeader}>
        <Text style={styles.companyName}>
          {linkedin ? (
            <Link style={styles.companyName} src={linkedin}>
              {company || name.split(' - ')[0]}
            </Link>
          ) : (
            company || name.split(' - ')[0]
          )}
        </Text>
      </View>

      <Text style={styles.positionTitle}>{position || name.split(' - ')[1]}</Text>

      <Text style={styles.dateLocation}>
        {location} | {duration}
      </Text>

      {company_description && <Text style={styles.companyDescription}>{company_description}</Text>}

      {description && <Text style={styles.companyDescription}>{description}</Text>}

      {achievements && achievements.length > 0 && (
        <View>
          {achievements.map((achievement: string, index: number) => (
            <View key={index} style={styles.achievementItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.achievementText}>{achievement}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const Experience = ({ resume, debug }: { resume: ResumeSchema; debug: boolean }) => (
  <View style={styles.container} debug={debug}>
    <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
    {/* Render professional experience first */}
    {resume.professional_experience.map((experience, index) => (
      <ExperienceEntry
        key={`${experience.company}-${experience.position}-${index}`}
        experience={experience}
        debug={debug}
      />
    ))}
    {/* Then render independent projects */}
    {resume.independent_projects.map((experience, index) => (
      <ExperienceEntry
        key={`${experience.name}-${experience.location}-${index}`}
        experience={experience}
        debug={debug}
      />
    ))}
  </View>
);

export default Experience;
