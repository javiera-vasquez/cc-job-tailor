import React, { useState, useEffect, useMemo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { Card } from '@ui/components/ui/card';

// Import custom components
import { Header } from '@ui/components/Header';
import { Sidebar } from '@ui/components/Sidebar';
import { getSidebarWidgets } from './lib/getSidebarWidgets';

import { themes, type ThemeName } from '../templates';
import applicationData from '../data/application';

import '@ui/styles/globals.css';

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');
  // Initialize theme from metadata.active_template, fallback to 'modern'
  const [activeTheme, setActiveTheme] = useState<ThemeName>(
    (applicationData.metadata.active_template as ThemeName) || 'modern',
  );
  const SIDEBAR_WIDGETS = useMemo(
    () => getSidebarWidgets(applicationData.metadata, applicationData.job_analysis),
    [applicationData.metadata, applicationData.job_analysis],
  );

  // Sync activeTheme with applicationData.metadata.active_template
  useEffect(() => {
    const metadataTheme = applicationData.metadata.active_template as ThemeName;
    if (metadataTheme && metadataTheme !== activeTheme) {
      setActiveTheme(metadataTheme);
    }
  }, [applicationData.metadata.active_template]);

  const theme = themes[activeTheme];
  const ResumeComponent = theme?.components.resume;
  const CoverLetterComponent = theme?.components.coverLetter;

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <Header activeDocument={activeDocument} onDocumentChange={setActiveDocument} />

      {/* Two column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Metadata */}
        <Sidebar widgets={SIDEBAR_WIDGETS} />

        {/* Main content - PDF Viewer */}
        <main className="flex-1 p-3 pb-0">
          <Card className="h-full overflow-hidden border-border/40 shadow-sm rounded-b-none">
            {activeDocument === 'resume' ? (
              <PDFViewer
                style={{ width: '100%', height: '100%' }}
                showToolbar={true}
                key={`${Date.now()}-${activeTheme}-${activeDocument}`}
              >
                {ResumeComponent && <ResumeComponent data={applicationData.resume} />}
              </PDFViewer>
            ) : (
              <PDFViewer
                style={{ width: '100%', height: '100%' }}
                showToolbar={true}
                key={`${Date.now()}-${activeTheme}-${activeDocument}`}
              >
                {CoverLetterComponent && (
                  <CoverLetterComponent data={applicationData.cover_letter} />
                )}
              </PDFViewer>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default App;
