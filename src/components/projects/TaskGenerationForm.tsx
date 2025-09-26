import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

type GenerateTasksFormValues = z.infer<typeof schema>;

interface TaskGenerationFormProps {
  onSubmit: (values: GenerateTasksFormValues) => void;
  isPending: boolean;
  isError: boolean;
  degraded?: boolean;
  promptLabel?: string | undefined;
  optionsTitle?: string | undefined;
  initialPrompt?: string | undefined;
}

export function TaskGenerationForm({
  onSubmit,
  isPending,
  isError,
  degraded,
  promptLabel,
  optionsTitle,
  initialPrompt,
}: TaskGenerationFormProps) {
  const { t } = useTranslations();
  const form = useForm<GenerateTasksFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: initialPrompt ?? '',
      count: COUNT_DEFAULT,
      projectType: 'auto',
      priority: 'AUTO',
      mode: 'simple',
    },
    mode: 'onChange',
  });

  return (
    <Form {...form}>
      <form
        id="ai-taskgen-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
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
                  <FormLabel>{t('ai.generate.generationMode')}</FormLabel>
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
                          subtitle={t('ai.generate.modes.structuredDesc')}
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
                        <SelectValue placeholder={t('ai.generate.auto')} />
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
                        <SelectValue placeholder={t('ai.generate.auto')} />
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
            <AlertDescription>{t('ai.generate.degraded')}</AlertDescription>
          </Alert>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertDescription>{t('ai.generate.error')}</AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
}

export { type GenerateTasksFormValues };
