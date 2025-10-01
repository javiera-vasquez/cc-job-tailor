import React from 'react';
import { Separator } from '@ui/components/ui/separator';

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  showSeparator?: boolean;
  className?: string;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  showSeparator = true,
  className = '',
}) => {
  return (
    <>
      <div className={`space-y-3 ${className}`}>
        {title && (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground opacity-60">
            {title}
          </h2>
        )}
        {children}
      </div>
      {showSeparator && <Separator className="bg-neutral-700" />}
    </>
  );
};
