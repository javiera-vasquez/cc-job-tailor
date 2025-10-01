import React from 'react';
import { Badge } from '@ui/components/ui/badge';
import { Separator } from '@ui/components/ui/separator';
import {
  WidgetType,
  type WidgetData,
  type HeaderWidgetData,
  type TextWidgetData,
  type KeyValueWidgetData,
  type ListWidgetData,
  type BadgeGroupWidgetData,
} from './types';

interface SidebarWidgetProps {
  type: WidgetType;
  title?: string;
  data: WidgetData;
  showSeparator?: boolean;
  className?: string;
}

export const SidebarWidget: React.FC<SidebarWidgetProps> = ({
  type,
  title,
  data,
  showSeparator = true,
  className = '',
}) => {
  const renderContent = () => {
    switch (type) {
      case WidgetType.HEADER: {
        const headerData = data as HeaderWidgetData;
        return (
          <div>
            <p className="font-medium text-sm text-foreground opacity-95">{headerData.primary}</p>
            <p className="text-xs text-foreground opacity-60 mt-1">{headerData.secondary}</p>
          </div>
        );
      }

      case WidgetType.TEXT: {
        const textData = data as TextWidgetData;
        return <p className="text-xs text-foreground opacity-80 leading-relaxed">{textData.content}</p>;
      }

      case WidgetType.KEY_VALUE: {
        const keyValueData = data as KeyValueWidgetData;
        return (
          <div className="space-y-3">
            {keyValueData.fields.map((field, i) => (
              <div key={i}>
                <p className="text-xs text-foreground opacity-50 mb-0.5">{field.label}</p>
                <p className="text-xs text-foreground opacity-90">{field.value}</p>
              </div>
            ))}
          </div>
        );
      }

      case WidgetType.LIST: {
        const listData = data as ListWidgetData;
        return (
          <ul className="space-y-2">
            {listData.items.map((item, i) => (
              <li
                key={i}
                className="text-xs text-foreground opacity-80 pl-3 border-l-2 border-border opacity-30 leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        );
      }

      case WidgetType.BADGE_GROUP: {
        const badgeData = data as BadgeGroupWidgetData;
        return (
          <div className="flex flex-wrap gap-1.5">
            {badgeData.badges.map((badge, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal px-2 py-0.5 text-foreground opacity-80">
                {badge.skill}
              </Badge>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {title && (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground opacity-60">{title}</h2>
        )}
        {renderContent()}
      </div>
      {showSeparator && <Separator className="bg-neutral-700" />}
    </>
  );
};
