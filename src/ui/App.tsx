import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

// Import Tailwind CSS
import '@ui/styles/globals.css';

// Import shadcn/ui components
import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card';

import { resume, coverLetter } from '../';
import applicationData from '../data/application';

console.log('Application Data', applicationData);

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resume Manager</h1>
          <Tabs value={activeDocument} onValueChange={(v) => setActiveDocument(v as 'resume' | 'cover-letter')}>
            <TabsList>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Two column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Metadata */}
        <aside className="w-80 border-r overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Company</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{applicationData.metadata.company}</p>
              <p className="text-sm text-muted-foreground mt-1">{applicationData.metadata.position}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Job Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{applicationData.metadata.job_summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Must Have Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {applicationData.job_analysis.requirements.must_have_skills.map((skill, i) => (
                  <li key={i} className="text-muted-foreground">• {skill.skill}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Nice to Have</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {applicationData.job_analysis.requirements.nice_to_have_skills.map((skill, i) => (
                  <li key={i} className="text-muted-foreground">• {skill.skill}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm">{applicationData.metadata.job_details.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experience Level</p>
                <p className="text-sm">{applicationData.metadata.job_details.experience_level}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Team Context</p>
                <p className="text-sm">{applicationData.metadata.job_details.team_context}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">User Scale</p>
                <p className="text-sm">{applicationData.metadata.job_details.user_scale}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Primary Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {applicationData.job_analysis.responsibilities.primary.map((resp, i) => (
                  <li key={i} className="text-muted-foreground">• {resp}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Secondary Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">
                {applicationData.job_analysis.responsibilities.secondary.map((resp, i) => (
                  <li key={i} className="text-muted-foreground">• {resp}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* Main content - PDF Viewer */}
        <main className="flex-1 p-4">
          <Card className="h-full overflow-hidden">
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
