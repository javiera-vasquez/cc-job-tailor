import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@ui/components/ui/tabs';

interface HeaderProps {
  activeDocument: 'resume' | 'cover-letter';
  onDocumentChange: (document: 'resume' | 'cover-letter') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeDocument, onDocumentChange }) => {
  return (
    <header className="border-b border-border/40 px-6 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Job Tailor</h1>
        <Tabs value={activeDocument} onValueChange={(v) => onDocumentChange(v as 'resume' | 'cover-letter')}>
          <TabsList className="bg-transparent border-0">
            <TabsTrigger value="resume" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">Resume</TabsTrigger>
            <TabsTrigger value="cover-letter" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">Cover Letter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};
