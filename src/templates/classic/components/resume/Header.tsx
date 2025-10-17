import React from 'react';
import { Text, View, StyleSheet, Link, Image } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import { getElementVisibility } from '@template-core/section-utils';
import type { ResumeSchema, ResumeSectionConfig } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  // Outer container for profile picture positioning
  outerContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: spacing.pagePadding,
  },

  // Profile picture - absolute positioned top-right
  profileImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: spacing.profileImageSize,
    height: spacing.profileImageSize,
  },

  // Main header container - centered layout
  headerContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },

  // Name styling - larger, centered
  name: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: 'Lato Bold',
    textTransform: 'capitalize',
    marginBottom: 2,
  },

  // Subtitle/title styling
  subtitle: {
    color: colors.darkGray,
    fontSize: 10,
    fontFamily: 'Lato',
    marginBottom: 4,
  },

  // Contact line styling - centered
  contactLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 9,
    fontFamily: 'Lato',
    color: colors.darkGray,
    justifyContent: 'center',
  },

  contactItem: {
    marginHorizontal: 2,
  },

  contactSeparator: {
    marginHorizontal: 2,
  },

  contactLink: {
    color: colors.darkGray,
    textDecoration: 'none',
  },
});

const Header = ({ resume, section }: { resume: ResumeSchema; section?: ResumeSectionConfig }) => {
  const { name, title, contact } = resume;

  // Check element-level visibility for profile picture
  const showProfilePicture =
    section &&
    getElementVisibility(section, 'profile-picture', resume) &&
    spacing.profileImageSize > 0 &&
    resume.profile_picture;

  // Build contact items array to conditionally render separators
  const contactItems: React.ReactNode[] = [];

  // Email - required
  contactItems.push(
    <Link
      key="email"
      src={`mailto:${contact.email}`}
      style={[styles.contactItem, styles.contactLink]}
    >
      {contact.email}
    </Link>,
  );

  // Phone - required
  contactItems.push(
    <Text key="phone" style={styles.contactItem}>
      {contact.phone}
    </Text>,
  );

  // Address - optional
  if (contact.address) {
    contactItems.push(
      <Text key="address" style={styles.contactItem}>
        {contact.address}
      </Text>,
    );
  }

  // LinkedIn - optional
  if (contact.linkedin) {
    const linkedinDisplay = contact.linkedin.replace(/^https?:\/\/(www\.)?/, '');
    contactItems.push(
      <Link key="linkedin" src={contact.linkedin} style={[styles.contactItem, styles.contactLink]}>
        {linkedinDisplay}
      </Link>,
    );
  }

  // GitHub - optional
  if (contact.github) {
    const githubDisplay = contact.github.replace(/^https?:\/\/(www\.)?/, '');
    contactItems.push(
      <Link key="github" src={contact.github} style={[styles.contactItem, styles.contactLink]}>
        {githubDisplay}
      </Link>,
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Profile picture - top-right corner with element-level visibility */}
      {showProfilePicture && <Image src={resume.profile_picture} style={styles.profileImage} />}

      {/* Centered header content */}
      <View style={styles.headerContainer}>
        {/* Name - centered */}
        <Text style={styles.name}>{name}</Text>

        {/* Subtitle/Title - centered */}
        {title && <Text style={styles.subtitle}>{title}</Text>}

        {/* Contact line - centered */}
        <View style={styles.contactLine}>
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              {item}
              {index < contactItems.length - 1 && <Text style={styles.contactSeparator}>|</Text>}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Header;
