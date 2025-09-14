import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { resume } from './src';
import path from 'path';

const generatePdf = async () => {
  const component = React.createElement(resume.Document);
  const filePath = path.join(__dirname, 'tmp', 'resume.pdf');
  
  console.log(`Generating PDF at ${filePath}`);
  
  await renderToFile(component, filePath);
  
  console.log('PDF generated successfully');
};

generatePdf();