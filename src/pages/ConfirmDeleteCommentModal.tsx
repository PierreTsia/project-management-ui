import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
};

const ConfirmDeleteCommentModal = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: Props) => {
  const { t } = useTranslations();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('tasks.comments.deleteTitle')}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          {t('tasks.comments.deleteConfirm')}
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onCancel?.();
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('common.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteCommentModal;
