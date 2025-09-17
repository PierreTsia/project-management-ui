import { useTranslations } from '@/hooks/useTranslations';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette } from 'lucide-react';

export function AppearanceCard() {
  const { t } = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="mr-2 h-5 w-5" />
          {t('settings.appearance.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.appearance.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.appearance.darkMode')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.appearance.darkModeDesc')}
            </p>
          </div>
          <Switch />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.appearance.compactMode')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.appearance.compactModeDesc')}
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
