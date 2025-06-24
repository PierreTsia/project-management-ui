import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { useUpdateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import type { Project } from '@/types/project';

const editProjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'ARCHIVED'] as const),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
};

export const EditProjectInfosModal = ({ isOpen, onClose, project }: Props) => {
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: updateProject } = useUpdateProject();

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status,
    },
  });

  const handleSubmit = async (data: EditProjectFormData) => {
    setIsSubmitting(true);
    try {
      await updateProject({
        id: project.id,
        data: {
          name: data.name,
          description: data.description || null,
          status: data.status,
        },
      });

      toast.success(t('projects.edit.success'));
      onClose();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[500px]"
        data-testid="edit-project-modal"
      >
        <DialogHeader>
          <DialogTitle>{t('projects.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('projects.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('projects.edit.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('projects.edit.namePlaceholder')}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('projects.edit.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('projects.edit.descriptionPlaceholder')}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('projects.edit.statusLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('projects.edit.selectStatus')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        {t('projects.status.active')}
                      </SelectItem>
                      <SelectItem value="ARCHIVED">
                        {t('projects.status.archived')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                data-testid="cancel-edit-project"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="submit-edit-project"
              >
                {isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
