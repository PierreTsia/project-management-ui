import { useTranslations } from '@/hooks/useTranslations';
import { useUpdateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import type { Project } from '@/types/project';
import EditableContent from '@/components/ui/editable-content';

type Props = {
  project: Project;
};

const ProjectDescriptionSection = ({ project }: Props) => {
  const { t } = useTranslations();
  const { mutateAsync: updateProject, isPending: isUpdatingProject } =
    useUpdateProject();

  const handleSaveDescription = async (content: string) => {
    if (!project) return;
    try {
      await updateProject({
        id: project.id,
        data: { description: content },
      });
      toast.success(t('projects.detail.descriptionUpdateSuccess'));
    } catch {
      toast.error(t('projects.detail.descriptionUpdateError'));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('projects.detail.description')}
      </h3>
      <EditableContent
        content={project.description}
        placeholder={t('projects.detail.descriptionPlaceholder')}
        onSave={handleSaveDescription}
        isPending={isUpdatingProject}
        addText={t('projects.detail.addDescription')}
        data-testid="project-description"
      />
    </div>
  );
};

export default ProjectDescriptionSection;
