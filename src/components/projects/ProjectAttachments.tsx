import { Button } from '@/components/ui/button';
import { Paperclip } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Attachment } from '@/types/attachment';

type Props = {
  attachments: Attachment[];
  onAttachmentClick?: (attachment: Attachment) => void;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const ProjectAttachments = ({
  attachments,
  onAttachmentClick,
}: Props) => {
  const { t } = useTranslations();

  if (!attachments?.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
          {t('projects.detail.attachments')}
        </h3>
        <div className="pl-4 flex items-center gap-2">
          <div className="flex flex-col items-center gap-2 mx-auto">
            <span className="text-xs text-muted-foreground italic">
              {t('projects.detail.noAttachmentsYet')}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => {
                // TODO: Handle add attachment
                console.log('Add attachment clicked');
              }}
            >
              <Paperclip className="h-3 w-3 mr-1" />
              {t('projects.detail.addAttachment')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                {attachment.filename}
              </div>
              <div className="text-muted-foreground">
                {formatFileSize(attachment.fileSize)}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
