import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import {
  useUploadProjectAttachment,
  useDeleteProjectAttachment,
} from '@/hooks/useProjects';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import type { Attachment } from '@/types/attachment';
import { ConfirmDeleteAttachmentModal } from './ConfirmDeleteAttachmentModal';
import { AnimatedList } from '@/components/ui/animated-list';
import { AttachmentListItem } from './AttachmentListItem';
import { AttachmentViewModal } from './AttachmentViewModal';
import { formatFileSize } from '@/lib/file-helpers';

type Props = {
  projectId: string;
  attachments: Attachment[];
  onAttachmentClick?: (attachment: Attachment) => void;
};

export const ProjectAttachments = ({
  projectId,
  attachments,
  onAttachmentClick: _onAttachmentClick,
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
  const [viewModal, setViewModal] = useState<{
    open: boolean;
    attachment: Attachment | null;
  }>({ open: false, attachment: null });
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
        setViewModal({ open: true, attachment });
        break;
      case 'download':
        handleDownload(attachment);
        break;
      case 'delete':
        handleDelete(attachment);
        break;
    }
  };

  const handleCloseViewModal = () => {
    setViewModal({ open: false, attachment: null });
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
                <DialogDescription>
                  Upload a file to attach it to this project.
                </DialogDescription>
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
              <DialogDescription>
                Upload a file to attach it to this project.
              </DialogDescription>
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
        <AnimatedList
          items={attachments}
          getKey={attachment => attachment.id}
          renderItem={attachment => (
            <AttachmentListItem
              attachment={attachment}
              onView={attachment => handleAttachmentAction(attachment, 'view')}
              onDownload={attachment =>
                handleAttachmentAction(attachment, 'download')
              }
              onDelete={attachment => handleDelete(attachment)}
              isDeleting={deleteAttachment.isPending}
            />
          )}
        />
      </div>

      <ConfirmDeleteAttachmentModal
        open={deleteModal.open}
        filename={deleteModal.attachment?.filename || ''}
        loading={deleteAttachment.isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <AttachmentViewModal
        attachment={viewModal.attachment}
        isOpen={viewModal.open}
        onClose={handleCloseViewModal}
        onDownload={handleDownload}
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
