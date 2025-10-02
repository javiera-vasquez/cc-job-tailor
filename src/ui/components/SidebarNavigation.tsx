import React, { type RefObject, useState } from 'react';
import { Button } from '@ui/components/ui/button';
import type { WidgetConfig } from '@ui/components/widgets/types';

interface SidebarNavigationProps {
  widgets: WidgetConfig[];
  activeSectionIndex: number;
  onNavigate: (index: number) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  widgets,
  activeSectionIndex,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeTitle = widgets[activeSectionIndex]?.title || 'Section 1';

  return (
    <nav className="sticky top-0 z-10  bg-background border-b border-border pb-2 mb-4 pt-2">
      <div className="w-full overflow-hidden sticky">
        {/* Toggle Button Header */}
        <div className='mx-4 bg-black border-round'> 
          <Button
            variant={'outline'}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-auto py-2 px-4 justify-between border-accent/20"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-primary/75 font-medium">Sections</span>
              <span className="text-sm font-medium truncate text-foreground/75">{activeTitle}</span>
            </div>
            <span className={`text-[10px] opacity-75 transition-transform ml-2 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </Button>
        </div>

        {/* Expandable Widget List */}
        {isExpanded && (
          <div className="mx-4">
            <div className="space-y-1 p-2">
              {widgets.map((widget, index) => {
                const title = widget.title || `Section ${index + 1}`;

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onNavigate(index);
                      setIsExpanded(false);
                    }}
                    className="w-full justify-start text-xs font-medium text-foreground/75"
                  >
                    <span className="truncate">{title}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
