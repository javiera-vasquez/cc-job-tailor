import React from 'react';
import { Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.classic;

const styles = StyleSheet.create({
  // Main header container
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.pagePadding / 2,
  },

  // Profile picture area (top-right corner)
  profileArea: {
    width: spacing.profileImageSize,
    height: spacing.profileImageSize,
    marginLeft: spacing.pagePadding,
  },

  profileImage: {
    width: spacing.profileImageSize,
    height: spacing.profileImageSize,
    // Square image - no borderRadius
  },

  // Main content area (name and contact info)
  contentArea: {
    flex: 1,
    flexDirection: 'column',
  },

  // Name styling
  name: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Lato Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  // Contact line styling
  contactLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 9,
    fontFamily: 'Lato',
    color: colors.darkGray,
  },

  contactItem: {
    marginRight: 4,
  },

  contactSeparator: {
    marginRight: 4,
  },

  contactLink: {
    color: colors.darkGray,
    textDecoration: 'none',
  },
});

const Header = ({ resume }: { resume: ResumeSchema }) => {
  const { name, contact } = resume;

  // Format contact info for inline display
  const contactItems = [
    contact.address,
    contact.phone,
    contact.email,
    'linkedin.com/in/username', // Display format for LinkedIn
  ];

  return (
    <View style={styles.headerContainer}>
      {/* Content area with name and contact */}
      <View style={styles.contentArea}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.contactLine}>
          <Text style={styles.contactItem}>{contact.address}</Text>
          <Text style={styles.contactSeparator}>|</Text>
          <Text style={styles.contactItem}>{contact.phone}</Text>
          <Text style={styles.contactSeparator}>|</Text>
          <Link src={`mailto:${contact.email}`} style={[styles.contactItem, styles.contactLink]}>
            {contact.email}
          </Link>
          <Text style={styles.contactSeparator}>|</Text>
          <Link src={contact.linkedin} style={[styles.contactItem, styles.contactLink]}>
            linkedin.com/in/username
          </Link>
        </View>
      </View>

      {/* Profile picture in top-right corner - only render if profileImageSize > 0 */}
      {spacing.profileImageSize > 0 && (
        <View style={styles.profileArea}>
          <Image src={resume.profile_picture} style={styles.profileImage} />
        </View>
      )}
    </View>
  );
};

export default Header;
