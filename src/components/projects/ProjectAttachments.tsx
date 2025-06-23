import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

type Attachment = {
  id: string;
  name: string;
  size: string;
};

type Props = {
  attachments: Attachment[];
  onAttachmentClick?: (attachment: Attachment) => void;
};

export const ProjectAttachments = ({
  attachments,
  onAttachmentClick,
}: Props) => {
  const { t } = useTranslations();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('projects.detail.attachments')}
      </h3>
      <div className="flex gap-2 pl-4">
        {attachments.map(attachment => (
          <Button
            key={attachment.id}
            variant="ghost"
            size="sm"
            className="h-auto p-3 flex items-center gap-2 text-left hover:bg-muted border border-border/50"
            onClick={() => onAttachmentClick?.(attachment)}
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs">
              <div className="font-medium text-foreground">
                {attachment.name}
              </div>
              <div className="text-muted-foreground">{attachment.size}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
