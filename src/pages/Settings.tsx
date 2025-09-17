import { useTranslations } from '@/hooks/useTranslations';

import { useUser } from '@/hooks/useUser';

import { ProfileCard } from './Settings/ProfileCard';
import { AppearanceCard } from './Settings/AppearanceCard';
import { NotificationsCard } from './Settings/NotificationsCard';
import { SecurityCard } from './Settings/SecurityCard';
import { Skeleton } from '@/components/ui/skeleton';

export function Settings() {
  const { t } = useTranslations();
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
        <div className="text-sm text-destructive">{t('common.error')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <ProfileCard user={user} isLoading={false} />

        {/* Appearance Settings */}
        <AppearanceCard />

        {/* Notifications */}
        <NotificationsCard />

        {/* Security */}
        <SecurityCard />
      </div>
    </div>
  );
}
