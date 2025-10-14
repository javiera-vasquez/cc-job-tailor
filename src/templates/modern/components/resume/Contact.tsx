import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';

import { tokens } from '@template-core/design-tokens';
import type { ResumeSchema } from '@types';

const { colors, spacing } = tokens.modern;

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

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact</Text>

      {/* Phone - Required, always show */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>{contact.phone}</Text>
      </View>

      {/* Email - Required, always show */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>
          <Link style={styles.contactText} src={`mailto:${contact.email}`}>
            {contact.email}
          </Link>
        </Text>
      </View>

      {/* Address - Optional */}
      {contact.address && (
        <View style={styles.contactItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.contactText}>{contact.address}</Text>
        </View>
      )}

      {/* LinkedIn - Optional */}
      {contact.linkedin && (
        <View style={styles.contactItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.contactText}>
            <Link style={styles.contactText} src={contact.linkedin}>
              LinkedIn Profile
            </Link>
          </Text>
        </View>
      )}

      {/* GitHub - Optional */}
      {contact.github && (
        <View style={styles.contactItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.contactText}>
            <Link style={styles.contactText} src={contact.github}>
              Github Profile
            </Link>
          </Text>
        </View>
      )}
    </View>
  );
};

export default Contact;
