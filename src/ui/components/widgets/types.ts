export enum WidgetType {
  HEADER = 'header',
  TEXT = 'text',
  KEY_VALUE = 'key-value',
  LIST = 'list',
  BADGE_GROUP = 'badge-group',
}

export interface HeaderWidgetData {
  primary: string;
  secondary: string;
}

export interface TextWidgetData {
  content: string;
}

export interface KeyValueWidgetData {
  fields: Array<{
    label: string;
    value: string;
  }>;
}

export interface ListWidgetData {
  items: string[];
}

export interface BadgeGroupWidgetData {
  badges: Array<{
    skill: string;
  }>;
}

export type WidgetData =
  | HeaderWidgetData
  | TextWidgetData
  | KeyValueWidgetData
  | ListWidgetData
  | BadgeGroupWidgetData;

export interface WidgetConfig {
  type: WidgetType;
  title?: string;
  data: WidgetData;
  showSeparator?: boolean;
  className?: string;
}
