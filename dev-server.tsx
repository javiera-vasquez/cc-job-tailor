import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PDFViewer } from '@react-pdf/renderer';

// Import Tailwind CSS
import '@ui/styles/globals.css';

// Import shadcn/ui components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/components/ui/tabs';
import { Card } from '@ui/components/ui/card';
import { Button } from '@ui/components/ui/button';

import { resume, coverLetter } from './src';
import applicationData from './src/data/application';

const App = () => {
  const [activeDocument, setActiveDocument] = useState<'resume' | 'cover-letter'>('resume');

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <header className="border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resume Manager</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Document selector with shadcn/ui Tabs */}
      <Tabs
        value={activeDocument}
        onValueChange={(v) => setActiveDocument(v as 'resume' | 'cover-letter')}
        className="flex-1 p-4"
      >
        <TabsList>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-4 h-[calc(100vh-12rem)]">
          <Card className="h-full overflow-hidden">
            {/* Fix issue reported on https://github.com/diegomura/react-pdf/issues/3153#issuecomment-2845169485 for react-reconsiler v0.31 */}
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true} key={Date.now()}>
              <resume.Document data={applicationData} />
            </PDFViewer>
          </Card>
        </TabsContent>

        <TabsContent value="cover-letter" className="mt-4 h-[calc(100vh-12rem)]">
          <Card className="h-full overflow-hidden">
            <PDFViewer style={{ width: '100%', height: '100%' }} showToolbar={true} key={Date.now()}>
              <coverLetter.Document data={applicationData} />
            </PDFViewer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
