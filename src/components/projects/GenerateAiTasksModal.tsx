import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';
import {
  useGenerateTasks,
  useGenerateLinkedTasksPreview,
  useConfirmLinkedTasks,
} from '@/hooks/useAi';
import { useCreateTask, useCreateTasksBulk } from '@/hooks/useTasks';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import {
  TaskGenerationForm,
  type GenerateTasksFormValues,
} from './TaskGenerationForm';
import { TaskPreviewList } from './TaskPreviewList';
import { TaskGenerationActions } from './TaskGenerationActions';
import type { TaskLinkType } from '@/types/task';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  locale?: string;
  title?: string;
  promptLabel?: string;
  optionsTitle?: string;
  cancelLabel?: string;
  generateLabel?: string;
  description?: string;
};

export function GenerateAiTasksModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectDescription,
  locale,
  title,
  promptLabel,
  optionsTitle,
  cancelLabel,
  generateLabel,
  description,
}: Props) {
  const { t } = useTranslations();

  const {
    mutateAsync: generateFlat,
    data,
    isPending: isFlatPending,
    isError: isFlatError,
    reset: resetFlat,
  } = useGenerateTasks();

  const {
    mutateAsync: generatePreview,
    data: previewData,
    isPending: isPreviewPending,
    isError: isPreviewError,
    reset: resetPreview,
  } = useGenerateLinkedTasksPreview();

  const { mutateAsync: confirmLinked, isPending: isConfirming } =
    useConfirmLinkedTasks();

  const { isPending: isImportingSingle } = useCreateTask();
  const { mutateAsync: createTasksBulk, isPending: isImportingBulk } =
    useCreateTasksBulk();

  const tasks = useMemo(
    () => data?.tasks ?? previewData?.tasks ?? [],
    [data?.tasks, previewData?.tasks]
  );

  const [selected, setSelected] = useState<ReadonlyArray<boolean>>([]);
  const [filteredRelationships, setFilteredRelationships] = useState<
    ReadonlyArray<{
      sourceTask: string;
      targetTask: string;
      type: TaskLinkType;
    }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      resetFlat();
      resetPreview();
    }
  }, [isOpen, resetFlat, resetPreview]);

  useEffect(() => {
    if (tasks.length > 0) {
      setSelected(tasks.map(() => true));
    }
  }, [tasks]);

  useEffect(() => {
    if (previewData?.relationships) {
      setFilteredRelationships(previewData.relationships);
    }
  }, [previewData?.relationships]);

  const isPending = isFlatPending || isPreviewPending;
  const isError = isFlatError || isPreviewError;
  const degraded = data?.meta?.degraded === true;

  const handleGenerate = async (values: GenerateTasksFormValues) => {
    if (values.mode === 'simple') {
      await generateFlat({
        prompt: values.prompt,
        projectId,
        locale: locale ?? '',
        options: {
          taskCount: values.count,
          ...(values.priority !== 'AUTO'
            ? { minPriority: values.priority }
            : {}),
          ...(values.projectType !== 'auto'
            ? { projectType: values.projectType }
            : {}),
        },
      });
      return;
    }
    await generatePreview({
      prompt: values.prompt,
      projectId,
      options: {
        taskCount: values.count,
        ...(values.priority !== 'AUTO' ? { minPriority: values.priority } : {}),
        ...(values.projectType !== 'auto'
          ? { projectType: values.projectType }
          : {}),
      },
    });
  };

  const handleConfirmLinked = async (): Promise<void> => {
    if (!previewData) return;
    const tasksPayload = (previewData.tasks ?? []).map(t => ({
      title: t.title,
      ...(t.description ? { description: t.description } : {}),
      ...(t.priority ? { priority: t.priority } : {}),
    }));
    const relationshipsPayload = filteredRelationships.map(rel => ({
      sourceTask: rel.sourceTask,
      targetTask: rel.targetTask,
      type: rel.type,
    }));
    await confirmLinked(
      {
        projectId,
        tasks: tasksPayload,
        relationships: relationshipsPayload,
      },
      {
        onSuccess: () => {
          toast.success(t('tasks.create.success'));
          onClose();
        },
        onError: (error: unknown) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const importSelectedTasks = async (): Promise<void> => {
    const chosen = tasks.filter((_, i) => selected[i] ?? true);
    if (chosen.length === 0) {
      toast.error(t('common.error'));
      return;
    }
    await createTasksBulk(
      {
        projectId,
        payload: {
          items: chosen.map(tsk => ({
            title: tsk.title,
            ...(tsk.description ? { description: tsk.description } : {}),
            ...(tsk.priority ? { priority: tsk.priority } : {}),
          })),
        },
      },
      {
        onSuccess: () => {
          toast.success(t('tasks.create.success'));
          onClose();
        },
        onError: error => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  };

  const removeRelationship = (relationshipIndex: number) => {
    setFilteredRelationships(prev =>
      prev.filter((_, index) => index !== relationshipIndex)
    );
  };

  const handleBack = () => {
    resetFlat();
    resetPreview();
  };

  const handleRegenerate = () => {
    // This would need to be implemented based on current form values
    // For now, just reset to form
    handleBack();
  };

  const onImportSelected = () => {
    if (!isLinkedPreview) {
      importSelectedTasks();
    }
  };

  const onConfirmLinkedClick = () => {
    if (isLinkedPreview) {
      handleConfirmLinked();
    }
  };

  const showForm = !(data || previewData);
  const showPreview = (data || previewData) && tasks.length > 0;
  const isLinkedPreview = Boolean(previewData && previewData.relationships);

  const getActionMode = () => {
    if (showForm) return 'form';
    if (isLinkedPreview) return 'linked-preview';
    return 'preview';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[720px] min-h-[360px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {title ?? t('projects.detail.generateWithAi')}
          </DialogTitle>
          <DialogDescription>
            {description ?? t('ai.generate.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="pr-1">
          {data && degraded && (
            <Alert className="mb-3" variant="default">
              <AlertDescription>{t('ai.generate.degraded')}</AlertDescription>
            </Alert>
          )}

          {showForm && (
            <TaskGenerationForm
              onSubmit={handleGenerate}
              isPending={isPending}
              isError={isError}
              degraded={degraded}
              promptLabel={promptLabel ?? undefined}
              optionsTitle={optionsTitle ?? undefined}
              initialPrompt={
                projectName && projectDescription
                  ? `${projectName} — ${projectDescription}`
                  : (projectDescription ?? '')
              }
            />
          )}

          {showPreview && (
            <TaskPreviewList
              tasks={[...tasks]}
              relationships={
                isLinkedPreview ? [...filteredRelationships] : undefined
              }
              selected={selected}
              onSelectionChange={setSelected}
              onRelationshipRemove={removeRelationship}
            />
          )}
        </div>

        <div className="mt-4 pt-4 flex flex-col sm:flex-row justify-end gap-2">
          <TaskGenerationActions
            mode={getActionMode()}
            isPending={isPending}
            isConfirming={isConfirming}
            isImportingBulk={isImportingBulk}
            isImportingSingle={isImportingSingle}
            onClose={handleClose}
            onBack={handleBack}
            onRegenerate={handleRegenerate}
            onImportSelected={onImportSelected}
            onConfirmLinked={onConfirmLinkedClick}
            cancelLabel={cancelLabel}
            generateLabel={generateLabel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateAiTasksModal;
