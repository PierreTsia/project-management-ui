import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { useTranslations } from '@/hooks/useTranslations';
import { useGenerateTasks } from '@/hooks/useAi';
import type { AiPriority, GenerateTasksResponse } from '@/types/ai';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  locale?: string;
};

const COUNT_DEFAULT = 6;
const COUNT_MIN = 3;
const COUNT_MAX = 12;

export function GenerateAiTasksModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectDescription,
  locale,
}: Props) {
  const { t } = useTranslations();
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(COUNT_DEFAULT);
  const [projectType, setProjectType] = useState<
    'academic' | 'professional' | 'personal' | 'team' | 'auto'
  >('auto');
  const [priority, setPriority] = useState<AiPriority | 'AUTO'>('AUTO');

  const { mutateAsync, data, isPending, isError, reset } = useGenerateTasks();

  useEffect(() => {
    if (isOpen) {
      const base = `${projectName}`;
      const suffix = projectDescription ? ` — ${projectDescription}` : '';
      setPrompt(`${base}${suffix}`);
      reset();
    }
  }, [isOpen, projectName, projectDescription, reset]);

  const isValid = useMemo(() => prompt.trim().length > 0, [prompt]);

  const handleGenerate = async () => {
    await mutateAsync({ prompt, projectId, locale: locale ?? '' });
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const degraded =
    (data as GenerateTasksResponse | undefined)?.meta?.degraded === true;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('ai.generate.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">{t('ai.generate.prompt')}</Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={t('ai.generate.promptPlaceholder')}
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('ai.generate.count')}</Label>
              <Slider
                value={[count]}
                min={COUNT_MIN}
                max={COUNT_MAX}
                step={1}
                onValueChange={vals => setCount(vals[0])}
                disabled={isPending}
              />
              <div className="text-sm text-muted-foreground">{count}</div>
            </div>
            <div className="space-y-2">
              <Label>{t('ai.generate.projectType')}</Label>
              <Select
                value={projectType}
                onValueChange={v =>
                  setProjectType(
                    v as
                      | 'team'
                      | 'auto'
                      | 'academic'
                      | 'professional'
                      | 'personal'
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('ai.generate.priority')}</Label>
              <Select
                value={priority}
                onValueChange={v => setPriority(v as AiPriority)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleGenerate} disabled={!isValid || isPending}>
              {isPending
                ? t('ai.generate.generating')
                : t('ai.generate.generate')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateAiTasksModal;
