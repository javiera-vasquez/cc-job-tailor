import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { colors, spacing } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const styles = StyleSheet.create({
  // Main header container
  headerContainer: {
    // height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.pagePadding / 1.5,
  },

  // Resume summary container
  summaryContainer: {
    width: '100%',
    paddingTop: spacing.pagePadding / 2,
    paddingBottom: spacing.pagePadding / 2,
    borderBottom: `1px solid ${colors.separatorGray}`,
    borderTop: `1px solid ${colors.separatorGray}`,
  },

  // Profile picture area (top-right corner)
  profileArea: {
    top: 0,
    right: 0,
    width: spacing.profileImageSize,
    height: spacing.profileImageSize,
    position: 'absolute',
  },

  profileImage: {
    width: spacing.profileImageSize,
    height: spacing.profileImageSize,
    borderRadius: spacing.profileImageSize / 2, // Circular crop
  },

  // Main content area (name, title, summary)
  contentArea: {
    flex: 1,
    paddingRight: spacing.profileImageSize + spacing.pagePadding,
  },

  // TODO: Add rules to claude.md that never use letterSpacing in the future
  // Typography styles following Figma specifications
  name: {
    color: colors.primary,
    fontSize: 22,
    fontFamily: 'Lato Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  position: {
    color: colors.mediumGray,
    fontSize: 14,
    fontFamily: 'Lato Bold',
    textTransform: 'capitalize',
    marginBottom: 0,
  },

  summary: {
    color: colors.darkGray,
    fontSize: 10,
    lineHeight: 1.4,
  },
});

const Header = ({ resume }: { resume: ResumeSchema }) => (
  <View>
    {/* Main header content */}
    <View style={styles.headerContainer}>
      {/* Content area with name, title, summary */}
      <View style={styles.contentArea}>
        <Text style={styles.name}>{resume.name}</Text>
        <Text style={styles.position}>{resume.title}</Text>
      </View>

      {/* Profile picture in top-right corner */}
      <View style={styles.profileArea}>
        <Image src={resume.profile_picture} style={styles.profileImage} />
      </View>
    </View>

    {/* Resume summary */}
    <View style={styles.summaryContainer}>
      <Text style={styles.summary}>{resume.summary}</Text>
    </View>
  </View>
);

export default Header;
