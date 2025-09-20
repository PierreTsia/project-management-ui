import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export const SectionHeader = ({
  title,
  children,
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};
