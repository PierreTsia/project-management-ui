import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from '@/hooks/useTranslations';
import { useCreateTaskComment } from '@/hooks/useTaskComments';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'tasks.comments.validation.contentRequired')
    .max(1000, 'tasks.comments.validation.contentMaxLength'),
});

type CreateCommentFormData = z.infer<typeof createCommentSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskId: string;
};

const CreateCommentModal = ({
  open,
  onOpenChange,
  projectId,
  taskId,
}: Props) => {
  const { t } = useTranslations();
  const { mutateAsync, isPending } = useCreateTaskComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { content: '' },
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
      form.reset();
    }
  }, [open]);

  const handleSubmit = async (data: CreateCommentFormData) => {
    try {
      await mutateAsync({ projectId, taskId, content: data.content });
      toast.success(t('tasks.comments.addSuccess'));
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error(t('tasks.comments.addError'));
    }
  };

  const handleClose = () => {
    if (!isPending) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('tasks.comments.add')}</DialogTitle>
          <DialogDescription>
            {t('tasks.comments.addDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.comments.contentLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      placeholder={t('tasks.comments.contentPlaceholder')}
                      minLength={1}
                      maxLength={1000}
                      disabled={isPending}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('common.saving') : t('tasks.comments.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommentModal;
