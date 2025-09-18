import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface TeamPageHeaderProps {
  onAddClick: () => void;
}

export function TeamPageHeader({ onAddClick }: TeamPageHeaderProps) {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">{t('navigation.team')}</h1>
      </div>
      <Button size="sm" onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        {t('common.add')}
      </Button>
    </div>
  );
}
