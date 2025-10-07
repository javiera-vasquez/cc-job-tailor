import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';

import { colors, spacing } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: spacing.pagePadding / 2,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: spacing.pagePadding / 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.listItemSpacing,
  },
  bullet: {
    width: 8,
    fontSize: 4,
    fontFamily: 'Lato',
    color: colors.primary,
    paddingTop: 2,
  },
  contactText: {
    flex: 1,
    fontFamily: 'Lato',
    fontSize: 8,
    lineHeight: 1.33,
    color: colors.primary,
  },
});

const Contact = ({ resume }: { resume: ResumeSchema }) => {
  const { contact } = resume;

  // Format address for display
  const formattedAddress = contact.address;

  // Extract display text for LinkedIn and GitHub
  const linkedinDisplay = 'LinkedIn Profile';
  const githubDisplay = 'Github Profile';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact</Text>

      {/* Phone */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>{contact.phone}</Text>
      </View>

      {/* Email */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>
          <Link style={styles.contactText} src={`mailto:${contact.email}`}>
            {contact.email}
          </Link>
        </Text>
      </View>

      {/* Address */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>{formattedAddress}</Text>
      </View>

      {/* LinkedIn */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>
          <Link style={styles.contactText} src={contact.linkedin}>
            {linkedinDisplay}
          </Link>
        </Text>
      </View>

      {/* GitHub */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>
          <Link style={styles.contactText} src={contact.github}>
            {githubDisplay}
          </Link>
        </Text>
      </View>
    </View>
  );
};

export default Contact;
