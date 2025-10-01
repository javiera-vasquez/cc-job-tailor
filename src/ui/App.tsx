import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

// Import Tailwind CSS
import '@ui/styles/globals.css';

// Import shadcn/ui components
import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';
import { Card } from '@ui/components/ui/card';
import { Badge } from '@ui/components/ui/badge';
import { Separator } from '@ui/components/ui/separator';

import { resume, coverLetter } from '../';
import applicationData from '../data/application';

console.log('Application Data', applicationData);

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b border-border/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Resume Manager</h1>
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
        <aside className="w-76 border-r border-border/40 bg-muted/20 overflow-y-auto px-6 py-6 space-y-8">
          {/* Company */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Company</h2>
            <div>
              <p className="font-medium text-sm">{applicationData.metadata.company}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{applicationData.metadata.position}</p>
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Job Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Summary</h2>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">{applicationData.metadata.job_summary}</p>
          </div>

          <Separator className="bg-border/30" />

          {/* Skills */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Must Have Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {applicationData.job_analysis.requirements.must_have_skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-normal px-2 py-0.5 bg-muted/60 hover:bg-muted transition-colors">
                  {skill.skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Nice to Have</h2>
            <div className="flex flex-wrap gap-1.5">
              {applicationData.job_analysis.requirements.nice_to_have_skills.map((skill, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal px-2 py-0.5 border-border/40 hover:bg-accent/5 transition-colors">
                  {skill.skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Job Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground/50 mb-0.5">Location</p>
                <p className="text-xs text-muted-foreground/80">{applicationData.metadata.job_details.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/50 mb-0.5">Experience Level</p>
                <p className="text-xs text-muted-foreground/80">{applicationData.metadata.job_details.experience_level}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/50 mb-0.5">Team Context</p>
                <p className="text-xs text-muted-foreground/80">{applicationData.metadata.job_details.team_context}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/50 mb-0.5">User Scale</p>
                <p className="text-xs text-muted-foreground/80">{applicationData.metadata.job_details.user_scale}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Responsibilities */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Primary Responsibilities</h2>
            <ul className="space-y-2">
              {applicationData.job_analysis.responsibilities.primary.map((resp, i) => (
                <li key={i} className="text-xs text-muted-foreground/70 pl-3 border-l-2 border-border/30 leading-relaxed">
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Secondary Responsibilities</h2>
            <ul className="space-y-2">
              {applicationData.job_analysis.responsibilities.secondary.map((resp, i) => (
                <li key={i} className="text-xs text-muted-foreground/70 pl-3 border-l-2 border-border/30 leading-relaxed">
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content - PDF Viewer */}
        <main className="flex-1 p-6">
          <Card className="h-full overflow-hidden border-border/40 shadow-sm">
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
