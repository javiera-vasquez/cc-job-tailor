import { Font } from "@react-pdf/renderer";

export const registerFonts = () => {
  // OPEN SANS REGISTRATION
  Font.register({
    family: 'Open Sans',
    src: `https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf`,
  });
  
  Font.register({
    family: 'Open Sans Light',
    fontStyle: 'normal',
    fontWeight: 'light',
    src: `https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0a.ttf`,
  });

  Font.register({
    family: 'Open Sans Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    src: `https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0b.ttf`,
  }); 

  Font.register({
    family: 'Open Sans Italic',
    fontStyle: 'italic',
    src: `https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf`,
  });

  // LATO REGISTRATION
  Font.register({
    family: 'Lato',
    fontStyle: 'normal',
    src: `https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wWw.ttf`,
  });

  Font.register({
    family: 'Lato Italic',
    fontStyle: 'italic',
    src: `https://fonts.gstatic.com/s/lato/v16/S6u8w4BMUTPHjxsAXC-v.ttf`,
  });

  Font.register({
    family: 'Lato Light',
    fontStyle: 'normal',
    fontWeight: 'light',
    src: `https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh50XSwiPHA.ttf`,
  });

  Font.register({
    family: 'Lato semibold',
    fontStyle: 'normal',
    fontWeight: 'semibold',
    src: `https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6MYrmSPY4.ttf`,
  });

  Font.register({
    family: 'Lato Bold',
    fontStyle: 'normal',
    fontWeight: 'bold',
    src: `https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPHA.ttf`,
  });

  Font.register({
    family: 'Lato Italic',
    fontStyle: 'italic',
    src: `https://fonts.gstatic.com/s/lato/v16/S6u8w4BMUTPHjxsAXC-v.ttf`,
  });
};