import { useEffect, useMemo } from 'react';
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
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';

const inviteContributorSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'WRITE', 'READ'] as const),
});

type InviteContributorFormData = z.infer<typeof inviteContributorSchema>;

interface GlobalInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalInviteModal({ isOpen, onClose }: GlobalInviteModalProps) {
  const { t } = useTranslations();
  const { mutateAsync: addContributor, isPending } = useAddContributor();
  const { data: projectsData } = useProjects();

  // For now, we'll show all projects and let the backend handle permission validation
  // TODO: Backend should return user role in project data
  const allProjects = useMemo(() => {
    if (!projectsData?.projects) return [];
    return projectsData.projects;
  }, [projectsData?.projects]);

  const form = useForm<InviteContributorFormData>({
    resolver: zodResolver(inviteContributorSchema),
    defaultValues: {
      projectId: '',
      email: '',
      role: 'WRITE',
    },
  });

  useEffect(() => {
    if (isOpen && allProjects.length > 0) {
      form.setValue('projectId', allProjects[0].id);
    }
  }, [isOpen, allProjects, form]);

  const handleEmailChange = (email: string) => {
    form.setValue('email', email);
  };

  const handleSubmit = async (data: InviteContributorFormData) => {
    try {
      await addContributor({
        projectId: data.projectId,
        data: {
          email: data.email,
          role: data.role,
        },
      });

      toast.success(t('team.invite.success'));
      form.reset();
      onClose();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('team.invite.title')}</DialogTitle>
          <DialogDescription>{t('team.invite.description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Project Selection */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('team.invite.projectLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('team.invite.projectPlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allProjects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <span className="truncate">{project.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Input */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('team.invite.emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('team.invite.emailPlaceholder')}
                      onChange={e => handleEmailChange(e.target.value)}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('team.invite.roleLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="READ">
                        {t('projects.contributors.roles.read')}
                      </SelectItem>
                      <SelectItem value="WRITE">
                        {t('projects.contributors.roles.write')}
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        {t('projects.contributors.roles.admin')}
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
                disabled={isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || allProjects.length === 0}
              >
                {isPending ? t('team.invite.loading') : t('team.invite.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {allProjects.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            {t('team.invite.noProjects')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
