import { Button } from '@/components/ui/button';
import { Paperclip, Download, Trash2 } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Attachment } from '@/types/attachment';
import { formatFileSize } from '@/lib/file-helpers';
import { FileIcon } from '@/components/ui/file-icon';

type Props = {
  attachment: Attachment;
  onView: (attachment: Attachment) => void;
  onDownload: (attachment: Attachment) => void;
  onDelete: (attachment: Attachment) => void;
  isDeleting?: boolean;
};

export const AttachmentListItem = ({
  attachment,
  onView,
  onDownload,
  onDelete,
  isDeleting = false,
}: Props) => {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="flex-shrink-0">
          <FileIcon fileType={attachment.fileType} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate text-xs sm:text-sm max-w-[8rem] sm:max-w-xs">
            {attachment.filename}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1">
            <span>{formatFileSize(attachment.fileSize)}</span>
            <span className="hidden sm:inline">•</span>
            <span>{attachment.uploadedBy.name}</span>
            <span className="hidden sm:inline">•</span>
            <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(attachment)}
          title={t('attachments.actions.view')}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload(attachment)}
          title={t('attachments.actions.download')}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(attachment)}
          title={t('attachments.actions.delete')}
          className="text-destructive hover:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
