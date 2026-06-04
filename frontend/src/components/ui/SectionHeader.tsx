import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full ${className}`}>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 font-medium font-sans">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  );
}

export default SectionHeader;
