import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

import data from '../../data/resume';
import { colors } from './constants';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
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
    fontSize: 7.8,
    lineHeight: 1.28,
    color: colors.primary,
  },
});

const Contact = () => {
  const { contact } = data.resume;
  
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
        <Text style={styles.contactText}>{contact.email}</Text>
      </View>
      
      {/* Address */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>{formattedAddress}</Text>
      </View>
      
      {/* LinkedIn */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>{linkedinDisplay}</Text>
      </View>
      
      {/* GitHub */}
      <View style={styles.contactItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.contactText}>{githubDisplay}</Text>
      </View>
    </View>
  );
};

export default Contact;