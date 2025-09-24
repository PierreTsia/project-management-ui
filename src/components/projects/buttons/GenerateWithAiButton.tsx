import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

type Props = {
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
};

export function GenerateWithAiButton({
  onClick,
  disabled,
  size = 'default',
  variant = 'default',
}: Props) {
  const { t } = useTranslations();

  return (
    <Button onClick={onClick} disabled={disabled} size={size} variant={variant}>
      <Sparkles className="mr-2 h-4 w-4" />
      {t('projects.detail.generateWithAi')}
    </Button>
  );
}

export default GenerateWithAiButton;
