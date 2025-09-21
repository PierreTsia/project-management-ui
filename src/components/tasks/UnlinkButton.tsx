import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from '@/hooks/useTranslations';
import { Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnlinkButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary';
  mobileVisible?: boolean; // Whether to show on mobile (default: true)
}

export const UnlinkButton = ({
  onClick,
  disabled = false,
  className,
  size = 'sm',
  variant = 'ghost',
  mobileVisible = true,
}: UnlinkButtonProps) => {
  const { t } = useTranslations();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            data-testid="unlink-button"
            className={cn(
              'h-5 w-5 p-0 transition-opacity hover:bg-transparent text-primary',
              mobileVisible
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100',
              className
            )}
          >
            <Unlink className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-popover border border-border text-popover-foreground shadow-lg"
        >
          <div className="text-sm">
            <p className="font-semibold">{t('tasks.detail.removeRelation')}</p>
            <p className="text-muted-foreground text-xs mt-1">
              {t('tasks.detail.removeRelationDescription')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
