import React from 'react';
import { createRoot } from 'react-dom/client';
import { PDFViewer } from '@react-pdf/renderer';
import { DocumentWrapper } from './index';

const App = () => {
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }} showToolbar={true}>
      <DocumentWrapper />
    </PDFViewer>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
