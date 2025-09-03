export type Expertise =  {title: string, skills: string[]};
export type Skills = string;
export type Language = {language: string, proficiency: string};

export type ContactDetails = {
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  github: string;
}

export type ProfessionalExperience = {
  company: string;
  position: string, 
  location: string;
  duration: string;
  company_description: string;
  linkedin: string | null;
  achievements: string[];
}

export type ResumeSchema = {
  name: string;
  profile_picture: string;
  title: string;
  summary: string;
  contact: ContactDetails
  technical_expertise: Array<Expertise>
  skills: Array<Skills>
  languages: Array<Language> 
  professional_experience: Array<ProfessionalExperience>
  independent_projects: Array<ProfessionalExperience>
}

export type Schemas = {
  resume: ResumeSchema
}