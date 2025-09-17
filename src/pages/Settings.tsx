import { useTranslations } from '@/hooks/useTranslations';

import { useUser } from '@/hooks/useUser';

import { ProfileCard } from '../components/settings/ProfileCard';
import { AppearanceCard } from '../components/settings/AppearanceCard';
import { NotificationsCard } from '../components/settings/NotificationsCard';
import { SecurityCard } from '../components/settings/SecurityCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function Settings() {
  const { t } = useTranslations();
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="settings-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
            <p className="text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="h-80 rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6" data-testid="settings-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
            <p className="text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
          <div className="text-sm text-destructive">{t('common.error')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2" data-testid="settings-grid">
          {/* Left Column - Profile (Primary) */}
          <div className="space-y-4" data-testid="left-column">
            <div data-testid="profile-card">
              <ProfileCard user={user} isLoading={false} />
            </div>
          </div>

          {/* Right Column - Secondary Settings */}
          <div className="space-y-4" data-testid="right-column">
            {/* Appearance Settings */}
            <div data-testid="appearance-card">
              <AppearanceCard />
            </div>

            {/* Notifications */}
            <div data-testid="notifications-card">
              <NotificationsCard />
            </div>

            {/* Security */}
            {user?.canChangePassword !== false &&
            user?.provider !== 'google' ? (
              <div data-testid="security-card">
                <SecurityCard />
              </div>
            ) : (
              <Card data-testid="security-card-sso">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-base">
                    <Shield className="mr-2 h-4 w-4" />
                    {t('settings.security.title')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.security.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {/* Google G mark */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.3 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19-8.4 19-19 0-1.2-.1-2.3-.4-3.5z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.3 14.7l6.6 4.8C14.7 16.2 19 14 24 14c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.3 29.6 4 24 4 16.5 4 9.9 8.2 6.3 14.7z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.9 39.8 16.4 44 24 44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3.1 5.1-5.9 6.6l6.2 5.2C38.1 36.9 41 31.9 41 25.5c0-1.2-.1-2.3-.4-3.5z"
                      />
                    </svg>
                    <span>{t('settings.security.ssoManaged')}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
