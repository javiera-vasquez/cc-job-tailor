import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PDFViewer } from '@react-pdf/renderer';
import { Buffer } from 'buffer';

// Polyfill Buffer for react-pdf in browser environment
globalThis.Buffer = Buffer;

import { resume, coverLetter } from './src';

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Document selector */}
      <div style={{
        padding: '10px',
        // backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setActiveDocument('resume')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeDocument === 'resume' ? '#3b82f6' : '#e5e7eb',
            color: activeDocument === 'resume' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Resume
        </button>
        <button
          onClick={() => setActiveDocument('cover-letter')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeDocument === 'cover-letter' ? '#3b82f6' : '#e5e7eb',
            color: activeDocument === 'cover-letter' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cover Letter
        </button>
      </div>

      {/* Fix issue reported on https://github.com/diegomura/react-pdf/issues/3153#issuecomment-2845169485 for react-reconsiler v0.31 */}
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={true} key={Date.now()}>
        {activeDocument === 'resume' ? <resume.Document /> : <coverLetter.Document />}
      </PDFViewer>
    </div>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
