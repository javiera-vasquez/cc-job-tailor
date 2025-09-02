import React from 'react';
import { renderToFile } from '@react-pdf/renderer';
import { DocumentWrapper } from './index.tsx';
import path from 'path';

const generatePdf = async () => {
  const component = React.createElement(DocumentWrapper);
  const filePath = path.join(__dirname, 'tmp', 'resume.pdf');
  
  console.log(`Generating PDF at ${filePath}`);
  
  await renderToFile(component, filePath);
  
  console.log('PDF generated successfully');
};

generatePdf();