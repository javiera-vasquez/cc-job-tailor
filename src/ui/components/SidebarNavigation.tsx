import React, { RefObject, useState } from 'react';
import { Button } from '@ui/components/ui/button';
import type { WidgetConfig } from '@ui/components/widgets/types';

interface SidebarNavigationProps {
  widgets: WidgetConfig[];
  visibilityMap: Map<number, boolean>;
  onNavigate: (index: number) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  widgets,
  visibilityMap,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine the active section (first visible section or first section)
  const getActiveSection = (): number => {
    for (let i = 0; i < widgets.length; i++) {
      if (visibilityMap.get(i)) {
        return i;
      }
    }
    return 0; // Default to first section if none visible
  };

  const activeSectionIndex = getActiveSection();
  const activeTitle = widgets[activeSectionIndex]?.title || 'Section 1';

  return (
    <nav className="top-0 z-10  border-b border-border pb-2 mb-4 -mx-6 px-6 pt-4">
      <div className="w-full sticky">
        {/* Toggle Button Header */}
        <div className='mx-2'> 
          <Button
            variant={'outline'}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-auto py-2 px-4 justify-between border-accent/20"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-primary/75 font-medium">Sections</span>
              <span className="text-sm font-medium truncate">{activeTitle}</span>
            </div>
            <span className={`text-[10px] opacity-75 transition-transform ml-2 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </Button>
        </div>

        {/* Expandable Widget List */}
        {isExpanded && (
          <div className="border-t border-border bg-background">
            <div className="space-y-1 p-2">
              {widgets.map((widget, index) => {
                const isVisible = visibilityMap.get(index) ?? false;
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
                    className={`w-full justify-start text-xs font-medium transition-all ${
                      isVisible
                        ? 'text-foreground opacity-100'
                        : 'text-foreground opacity-40 hover:opacity-70'
                    }`}
                  >
                    <span className="truncate">{title}</span>
                    {!isVisible && (
                      <span className="ml-auto text-[10px] opacity-50">↓</span>
                    )}
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
