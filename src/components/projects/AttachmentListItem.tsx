import { Button } from '@/components/ui/button';
import {
  Paperclip,
  Download,
  Trash2,
  Image as ImageIcon,
  FileText,
  File,
  FileArchive,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Attachment } from '@/types/attachment';

type Props = {
  attachment: Attachment;
  onView: (attachment: Attachment) => void;
  onDownload: (attachment: Attachment) => void;
  onDelete: (attachment: Attachment) => void;
  isDeleting?: boolean;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileIcon = (fileType: string): React.ReactNode => {
  switch (true) {
    case fileType.startsWith('image/'):
      return <ImageIcon className="h-5 w-5 text-blue-400" />;
    case fileType.includes('pdf'):
      return <FileText className="h-5 w-5 text-red-500" />;
    case fileType.includes('word') || fileType.includes('document'):
      return <FileText className="h-5 w-5 text-blue-600" />;
    case fileType.includes('excel') || fileType.includes('spreadsheet'):
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    case fileType.includes('powerpoint') || fileType.includes('presentation'):
      return <FileText className="h-5 w-5 text-orange-500" />;
    case fileType.includes('text'):
      return <FileText className="h-5 w-5 text-gray-500" />;
    case fileType.includes('zip') || fileType.includes('rar'):
      return <FileArchive className="h-5 w-5 text-yellow-600" />;
    case fileType.includes('code') ||
      fileType.includes('javascript') ||
      fileType.includes('typescript'):
      return <FileCode className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
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
          {getFileIcon(attachment.fileType)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate max-w-xs text-sm">
            {attachment.filename}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{formatFileSize(attachment.fileSize)}</span>
            <span>•</span>
            <span>{attachment.uploadedBy.name}</span>
            <span>•</span>
            <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
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
