import { test, expect, describe } from 'bun:test';
import React from 'react';
import { WithPDFWrapper, type DocumentConfig } from '../../src/templates/with-pdf-wrapper';
import type { ResumeSchema, CoverLetterSchema } from '../../src/types';
import { createValidApplicationData } from '../helpers/test-utils';

describe('WithPDFWrapper Component', () => {
  describe('Empty State Handling', () => {
    test('renders empty state when no data provided', () => {
      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: `Resume - ${data.name}`,
        }),
        emptyStateMessage: 'No resume data available',
      };

      const component = WithPDFWrapper({
        data: undefined,
        config,
        children: (data) => React.createElement('div', null, data.name),
      });

      expect(component).toBeDefined();
      expect(component.props).toBeDefined();
      expect(component.props.title).toBe('No Data Available');
    });

    test('renders empty state with custom message', () => {
      const customMessage = 'Please generate resume data first';
      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: 'Resume',
        }),
        emptyStateMessage: customMessage,
      };

      const component = WithPDFWrapper({
        data: undefined,
        config,
        children: (data) => React.createElement('div', null, data.name),
      });

      // The empty state should use the custom message
      expect(component.props.title).toBe('No Data Available');
    });

    test('renders empty state when null data provided', () => {
      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: 'Resume',
        }),
        emptyStateMessage: 'No data',
      };

      const component = WithPDFWrapper({
        data: null as any,
        config,
        children: (data) => React.createElement('div', null, data.name),
      });

      expect(component).toBeDefined();
      expect(component.props.title).toBe('No Data Available');
    });
  });

  describe('Document Metadata Generation', () => {
    test('generates correct document props from resume data', () => {
      const validData = createValidApplicationData();
      const resumeData = validData.resume!;

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: `Resume for ${data.title}`,
          title: `Resume - ${data.name}`,
        }),
        emptyStateMessage: 'No resume data',
      };

      const component = WithPDFWrapper({
        data: resumeData,
        config,
        children: (data) => React.createElement('div', null, data.name),
      });

      expect(component.props.author).toBe(resumeData.name);
      expect(component.props.subject).toBe(`Resume for ${resumeData.title}`);
      expect(component.props.title).toBe(`Resume - ${resumeData.name}`);
    });

    test('generates document props with minimal data', () => {
      const minimalData: ResumeSchema = {
        name: 'Test User',
        profile_picture: 'pic.jpg',
        title: 'Engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['JavaScript'] }],
        skills: ['JavaScript'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        emptyStateMessage: 'No data',
      };

      const component = WithPDFWrapper({
        data: minimalData,
        config,
        children: (data) => React.createElement('div', null, data.name),
      });

      expect(component.props.author).toBe('Test User');
      expect(component.props.subject).toBe('Resume');
      expect(component.props.title).toBe('Test User');
    });
  });

  describe('Data Transformation', () => {
    test('transforms data when transformData function provided', () => {
      const originalData: ResumeSchema = {
        name: 'john doe',
        profile_picture: 'pic.jpg',
        title: 'engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['JavaScript'] }],
        skills: ['JavaScript'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      let transformedDataReceived: ResumeSchema | null = null;

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        transformData: (data: ResumeSchema) => {
          // Transform name and title to uppercase
          return {
            ...data,
            name: data.name.toUpperCase(),
            title: data.title.toUpperCase(),
          };
        },
        emptyStateMessage: 'No data',
      };

      WithPDFWrapper({
        data: originalData,
        config,
        children: (data) => {
          transformedDataReceived = data;
          return React.createElement('div', null, data.name);
        },
      });

      expect(transformedDataReceived).not.toBeNull();
      expect(transformedDataReceived!.name).toBe('JOHN DOE');
      expect(transformedDataReceived!.title).toBe('ENGINEER');
    });

    test('uses original data when no transformData function provided', () => {
      const originalData: ResumeSchema = {
        name: 'Original Name',
        profile_picture: 'pic.jpg',
        title: 'Engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['JavaScript'] }],
        skills: ['JavaScript'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      let receivedData: ResumeSchema | null = null;

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        emptyStateMessage: 'No data',
      };

      WithPDFWrapper({
        data: originalData,
        config,
        children: (data) => {
          receivedData = data;
          return React.createElement('div', null, data.name);
        },
      });

      expect(receivedData).toEqual(originalData);
    });

    test('transforms complex nested data structures', () => {
      const originalData: ResumeSchema = {
        name: 'Test User',
        profile_picture: 'pic.jpg',
        title: 'Engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [
          { resume_title: 'Frontend', skills: ['React', 'TypeScript'] },
          { resume_title: 'Backend', skills: ['Node.js', 'Python'] },
        ],
        skills: ['JavaScript', 'Python'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company A',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps', 'Led team'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      let transformedData: ResumeSchema | null = null;

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        transformData: (data: ResumeSchema) => {
          // Filter technical expertise to only include Frontend
          return {
            ...data,
            technical_expertise: data.technical_expertise.filter(
              (exp) => exp.resume_title === 'Frontend',
            ),
          };
        },
        emptyStateMessage: 'No data',
      };

      WithPDFWrapper({
        data: originalData,
        config,
        children: (data) => {
          transformedData = data;
          return React.createElement('div', null, data.name);
        },
      });

      expect(transformedData).not.toBeNull();
      expect(transformedData!.technical_expertise).toHaveLength(1);
      expect(transformedData!.technical_expertise[0].resume_title).toBe('Frontend');
    });
  });

  describe('Render Prop Pattern', () => {
    test('calls children function with transformed data', () => {
      const resumeData: ResumeSchema = {
        name: 'Test User',
        profile_picture: 'pic.jpg',
        title: 'Engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['JavaScript'] }],
        skills: ['JavaScript'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      let childrenCalled = false;
      let dataReceived: ResumeSchema | null = null;

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        emptyStateMessage: 'No data',
      };

      WithPDFWrapper({
        data: resumeData,
        config,
        children: (data) => {
          childrenCalled = true;
          dataReceived = data;
          return React.createElement('div', null, data.name);
        },
      });

      expect(childrenCalled).toBe(true);
      expect(dataReceived).toEqual(resumeData);
    });

    test('renders children component inside Document', () => {
      const resumeData: ResumeSchema = {
        name: 'Test User',
        profile_picture: 'pic.jpg',
        title: 'Engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['JavaScript'] }],
        skills: ['JavaScript'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        emptyStateMessage: 'No data',
      };

      const component = WithPDFWrapper({
        data: resumeData,
        config,
        children: (data) => React.createElement('Page', null, data.name),
      });

      expect(component).toBeDefined();
      expect(component.props.author).toBe('Test User');
      expect(component.props.children).toBeDefined();
    });
  });

  describe('Cover Letter Data Handling', () => {
    test('handles cover letter data correctly', () => {
      const coverLetterData: CoverLetterSchema = {
        company: 'Test Company',
        position: 'Software Engineer',
        job_focus: [
          {
            primary_area: 'engineer',
            specialties: ['react', 'typescript'],
            weight: 1.0,
          },
        ],
        primary_focus: 'Frontend Development',
        date: '2024-01-01',
        personal_info: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Test Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        content: {
          letter_title: 'Application for Software Engineer',
          opening_line: 'I am writing to apply...',
          body: ['First paragraph', 'Second paragraph'],
          signature: 'Sincerely, Test User',
        },
      };

      const config: DocumentConfig<CoverLetterSchema> = {
        getDocumentProps: (data) => ({
          author: data.personal_info.email,
          subject: `Cover Letter - ${data.position}`,
          title: `Cover Letter for ${data.company}`,
        }),
        emptyStateMessage: 'No cover letter data',
      };

      const component = WithPDFWrapper({
        data: coverLetterData,
        config,
        children: (data) => React.createElement('div', null, data.company),
      });

      expect(component.props.author).toBe('test@example.com');
      expect(component.props.subject).toBe('Cover Letter - Software Engineer');
      expect(component.props.title).toBe('Cover Letter for Test Company');
    });

    test('renders empty state for missing cover letter data', () => {
      const config: DocumentConfig<CoverLetterSchema> = {
        getDocumentProps: (data) => ({
          author: data.personal_info.email,
          subject: 'Cover Letter',
          title: 'Cover Letter',
        }),
        emptyStateMessage: 'No cover letter data available. Please tailor for a company first.',
      };

      const component = WithPDFWrapper({
        data: undefined,
        config,
        children: (data) => React.createElement('div', null, data.company),
      });

      expect(component.props.title).toBe('No Data Available');
    });
  });

  describe('Edge Cases', () => {
    test('handles data with special characters', () => {
      const dataWithSpecialChars: ResumeSchema = {
        name: "O'Brien-Smith",
        profile_picture: 'pic.jpg',
        title: 'Engineer & Developer',
        summary: 'Summary with "quotes" and special chars: @#$%',
        contact: {
          phone: '+1234567890',
          email: 'test+special@example.com',
          address: '123 St. Mary\'s Avenue',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['C++', 'C#'] }],
        skills: ['C++'],
        languages: [{ language: 'English', proficiency: 'Native' }],
        professional_experience: [
          {
            company: 'Company & Co.',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [
          {
            name: 'Project',
            description: 'Description',
            location: 'Remote',
            duration: '2024',
            achievements: ['Completed'],
          },
        ],
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: data.title,
          title: `Resume - ${data.name}`,
        }),
        emptyStateMessage: 'No data',
      };

      const component = WithPDFWrapper({
        data: dataWithSpecialChars,
        config,
        children: (data) => React.createElement('div', null, data.name),
      });

      expect(component.props.author).toBe("O'Brien-Smith");
      expect(component.props.subject).toBe('Engineer & Developer');
    });

    test('handles data with empty arrays', () => {
      const dataWithEmptyArrays: ResumeSchema = {
        name: 'Test User',
        profile_picture: 'pic.jpg',
        title: 'Engineer',
        summary: 'Summary',
        contact: {
          phone: '+1234567890',
          email: 'test@example.com',
          address: 'Address',
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
        },
        technical_expertise: [{ resume_title: 'Skills', skills: ['JavaScript'] }],
        skills: [], // Empty array
        languages: [], // Empty array
        professional_experience: [
          {
            company: 'Company',
            position: 'Developer',
            location: 'Remote',
            duration: '2023-2024',
            company_description: 'Tech company',
            linkedin: null,
            achievements: ['Built apps'],
          },
        ],
        independent_projects: [], // Empty array
        education: [
          {
            institution: 'University',
            program: 'CS',
            location: 'City',
            duration: '2020-2024',
          },
        ],
      };

      let receivedData: ResumeSchema | null = null;

      const config: DocumentConfig<ResumeSchema> = {
        getDocumentProps: (data) => ({
          author: data.name,
          subject: 'Resume',
          title: data.name,
        }),
        emptyStateMessage: 'No data',
      };

      WithPDFWrapper({
        data: dataWithEmptyArrays,
        config,
        children: (data) => {
          receivedData = data;
          return React.createElement('div', null, data.name);
        },
      });

      expect(receivedData).not.toBeNull();
      expect(receivedData!.skills).toEqual([]);
      expect(receivedData!.languages).toEqual([]);
      expect(receivedData!.independent_projects).toEqual([]);
    });
  });
});
