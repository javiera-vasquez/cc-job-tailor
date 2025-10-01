import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

// Import Tailwind CSS
import '@ui/styles/globals.css';

// Import shadcn/ui components
import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';
import { Card } from '@ui/components/ui/card';

// Import custom components
import { Sidebar } from '@ui/components/Sidebar';
import { WidgetType, type WidgetConfig } from '@ui/components/widgets/types';

import { resume, coverLetter } from '../';
import applicationData from '../data/application';

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
    className: 'space-y-4',
    data: {
      fields: [
        { label: 'Location', value: applicationData.metadata?.job_details.location || '' },
        { label: 'Experience Level', value: applicationData.metadata?.job_details.experience_level || '' },
        { label: 'Team Context', value: applicationData.metadata?.job_details.team_context || '' },
        { label: 'User Scale', value: applicationData.metadata?.job_details.user_scale || '' },
      ],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Primary Responsibilities',
    className: 'pb-3',
    data: {
      items: applicationData.job_analysis?.responsibilities.primary || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Secondary Responsibilities',
    className: 'pb-3',
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
    showSeparator: false,
    data: {
      badges: applicationData.job_analysis?.requirements.nice_to_have_skills || [],
    },
  },
];

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b border-border/40 px-6 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Job Tailor</h1>
          <Tabs value={activeDocument} onValueChange={(v) => setActiveDocument(v as 'resume' | 'cover-letter')}>
            <TabsList className="bg-transparent border-0">
              <TabsTrigger value="resume" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">Resume</TabsTrigger>
              <TabsTrigger value="cover-letter" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">Cover Letter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Two column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Metadata */}
        <Sidebar widgets={SIDEBAR_WIDGETS} />

        {/* Main content - PDF Viewer */}
        <main className="flex-1 p-6 pb-0">
          <Card className="h-full overflow-hidden border-border/40 shadow-sm rounded-b-none">
            {activeDocument === 'resume' ? (
              <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true} key={Date.now()}>
                <resume.Document data={applicationData} />
              </PDFViewer>
            ) : (
              <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true} key={Date.now()}>
                <coverLetter.Document data={applicationData} />
              </PDFViewer>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default App;
