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
import { Button } from '@/components/ui/button';
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
import { useGenerateTasks } from '@/hooks/useAi';
import { useCreateTask } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { PriorityBadge } from '@/components/ui/priority-badge';

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
    },
    mode: 'onChange',
  });

  const { mutateAsync, data, isPending, isError, reset } = useGenerateTasks();
  const { mutateAsync: createTask, isPending: isImporting } = useCreateTask();
  const tasks = useMemo(() => data?.tasks ?? [], [data?.tasks]);
  const [selected, setSelected] = useState<ReadonlyArray<boolean>>([]);

  useEffect(() => {
    if (isOpen) {
      const base = `${projectName}`;
      const suffix = projectDescription ? ` — ${projectDescription}` : '';
      form.reset({
        prompt: `${base}${suffix}`,
        count: COUNT_DEFAULT,
        projectType: 'auto',
        priority: 'AUTO',
      });
      reset();
    }
  }, [isOpen, projectName, projectDescription, reset, form]);

  useEffect(() => {
    if (tasks.length > 0) {
      setSelected(tasks.map(() => true));
    }
  }, [tasks]);

  const isValid = useMemo(
    () => form.formState.isValid,
    [form.formState.isValid]
  );

  const handleGenerate = async (values: FormValues) => {
    await mutateAsync({
      prompt: values.prompt,
      projectId,
      locale: locale ?? '',
      options: {
        taskCount: values.count,
        ...(values.priority !== 'AUTO' ? { minPriority: values.priority } : {}),
        ...(values.projectType !== 'auto'
          ? { projectType: values.projectType }
          : {}),
      },
    });
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
    const creations = chosen.map(tsk =>
      createTask({
        projectId,
        data: {
          title: tsk.title,
          ...(tsk.description ? { description: tsk.description } : {}),
          ...(tsk.priority ? { priority: tsk.priority } : {}),
        },
      })
    );
    await Promise.allSettled(creations);
    toast.success(t('tasks.create.success'));
    onClose();
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

        <div className="flex-1 overflow-auto pr-1 custom-scrollbar">
          <Form {...form}>
            {!data && (
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

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {optionsTitle ?? t('ai.generate.options')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                              <SelectTrigger>
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
                              <SelectTrigger>
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

            {data && tasks.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('ai.generate.results')}
                </div>
                <div className="space-y-3">
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
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </Form>
        </div>

        <div className="mt-4 pt-4 flex justify-end gap-2">
          {!data && (
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

          {data && tasks.length > 0 && (
            <>
              <Button type="button" variant="ghost" onClick={() => reset()}>
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
              <Button
                type="button"
                onClick={importSelectedTasks}
                disabled={isImporting}
              >
                {t('ai.generate.addSelected')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateAiTasksModal;
