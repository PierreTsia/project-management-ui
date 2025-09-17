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
import { Bell } from 'lucide-react';

export function NotificationsCard() {
  const { t } = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          {t('settings.notifications.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.notifications.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.notifications.email')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.notifications.emailDesc')}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.notifications.push')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.notifications.pushDesc')}
            </p>
          </div>
          <Switch />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('settings.notifications.taskReminders')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.notifications.taskRemindersDesc')}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}
