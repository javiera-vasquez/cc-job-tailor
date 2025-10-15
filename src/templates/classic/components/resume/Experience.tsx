import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { ExperienceItem, ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.pagePadding,
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: 'Lato Bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  experienceEntry: {
    marginBottom: spacing.pagePadding,
  },
  positionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 10,
    color: colors.primary,
    marginBottom: 2,
  },
  companyDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  companyLocation: {
    fontFamily: 'Lato',
    fontSize: 10,
    color: colors.darkGray,
  },
  dateRange: {
    fontSize: 10,
    color: colors.mediumGray,
    textAlign: 'right',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  bullet: {
    fontSize: 10,
    color: colors.darkGray,
    marginRight: 6,
  },
  achievementText: {
    flex: 1,
    fontSize: 9,
    color: colors.darkGray,
    lineHeight: 1.4,
  },
  descriptionText: {
    fontSize: 10,
    color: colors.darkGray,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  separator: {
    width: '100%',
    borderBottom: `1px solid ${colors.separatorGray}`,
    paddingTop: spacing.pagePadding / 2,
    marginBottom: spacing.pagePadding / 2,
  },
});

const ExperienceEntry = ({ experience, debug }: { experience: ExperienceItem; debug: boolean }) => {
  const { company, position, location, duration, description, achievements, name } =
    experience as any;

  return (
    <View style={styles.experienceEntry} debug={debug}>
      {/* Position title (bold, primary color) */}
      <Text style={styles.positionTitle}>{position || name.split(' - ')[1]}</Text>

      {/* Company, Location | Date Range row */}
      <View style={styles.companyDateRow}>
        <Text style={styles.companyLocation}>
          {company || name.split(' - ')[0]}, {location}
        </Text>
        <Text style={styles.dateRange}>{duration}</Text>
      </View>

      {/* Description (for independent projects) */}
      {description && <Text style={styles.descriptionText}>{description}</Text>}

      {/* Achievements bullets */}
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

const Experience = ({ resume, debug = false }: { resume: ResumeSchema; debug?: boolean }) => {
  const hasIndependentProjects = resume.independent_projects?.length > 0;
  const hasProfessionalExperience = resume.professional_experience?.length > 0;

  // Don't render if both are empty (should be caught by registry, but defensive check)
  if (!hasIndependentProjects && !hasProfessionalExperience) {
    return null;
  }

  return (
    <View style={styles.container} debug={debug}>
      <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
      <View style={styles.separator} />
      {/* Render professional experience first */}
      {hasProfessionalExperience &&
        resume.professional_experience.map((experience, index) => (
          <ExperienceEntry
            key={`${experience.company}-${experience.position}-${index}`}
            experience={experience}
            debug={debug}
          />
        ))}
      {/* Then render independent projects */}

      {hasIndependentProjects && (
        <>
          <Text style={styles.sectionTitle}>INDEPENDENT PROJECTS</Text>
          <View style={styles.separator} />

          {resume.independent_projects.map((experience, index) => (
            <ExperienceEntry
              key={`${experience.name}-${experience.location}-${index}`}
              experience={experience}
              debug={debug}
            />
          ))}
        </>
      )}
    </View>
  );
};

export default Experience;
