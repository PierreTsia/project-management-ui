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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { useAddContributor } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';

const addContributorSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'WRITE', 'READ'] as const, {
    required_error: 'Please select a role',
  }),
});

type AddContributorFormData = z.infer<typeof addContributorSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
};

export const AddProjectContributorModal = ({
  isOpen,
  onClose,
  projectId,
}: Props) => {
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: addContributor } = useAddContributor();

  const form = useForm<AddContributorFormData>({
    resolver: zodResolver(addContributorSchema),
    defaultValues: {
      email: '',
      role: 'WRITE',
    },
  });

  const handleSubmit = async (data: AddContributorFormData) => {
    setIsSubmitting(true);
    try {
      await addContributor({
        projectId,
        data: {
          email: data.email,
          role: data.role,
        },
      });

      toast.success(t('projects.contributors.addSuccess'));
      form.reset();
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('projects.contributors.addTitle')}</DialogTitle>
          <DialogDescription>
            {t('projects.contributors.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="user@example.com"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('projects.contributors.role')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('projects.contributors.selectRole')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        {t('projects.contributors.roles.admin')}
                      </SelectItem>
                      <SelectItem value="WRITE">
                        {t('projects.contributors.roles.write')}
                      </SelectItem>
                      <SelectItem value="READ">
                        {t('projects.contributors.roles.read')}
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
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.adding') : t('common.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
