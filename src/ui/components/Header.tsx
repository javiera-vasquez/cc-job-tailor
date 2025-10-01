import React from 'react';
import { Button } from '@ui/components/ui/button';

interface HeaderProps {
  activeDocument: 'resume' | 'cover-letter';
  onDocumentChange: (document: 'resume' | 'cover-letter') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeDocument, onDocumentChange }) => {
  return (
    <header className="border-b border-border px-6 py-2">
      <div className="grid grid-cols-[300px_1fr] items-center">
        <h1 className="text-xl font-semibold tracking-tight ">Job Tailor</h1>
        <div className="flex justify-center gap-2">
          <Button
            variant={activeDocument === 'resume' ? 'default' : 'outline'}
            onClick={() => onDocumentChange('resume')}
          >
            Resume
          </Button>
          <Button
            variant={activeDocument === 'cover-letter' ? 'default' : 'outline'}
            onClick={() => onDocumentChange('cover-letter')}
          >
            Cover Letter
          </Button>
        </div>
      </div>
    </header>
  );
};
