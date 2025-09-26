import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

type TaskGenerationActionsProps = {
  mode: 'form' | 'preview' | 'linked-preview';
  isPending: boolean;
  isValid?: boolean;
  isConfirming?: boolean;
  isImportingBulk?: boolean;
  isImportingSingle?: boolean;
  onClose: () => void;
  onBack: () => void;
  onRegenerate: () => void;
  onImportSelected?: (() => void) | undefined;
  onConfirmLinked?: (() => void) | undefined;
  cancelLabel?: string | undefined;
  generateLabel?: string | undefined;
};

export function TaskGenerationActions({
  mode,
  isPending,
  isValid = true,
  isConfirming = false,
  isImportingBulk = false,
  isImportingSingle = false,
  onClose,
  onBack,
  onRegenerate,
  onImportSelected,
  onConfirmLinked,
  cancelLabel,
  generateLabel,
}: TaskGenerationActionsProps) {
  const { t } = useTranslations();

  if (mode === 'form') {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
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
    );
  }

  if (mode === 'preview') {
    return (
      <>
        <Button type="button" variant="ghost" onClick={onBack}>
          {t('ai.generate.backToPrompt')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={isPending}
        >
          {t('ai.generate.regenerate')}
        </Button>
        {onImportSelected && (
          <Button
            type="button"
            onClick={onImportSelected}
            disabled={isImportingBulk || isImportingSingle}
          >
            {t('ai.generate.addSelected')}
          </Button>
        )}
      </>
    );
  }

  if (mode === 'linked-preview') {
    return (
      <>
        <Button type="button" variant="ghost" onClick={onBack}>
          {t('ai.generate.backToPrompt')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={isPending}
        >
          {t('ai.generate.regenerate')}
        </Button>
        {onConfirmLinked && (
          <Button
            type="button"
            onClick={onConfirmLinked}
            disabled={isConfirming}
          >
            {isConfirming ? t('common.loading') : t('common.confirm')}
          </Button>
        )}
      </>
    );
  }

  return null;
}
