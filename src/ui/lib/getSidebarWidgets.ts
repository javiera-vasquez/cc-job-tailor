import type { ApplicationData } from '@/types';
import { WidgetType, type WidgetConfig } from '@ui/components/widgets/types';

export const getSidebarWidgets = (data: ApplicationData): WidgetConfig[] => [
  {
    type: WidgetType.HEADER,
    title: 'Company',
    data: {
      primary: data.metadata?.company || '',
      secondary: data.metadata?.position || '',
    },
  },
  {
    type: WidgetType.TEXT,
    title: 'Summary',
    data: {
      content: data.metadata?.job_summary || '',
    },
  },
  {
    type: WidgetType.KEY_VALUE,
    title: 'Details',
    data: {
      fields: [
        { label: 'Location', value: data.metadata?.job_details.location || '' },
        {
          label: 'Experience Level',
          value: data.metadata?.job_details.experience_level || '',
        },
        { label: 'Team Context', value: data.metadata?.job_details.team_context || '' },
        { label: 'User Scale', value: data.metadata?.job_details.user_scale || '' },
      ],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Primary Responsibilities',
    data: {
      items: data.job_analysis?.responsibilities.primary || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Secondary Responsibilities',
    data: {
      items: data.job_analysis?.responsibilities.secondary || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Must Have Skills',
    data: {
      badges: data.job_analysis?.requirements.must_have_skills || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Nice to Have',
    data: {
      badges: data.job_analysis?.requirements.nice_to_have_skills || [],
    },
  },
  {
    type: WidgetType.BADGE_GROUP,
    title: 'Soft Skills',
    data: {
      badges: data.job_analysis?.requirements.soft_skills.map((skill) => ({ skill })) || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Key Role Context',
    data: {
      items: data.job_analysis?.role_context.key_points || [],
    },
  },
  {
    type: WidgetType.LIST,
    title: 'Strong Matches',
    data: {
      items: data.job_analysis?.candidate_alignment.strong_matches || [],
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
          value: data.job_analysis?.application_info.posting_date || '',
        },
        { label: 'Deadline', value: data.job_analysis?.application_info.deadline || '' },
        { label: 'Employment Type', value: data.job_analysis?.employment_type || '' },
      ],
    },
  },
];
