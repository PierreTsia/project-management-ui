import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useUpdateProject } from '@/hooks/useProjects';
import { toast } from 'sonner';
import type { Project } from '@/types/project';

type Props = {
  project: Project;
};

const ProjectDescriptionSection = ({ project }: Props) => {
  const { t } = useTranslations();
  const { mutateAsync: updateProject, isPending: isUpdatingProject } =
    useUpdateProject();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');

  const handleStartEditDescription = () => {
    if (!project) return;
    setDescriptionDraft(project.description || '');
    setIsEditingDescription(true);
  };

  const handleCancelEditDescription = () => {
    setIsEditingDescription(false);
    setDescriptionDraft('');
  };

  const handleSaveDescription = async () => {
    if (!project) return;
    try {
      await updateProject({
        id: project.id,
        data: { description: descriptionDraft },
      });
      toast.success(t('projects.detail.descriptionUpdateSuccess'));
      setIsEditingDescription(false);
      setDescriptionDraft('');
    } catch {
      toast.error(t('projects.detail.descriptionUpdateError'));
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditDescription();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground border-b border-border pb-2">
        {t('projects.detail.description')}
      </h3>
      {isEditingDescription ? (
        <div className="space-y-3">
          <Textarea
            value={descriptionDraft}
            onChange={e => setDescriptionDraft(e.target.value)}
            onKeyDown={handleDescriptionKeyDown}
            placeholder={t('projects.detail.descriptionPlaceholder')}
            className="min-h-[100px] resize-none"
            data-testid="project-description-textarea"
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              onClick={handleSaveDescription}
              disabled={isUpdatingProject}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              data-testid="save-project-description-button"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelEditDescription}
              disabled={isUpdatingProject}
              size="sm"
              className="h-8 w-8 p-0"
              data-testid="cancel-project-description-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : project.description ? (
        <div
          className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
          onClick={handleStartEditDescription}
          data-testid="project-description-container"
        >
          <p className="text-sm text-muted-foreground leading-relaxed pl-4">
            {project.description}
          </p>
        </div>
      ) : (
        <div
          className="group cursor-pointer rounded-md p-2 -m-2 hover:bg-muted/50 transition-colors"
          onClick={handleStartEditDescription}
          data-testid="add-project-description-container"
        >
          <p className="text-sm text-muted-foreground hover:text-foreground pl-4">
            {t('projects.detail.addDescription')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectDescriptionSection;
