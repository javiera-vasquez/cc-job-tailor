import type { JobAnalysisSchema, MetadataSchema } from '@/types';
import { WidgetType, type WidgetConfig } from '@ui/components/widgets/types';

export const getSidebarWidgets = (
  metadata: MetadataSchema,
  jobAnalysis: JobAnalysisSchema,
): WidgetConfig[] => [
  {
    type: WidgetType.HEADER,
    title: 'Company',
    data: {
      primary: metadata.company || '',
      secondary: metadata.position || '',
    },
  },
  {
    type: WidgetType.TEXT,
    title: 'Summary',
    data: {
      content: metadata.job_summary || '',
    },
  },
  {
    type: WidgetType.KEY_VALUE,
    title: 'Details',
    data: {
      fields: [
        { label: 'Location', value: metadata.job_details.location || '' },
        {
          label: 'Experience Level',
          value: metadata.job_details.experience_level || '',
        },
        { label: 'Team Context', value: metadata.job_details.team_context || '' },
        { label: 'User Scale', value: metadata.job_details.user_scale || '' },
      ],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Primary Responsibilities',
    data: {
      items: jobAnalysis.responsibilities.primary || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Secondary Responsibilities',
    data: {
      items: jobAnalysis.responsibilities.secondary || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Must Have Skills',
    data: {
      badges: jobAnalysis.requirements.must_have_skills || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Nice to Have',
    data: {
      badges: jobAnalysis.requirements.nice_to_have_skills || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Soft Skills',
    data: {
      badges: jobAnalysis.requirements.soft_skills.map((skill) => ({ skill })) || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Key Role Context',
    data: {
      items: jobAnalysis.role_context.key_points || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Strong Matches',
    data: {
      items: jobAnalysis.candidate_alignment.strong_matches || [],
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
          value: jobAnalysis.application_info.posting_date || '',
        },
        { label: 'Deadline', value: jobAnalysis.application_info.deadline || '' },
        { label: 'Employment Type', value: jobAnalysis.employment_type || '' },
      ],
    },
  },
];
