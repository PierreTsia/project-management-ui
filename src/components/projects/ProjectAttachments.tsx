import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Paperclip,
  Upload,
  X,
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
import {
  useUploadProjectAttachment,
  useDeleteProjectAttachment,
} from '@/hooks/useProjects';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import type { Attachment } from '@/types/attachment';
import { ConfirmDeleteAttachmentModal } from './ConfirmDeleteAttachmentModal';

type Props = {
  projectId: string;
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

export const ProjectAttachments = ({
  projectId,
  attachments,
  onAttachmentClick,
}: Props) => {
  const { t } = useTranslations();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    attachment: Attachment | null;
  }>({ open: false, attachment: null });
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAttachment = useUploadProjectAttachment();
  const deleteAttachment = useDeleteProjectAttachment();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('attachments.errors.fileTooLarge'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await uploadAttachment.mutateAsync({
        projectId,
        data: { file: selectedFile },
      });

      toast.success(t('attachments.upload.success'));
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (attachment: Attachment) => {
    setDeleteModal({ open: true, attachment });
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.attachment) return;
    setDeleteError(null);
    try {
      await deleteAttachment.mutateAsync({
        projectId,
        attachmentId: deleteModal.attachment.id,
      });
      setDeleteModal({ open: false, attachment: null });
      toast.success(t('attachments.delete.success'));
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ open: false, attachment: null });
    setDeleteError(null);
  };

  const handleDownload = (attachment: Attachment) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = attachment.cloudinaryUrl;
    link.download = attachment.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAttachmentAction = (
    attachment: Attachment,
    action: 'view' | 'download' | 'delete'
  ) => {
    switch (action) {
      case 'view':
        onAttachmentClick?.(attachment);
        break;
      case 'download':
        handleDownload(attachment);
        break;
      case 'delete':
        handleDelete(attachment);
        break;
    }
  };

  if (!attachments?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
            {t('projects.detail.attachments')}
          </h3>
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Upload className="h-3 w-3 mr-1" />
                {t('attachments.upload.button')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('attachments.upload.title')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">
                    {t('attachments.upload.fileLabel')}
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading
                      ? t('common.uploading')
                      : t('attachments.upload.submit')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="pl-4 flex items-center gap-2">
          <div className="flex flex-col items-center gap-2 mx-auto">
            <span className="text-xs text-muted-foreground italic">
              {t('projects.detail.noAttachmentsYet')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
          {t('projects.detail.attachments')}
        </h3>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Upload className="h-3 w-3 mr-1" />
              {t('attachments.upload.button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('attachments.upload.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">
                  {t('attachments.upload.fileLabel')}
                </Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading
                    ? t('common.uploading')
                    : t('attachments.upload.submit')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2 pl-4">
        {attachments.map(attachment => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
          >
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
                  <span>
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAttachmentAction(attachment, 'view')}
                title={t('attachments.actions.view')}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAttachmentAction(attachment, 'download')}
                title={t('attachments.actions.download')}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(attachment)}
                title={t('attachments.actions.delete')}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteAttachmentModal
        open={deleteModal.open}
        filename={deleteModal.attachment?.filename || ''}
        loading={deleteAttachment.isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {(uploadAttachment.isError || deleteAttachment.isError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {uploadAttachment.error &&
              getApiErrorMessage(uploadAttachment.error)}
            {deleteAttachment.error &&
              getApiErrorMessage(deleteAttachment.error)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
