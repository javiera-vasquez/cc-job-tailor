import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { Card } from '@ui/components/ui/card';

// Import custom components
import { Header } from '@ui/components/Header';
import { Sidebar } from '@ui/components/Sidebar';
import { WidgetType, type WidgetConfig } from '@ui/components/widgets/types';

import { themes, type ThemeName } from '../templates';
import applicationData from '../data/application';

import '@ui/styles/globals.css';

console.log('Application Data', applicationData);

const SIDEBAR_WIDGETS: WidgetConfig[] = [
  {
    type: WidgetType.HEADER,
    title: 'Company',
    data: {
      primary: applicationData.metadata?.company || '',
      secondary: applicationData.metadata?.position || '',
    },
  },
  {
    type: WidgetType.TEXT,
    title: 'Summary',
    data: {
      content: applicationData.metadata?.job_summary || '',
    },
  },
  {
    type: WidgetType.KEY_VALUE,
    title: 'Details',
    data: {
      fields: [
        { label: 'Location', value: applicationData.metadata?.job_details.location || '' },
        {
          label: 'Experience Level',
          value: applicationData.metadata?.job_details.experience_level || '',
        },
        { label: 'Team Context', value: applicationData.metadata?.job_details.team_context || '' },
        { label: 'User Scale', value: applicationData.metadata?.job_details.user_scale || '' },
      ],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Primary Responsibilities',
    data: {
      items: applicationData.job_analysis?.responsibilities.primary || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Secondary Responsibilities',
    data: {
      items: applicationData.job_analysis?.responsibilities.secondary || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Must Have Skills',
    data: {
      badges: applicationData.job_analysis?.requirements.must_have_skills || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Nice to Have',
    data: {
      badges: applicationData.job_analysis?.requirements.nice_to_have_skills || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Soft Skills',
    data: {
      badges:
        applicationData.job_analysis?.requirements.soft_skills.map((skill) => ({ skill })) || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Key Role Context',
    data: {
      items: applicationData.job_analysis?.role_context.key_points || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Strong Matches',
    data: {
      items: applicationData.job_analysis?.candidate_alignment.strong_matches || [],
    },
  },
  {
    type: WidgetType.KEY_VALUE,
    title: 'Application Info',
    showSeparator: false,
    data: {
      fields: [
        {
          label: 'Posting Date',
          value: applicationData.job_analysis?.application_info.posting_date || '',
        },
        { label: 'Deadline', value: applicationData.job_analysis?.application_info.deadline || '' },
        { label: 'Employment Type', value: applicationData.job_analysis?.employment_type || '' },
      ],
    },
  },
];

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');
  // Initialize theme from metadata.active_template, fallback to 'modern'
  const [activeTheme, setActiveTheme] = useState<ThemeName>(
    (applicationData.metadata?.active_template as ThemeName) || 'modern',
  );

  // Sync activeTheme with applicationData.metadata?.active_template
  useEffect(() => {
    const metadataTheme = applicationData.metadata?.active_template as ThemeName;
    if (metadataTheme && metadataTheme !== activeTheme) {
      setActiveTheme(metadataTheme);
    }
  }, [applicationData.metadata?.active_template]);

  const theme = themes[activeTheme];
  const ResumeComponent = theme?.components.resume;
  const CoverLetterComponent = theme?.components.coverLetter;

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <Header
        activeDocument={activeDocument}
        onDocumentChange={setActiveDocument}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
      />

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
                {ResumeComponent && <ResumeComponent data={applicationData.resume ?? undefined} />}
              </PDFViewer>
            ) : (
              <PDFViewer
                style={{ width: '100%', height: '100%' }}
                showToolbar={true}
                key={`${Date.now()}-${activeTheme}-${activeDocument}`}
              >
                {CoverLetterComponent && (
                  <CoverLetterComponent data={applicationData.cover_letter ?? undefined} />
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
