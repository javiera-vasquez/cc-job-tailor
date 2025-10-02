import React, { useRef, useCallback } from 'react';
import { SidebarWidget } from '@ui/components/widgets/SidebarWidget';
import { SidebarNavigation } from '@ui/components/SidebarNavigation';
import { useScrollSpy } from '@ui/hooks/useScrollSpy';
import type { WidgetConfig } from '@ui/components/widgets/types';

interface SidebarProps {
  widgets: WidgetConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({ widgets }) => {
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

  // Scroll to specific section
  const handleNavigate = useCallback((index: number) => {
    const ref = widgetRefs.current[index];
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  return (
    <aside className="w-78 border-r border-border bg-muted/20 overflow-y-auto flex flex-col">
      <div className='w-full'>
        <SidebarNavigation
          widgets={widgets}
          visibilityMap={visibilityMap}
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
                className={widget.className}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
