import React from 'react';
import { SidebarWidget } from '@ui/components/widgets/SidebarWidget';
import type { WidgetConfig } from '@ui/components/widgets/types';

interface SidebarProps {
  widgets: WidgetConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({ widgets }) => {
  return (
    <aside className="w-78 border-r border-border/40 bg-muted/20 overflow-y-auto px-6 py-6 space-y-6">
      {widgets.map((widget, index) => (
        <SidebarWidget
          key={index}
          type={widget.type}
          title={widget.title}
          data={widget.data}
          showSeparator={widget.showSeparator}
          className={widget.className}
        />
      ))}
    </aside>
  );
};
