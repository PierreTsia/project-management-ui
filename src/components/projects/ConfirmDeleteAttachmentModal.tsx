import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';

interface ConfirmDeleteAttachmentModalProps {
  open: boolean;
  filename: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteAttachmentModal = ({
  open,
  filename,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDeleteAttachmentModalProps) => {
  const { t } = useTranslations();
  return (
    <Dialog open={open} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('attachments.delete.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t('attachments.delete.confirmDescription')}
        </DialogDescription>
        <div className="py-2">
          <p className="mb-2">
            {t('attachments.delete.confirm', { filename })}
          </p>
          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? t('common.delete') : t('common.delete')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
