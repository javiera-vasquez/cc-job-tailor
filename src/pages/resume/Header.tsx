import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import data from "../../data/resume";
import { colors } from './constants';

const styles = StyleSheet.create({
  // Top separator line
  topSeparator: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderColor: colors.separatorGray,
    marginBottom: 20,
  },
  
  // Main header container
  headerContainer: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  // Resume summary container
  summaryContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderColor: colors.separatorGray,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.separatorGray,
    
  },
  
  // Profile picture area (top-right corner)
  profileArea: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular crop
  },

  // Main content area (name, title, summary)
  contentArea: {
    flex: 1,
    paddingRight: 62,
  },

  // Typography styles following Figma specifications
  name: {
    fontSize: 20,
    fontFamily: 'Lato Bold',
    // letterSpacing: '0.390625%',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  
  title: {
    fontSize: 14,
    fontFamily: 'Lato Bold',
    // letterSpacing: '2.83203125%',
    color: colors.mediumGray,
    marginBottom: 4,
  },
  
  summary: {
    fontSize: 9,
    fontFamily: 'Lato',
    lineHeight: 1.65,
    // letterSpacing: '-2.63671875%',
    color: colors.darkGray,
    textAlign: 'left',
  },
  
  // Bottom separator line
  bottomSeparator: {
    borderBottom: `0.75px solid ${colors.separatorGray}`,
    marginTop: 20,
  },
});

const IMAGE_SRC =
  'https://i.guim.co.uk/img/media/a23aeb1f7ff20bb80f68852da17743b0e557f8ed/0_224_3504_2102/master/3504.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=9e9a99e479ee60270b69ede4d869b20f';

const Header = () => (
  <View>    
    {/* Main header content */}
    <View style={styles.headerContainer}>
      {/* Content area with name, title, summary */}
      <View style={styles.contentArea}>
        <Text style={styles.name}>{data.resume.name}</Text>
        <Text style={styles.title}>{data.resume.title}</Text>
      </View>
      
      {/* Profile picture in top-right corner */}
      <View style={styles.profileArea}>
        {/* <Image src={'./public/images/avatar.jpg'} style={styles.profileImage} /> */}
        <Image src={IMAGE_SRC} style={styles.profileImage}/>
      </View>
    </View>
    
    {/* Resume summary */}
    <View style={styles.summaryContainer}>
      <Text style={styles.summary}>{data.resume.summary}</Text>
    </View>
  </View>
);

export default Header;
