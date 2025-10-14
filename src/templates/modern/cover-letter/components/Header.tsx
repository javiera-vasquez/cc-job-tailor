import React from 'react';
import { Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { tokens } from '@template-core/design-tokens';
import type { CoverLetterSchema } from '@types';

const { colors, spacing } = tokens.modern;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.pagePadding / 2, // Reduced spacing to account for separator
    width: '100%',
  },
  separatorLine: {
    borderBottom: `1px solid ${colors.separatorGray}`,
    marginBottom: spacing.pagePadding / 2, // Space after separator
    width: '100%',
  },
  companyArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 9,
    fontFamily: 'Lato Bold',
    color: colors.darkGray,
  },
  contactArea: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  contactName: {
    fontSize: 9,
    fontFamily: 'Lato',
    lineHeight: 1.44,
    color: colors.darkGray,
  },
  contactDetails: {
    fontFamily: 'Lato',
    fontSize: 9,
    lineHeight: 1.44,
    color: colors.mediumGray,
  },
});

const Header = ({ data }: { data: CoverLetterSchema }) => (
  <View>
    <View style={styles.headerContainer}>
      <View style={styles.companyArea}>
        <Text style={styles.companyName}>{data.company}</Text>
      </View>

      <View style={styles.contactArea}>
        <Text style={styles.contactName}>{data.name}</Text>
        <Text style={styles.contactDetails}>{data.personal_info.address}</Text>
        <Text style={styles.contactDetails}>
          <Link style={styles.contactDetails} src={data.personal_info.email}>
            {data.personal_info.email}
          </Link>
        </Text>
        <Text style={styles.contactDetails}>{data.personal_info.phone}</Text>
      </View>
    </View>
    {/* Separator line to match mockup */}
    <View style={styles.separatorLine} />
  </View>
);

export default Header;
