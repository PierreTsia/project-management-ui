import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from '@/hooks/useTranslations';
import {
  useGenerateTasks,
  useGenerateLinkedTasksPreview,
  useConfirmLinkedTasks,
} from '@/hooks/useAi';
import { useCreateTask, useCreateTasksBulk } from '@/hooks/useTasks';
import { getApiErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Badge } from '@/components/ui/badge';
import { TaskLinkBadge } from '@/components/tasks/TaskLinkBadge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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

const COUNT_DEFAULT = 6;
const COUNT_MIN = 3;
const COUNT_MAX = 12;

const schema = z.object({
  prompt: z.string().trim().min(1, 'ai.generate.prompt'),
  count: z.number().min(COUNT_MIN).max(COUNT_MAX),
  projectType: z.union([
    z.literal('auto'),
    z.literal('academic'),
    z.literal('professional'),
    z.literal('personal'),
    z.literal('team'),
  ]),
  priority: z.union([
    z.literal('AUTO'),
    z.literal('LOW'),
    z.literal('MEDIUM'),
    z.literal('HIGH'),
  ]),
  mode: z.union([
    z.literal('simple'),
    z.literal('structured'),
    z.literal('advanced'),
  ]),
});

type FormValues = z.infer<typeof schema>;

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
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: '',
      count: COUNT_DEFAULT,
      projectType: 'auto',
      priority: 'AUTO',
      mode: 'simple',
    },
    mode: 'onChange',
  });

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
      const base = `${projectName}`;
      const suffix = projectDescription ? ` — ${projectDescription}` : '';
      form.reset({
        prompt: `${base}${suffix}`,
        count: COUNT_DEFAULT,
        projectType: 'auto',
        priority: 'AUTO',
        mode: 'simple',
      });
      resetFlat();
      resetPreview();
    }
  }, [isOpen, projectName, projectDescription, resetFlat, resetPreview, form]);

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

  const isValid = useMemo(
    () => form.formState.isValid,
    [form.formState.isValid]
  );

  const isPending = isFlatPending || isPreviewPending;
  const isError = isFlatError || isPreviewError;

  const getIncomingRelationships = (taskIndex: number) => {
    if (!filteredRelationships.length) return [];
    return filteredRelationships.filter(
      rel => rel.targetTask === `task_${taskIndex + 1}`
    );
  };

  const getOutgoingRelationships = (taskIndex: number) => {
    if (!filteredRelationships.length) return [];
    return filteredRelationships.filter(
      rel => rel.sourceTask === `task_${taskIndex + 1}`
    );
  };

  const getTaskTitle = (taskRef: string) => {
    const match = taskRef.match(/task_(\d+)/);
    if (match) {
      const idx = parseInt(match[1]) - 1;
      return tasks[idx]?.title || taskRef;
    }
    return taskRef;
  };

  const removeRelationship = (relationshipIndex: number) => {
    setFilteredRelationships(prev =>
      prev.filter((_, index) => index !== relationshipIndex)
    );
  };

  const handleGenerate = async (values: FormValues) => {
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

  const degraded = data?.meta?.degraded === true;

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
          <Form {...form}>
            {!(data || previewData) && (
              <form
                id="ai-taskgen-form"
                className="space-y-4"
                onSubmit={form.handleSubmit(handleGenerate)}
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="ai-prompt">
                        {promptLabel ?? t('ai.generate.projectDescription')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="ai-prompt"
                          placeholder={t('ai.generate.promptPlaceholder')}
                          rows={4}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {optionsTitle ?? t('ai.generate.options')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <FormField
                      control={form.control}
                      name="count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('ai.generate.count')}</FormLabel>
                          <FormControl>
                            <div>
                              <Slider
                                value={[field.value]}
                                min={COUNT_MIN}
                                max={COUNT_MAX}
                                step={1}
                                onValueChange={vals => field.onChange(vals[0])}
                                disabled={isPending}
                              />
                              <div className="text-sm text-muted-foreground">
                                {field.value}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('ai.generate.generationMode')}
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isPending}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={t('ai.generate.modes.simple')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="simple"
                                  subtitle={t('ai.generate.modes.simpleDesc')}
                                >
                                  {t('ai.generate.modes.simple')}
                                </SelectItem>
                                <SelectItem
                                  value="structured"
                                  subtitle={t(
                                    'ai.generate.modes.structuredDesc'
                                  )}
                                >
                                  {t('ai.generate.modes.structured')}
                                </SelectItem>
                                <SelectItem
                                  value="advanced"
                                  subtitle={t('ai.generate.modes.advancedDesc')}
                                >
                                  {t('ai.generate.modes.advanced')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('ai.generate.projectType')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isPending}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={t('ai.generate.auto')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">
                                  {t('ai.generate.auto')}
                                </SelectItem>
                                <SelectItem value="academic">
                                  {t('ai.generate.projectTypes.academic')}
                                </SelectItem>
                                <SelectItem value="professional">
                                  {t('ai.generate.projectTypes.professional')}
                                </SelectItem>
                                <SelectItem value="personal">
                                  {t('ai.generate.projectTypes.personal')}
                                </SelectItem>
                                <SelectItem value="team">
                                  {t('ai.generate.projectTypes.team')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('ai.generate.priority')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isPending}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue
                                  placeholder={t('ai.generate.auto')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AUTO">
                                  {t('ai.generate.auto')}
                                </SelectItem>
                                <SelectItem value="HIGH">
                                  {t('tasks.priority.HIGH')}
                                </SelectItem>
                                <SelectItem value="MEDIUM">
                                  {t('tasks.priority.MEDIUM')}
                                </SelectItem>
                                <SelectItem value="LOW">
                                  {t('tasks.priority.LOW')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {degraded && (
                  <Alert>
                    <AlertDescription>
                      {t('ai.generate.degraded')}
                    </AlertDescription>
                  </Alert>
                )}

                {isError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {t('ai.generate.error')}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            )}

            {(data || previewData) && tasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>{t('ai.generate.results')}</span>
                  {filteredRelationships.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {t('ai.generate.relationships', {
                        count: filteredRelationships.length,
                      })}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3 md:max-h-160 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {tasks.map((task, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-3 border rounded-md"
                    >
                      <input
                        type="checkbox"
                        checked={selected[idx] ?? true}
                        onChange={e => {
                          const next =
                            selected.length === tasks.length
                              ? [...selected]
                              : tasks.map(() => true);
                          next[idx] = e.target.checked;
                          setSelected(next);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{task.title}</div>
                          {task.priority && (
                            <PriorityBadge
                              priority={task.priority}
                              size="sm"
                              readOnly
                            />
                          )}
                        </div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground">
                            {task.description}
                          </div>
                        )}

                        {/* Relationship indicators for linked tasks */}
                        {previewData?.relationships && (
                          <div className="mt-2 space-y-1">
                            {/* Incoming relationships */}
                            {getIncomingRelationships(idx).map(
                              (rel, relIdx) => {
                                const globalIndex =
                                  filteredRelationships.findIndex(
                                    r =>
                                      r.sourceTask === rel.sourceTask &&
                                      r.targetTask === rel.targetTask &&
                                      r.type === rel.type
                                  );
                                return (
                                  <div
                                    key={`incoming-${relIdx}`}
                                    className="flex items-center gap-2 text-xs group"
                                  >
                                    <TaskLinkBadge type={rel.type} size="sm" />
                                    <span className="text-muted-foreground">
                                      {getTaskTitle(rel.sourceTask)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeRelationship(globalIndex);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              }
                            )}

                            {/* Outgoing relationships */}
                            {getOutgoingRelationships(idx).map(
                              (rel, relIdx) => {
                                const globalIndex =
                                  filteredRelationships.findIndex(
                                    r =>
                                      r.sourceTask === rel.sourceTask &&
                                      r.targetTask === rel.targetTask &&
                                      r.type === rel.type
                                  );
                                return (
                                  <div
                                    key={`outgoing-${relIdx}`}
                                    className="flex items-center gap-2 text-xs group"
                                  >
                                    <TaskLinkBadge type={rel.type} size="sm" />
                                    <span className="text-muted-foreground">
                                      {getTaskTitle(rel.targetTask)}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeRelationship(globalIndex);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Form>
        </div>

        <div className="mt-4 pt-4 flex flex-col sm:flex-row justify-end gap-2">
          {!(data || previewData) && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                {cancelLabel ?? t('common.cancel')}
              </Button>
              <Button
                type="submit"
                form="ai-taskgen-form"
                disabled={!isValid || isPending}
              >
                {isPending
                  ? t('ai.generate.generating')
                  : (generateLabel ?? t('ai.generate.generate'))}
              </Button>
            </>
          )}

          {(data || previewData) && tasks.length > 0 && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetFlat();
                  resetPreview();
                }}
              >
                {t('ai.generate.backToPrompt')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerate(form.getValues())}
                disabled={isPending}
              >
                {t('ai.generate.regenerate')}
              </Button>
              {!previewData && (
                <Button
                  type="button"
                  onClick={importSelectedTasks}
                  disabled={isImportingBulk || isImportingSingle}
                >
                  {t('ai.generate.addSelected')}
                </Button>
              )}
              {previewData && (
                <Button
                  type="button"
                  onClick={handleConfirmLinked}
                  disabled={isConfirming}
                >
                  {isConfirming ? t('common.loading') : t('common.confirm')}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateAiTasksModal;
