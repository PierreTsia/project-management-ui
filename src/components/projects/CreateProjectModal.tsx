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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/hooks/useTranslations';
import { useCreateProject } from '@/hooks/useProjects';
import type { CreateProjectRequest } from '@/types/project';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Clean schema with translation keys - FormMessage will handle translation
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'projects.create.validation.nameRequired')
    .max(100, 'projects.create.validation.nameMaxLength'),
  description: z
    .string()
    .max(500, 'projects.create.validation.descriptionMaxLength')
    .optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const { t } = useTranslations();
  const createProjectMutation = useCreateProject();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const projectData: CreateProjectRequest = {
        name: data.name,
        ...(data.description && { description: data.description }),
      };

      await createProjectMutation.mutateAsync(projectData);

      // Close modal and reset form on success
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to create project:', error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('projects.create.title')}</DialogTitle>
          <DialogDescription>
            {t('projects.create.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('projects.create.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('projects.create.namePlaceholder')}
                      {...field}
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
                  <FormLabel>{t('projects.create.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('projects.create.descriptionPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
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
                onClick={handleCancel}
                disabled={createProjectMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={createProjectMutation.isPending}>
                {createProjectMutation.isPending
                  ? t('projects.create.creating')
                  : t('projects.create.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
