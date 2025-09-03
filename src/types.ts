export type Expertise = Record<string, {resume_title: string, skills: string[]}>;
export type Skills = Array<string>;
export type Language = Array<{language: string, proficiency: string}>;

export type ContactDetails = {
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  github: string;
}

export type ResumeSchema = {
  name: string;
  profile_picture: string;
  title: string;
  summary: string;
  contact: ContactDetails
  technical_expertise: Expertise
  skills: Skills
  languages: Language
}

export type Schemas = {
  resume: ResumeSchema
}