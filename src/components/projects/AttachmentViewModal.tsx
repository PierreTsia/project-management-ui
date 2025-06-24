import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import type { Attachment } from '@/types/attachment';
import { isImageFile, isPdfFile } from '@/lib/file-helpers';
import { FileIcon } from '@/components/ui/file-icon';

type Props = {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (attachment: Attachment) => void;
};

const AttachmentHeader = ({
  filename,
  onDownload,
  showDownload = true,
}: {
  filename: string;
  onDownload: () => void;
  showDownload?: boolean;
}) => (
  <div className="flex items-center justify-between p-4 border-b border-border">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {showDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="mr-2"
        >
          <Download className="h-4 w-4 mr-2" />
        </Button>
      )}
      <h2 className="text-lg font-semibold truncate max-w-md">{filename}</h2>
    </div>
  </div>
);

// Download/error block for fallback/error states
const AttachmentDownloadBlock = ({
  error,
  onDownload,
  downloadLabel,
}: {
  error?: string | null;
  onDownload: () => void;
  downloadLabel: string;
}) => (
  <div className="text-center">
    {error && <div className="text-destructive mb-2">{error}</div>}
    <Button onClick={onDownload}>
      <Download className="h-4 w-4 mr-2" />
      {downloadLabel}
    </Button>
  </div>
);

const AttachmentPreview = ({
  attachment,
  isLoading,
  error,
  onImageLoad,
  onImageError,
  onIframeLoad,
  onIframeError,
  onDownload,
  downloadLabel,
  notSupportedLabel,
}: {
  attachment: Attachment;
  isLoading: boolean;
  error: string | null;
  onImageLoad: () => void;
  onImageError: () => void;
  onIframeLoad: () => void;
  onIframeError: () => void;
  onDownload: (attachment: Attachment) => void;
  downloadLabel: string;
  notSupportedLabel: string;
}) => {
  if (!attachment) return null;

  if (isImageFile(attachment.fileType)) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <AttachmentDownloadBlock
              error={error}
              onDownload={() => onDownload(attachment)}
              downloadLabel={downloadLabel}
            />
          </div>
        )}
        <img
          src={attachment.cloudinaryUrl}
          alt={attachment.filename}
          className="max-w-full max-h-full object-contain"
          onLoad={onImageLoad}
          onError={onImageError}
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />
      </div>
    );
  }

  if (isPdfFile(attachment.fileType)) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <AttachmentDownloadBlock
              error={error}
              onDownload={() => onDownload(attachment)}
              downloadLabel={downloadLabel}
            />
          </div>
        )}
        <iframe
          src={attachment.cloudinaryUrl}
          className="w-full h-full border-0"
          onLoad={onIframeLoad}
          onError={onIframeError}
          style={{ display: isLoading || error ? 'none' : 'block' }}
        />
      </div>
    );
  }

  // Fallback for other file types
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="text-center">
        <FileIcon fileType={attachment.fileType} size={32} />
        <h3 className="text-lg font-semibold mt-4 mb-2">
          {attachment.filename}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {notSupportedLabel}
        </p>
        <AttachmentDownloadBlock
          onDownload={() => onDownload(attachment)}
          downloadLabel={downloadLabel}
        />
      </div>
    </div>
  );
};

export const AttachmentViewModal = ({
  attachment,
  isOpen,
  onClose,
  onDownload,
}: Props) => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && attachment) {
      setIsLoading(true);
      setError(null);
    }
  }, [isOpen, attachment]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(t('attachments.errors.previewNotAvailable'));
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError(t('attachments.errors.previewNotAvailable'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen min-w-[90vw] h-[90vh] mt-8 flex flex-col p-0">
        <div className="flex flex-col h-full">
          <AttachmentHeader
            filename={attachment?.filename || ''}
            onDownload={() => attachment && onDownload(attachment)}
            showDownload={!!attachment}
          />
          <div className="flex-1 overflow-auto">
            {attachment && (
              <AttachmentPreview
                attachment={attachment}
                isLoading={isLoading}
                error={error}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
                onIframeLoad={handleIframeLoad}
                onIframeError={handleIframeError}
                onDownload={onDownload}
                downloadLabel={t('attachments.actions.download')}
                notSupportedLabel={t('attachments.preview.notSupported')}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
