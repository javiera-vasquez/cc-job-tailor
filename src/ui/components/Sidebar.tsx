import React, { useRef, useCallback } from 'react';
import { SidebarWidget } from '@ui/components/widgets/SidebarWidget';
import { SidebarNavigation } from '@ui/components/SidebarNavigation';
import { useScrollSpy } from '@ui/hooks/useScrollSpy';
import type { WidgetConfig } from '@ui/components/widgets/types';

interface SidebarProps {
  widgets: WidgetConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({ widgets }) => {
  // Ref for the scrollable sidebar container
  const sidebarRef = useRef<HTMLElement>(null);

  // Create refs for each widget section
  const widgetRefs = useRef<React.RefObject<HTMLDivElement>[]>(
    widgets.map(() => React.createRef<HTMLDivElement>())
  );

  // Track which sections are in viewport
  const visibilityMap = useScrollSpy({
    refs: widgetRefs.current,
    rootMargin: '0px 0px -70% 0px',
    threshold: 0.1,
  });

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

  // Scroll to specific section with offset for sticky navigation
  const handleNavigate = useCallback((index: number) => {
    const targetRef = widgetRefs.current[index];
    const container = sidebarRef.current;

    if (targetRef?.current && container) {
      const element = targetRef.current;
      const offset = 80; // Height of SidebarNavigation sticky element
      const elementTop = element.offsetTop;
      const scrollPosition = elementTop - offset;

      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <aside ref={sidebarRef} className="w-78 border-r border-border bg-muted/20 overflow-y-auto flex flex-col">
      <div className='w-full'>
        <SidebarNavigation
          widgets={widgets}
          activeSectionIndex={activeSectionIndex}
          onNavigate={handleNavigate}
        />
        <div className="space-y-6 px-6 pb-6">
          {widgets.map((widget, index) => (
            <div key={index} ref={widgetRefs.current[index]}>
              <SidebarWidget
                type={widget.type}
                title={widget.title}
                data={widget.data}
                showSeparator={widget.showSeparator}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
