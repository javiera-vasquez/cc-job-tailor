import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography } from '../design-tokens';
import type { CoverLetterSchema, ContactDetails } from '../../types';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20, // Reduced spacing to account for separator
    width: '100%',
  },
  separatorLine: {
    borderBottom: `1px solid ${colors.separatorGray}`,
    marginBottom: 24, // Space after separator
    width: '100%',
  },
  companyArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Lato Bold',
    color: colors.primary,
  },
  contactArea: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  contactName: {
    fontSize: 12,
    fontFamily: 'Lato Bold',
    color: colors.primary,
    marginBottom: 2,
  },
  contactDetails: {
    fontSize: 10,
    fontFamily: 'Lato',
    color: colors.darkGray,
    marginBottom: 1,
  },
});

interface HeaderProps {
  coverLetter: CoverLetterSchema;
  personalInfo: ContactDetails & { name?: string };
}

const Header = ({ coverLetter, personalInfo }: HeaderProps) => (
  <View>
    <View style={styles.headerContainer}>
      <View style={styles.companyArea}>
        <Text style={styles.companyName}>{coverLetter.company}</Text>
      </View>

      <View style={styles.contactArea}>
        <Text style={styles.contactName}>{personalInfo?.name || 'Javiera Vasquez'}</Text>
        <Text style={styles.contactDetails}>{personalInfo?.address || 'Eisenstraße 61'}</Text>
        <Text style={styles.contactDetails}>{'12059 Berlin'}</Text>
        <Text style={styles.contactDetails}>{personalInfo?.email || 'javiera.vasq@gmail.com'}</Text>
        <Text style={styles.contactDetails}>{personalInfo?.phone || '015901070292'}</Text>
      </View>
    </View>
    {/* Separator line to match mockup */}
    <View style={styles.separatorLine} />
  </View>
);

export default Header;