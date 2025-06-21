import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DashboardSnippets } from '@/components/DashboardSnippets';

export function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
      </div>

      {/* Button showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('test.showcase')}</h2>
        <div className="flex gap-2 flex-wrap">
          <Button>{t('buttons.default')}</Button>
          <Button variant="secondary">{t('buttons.secondary')}</Button>
          <Button variant="destructive">{t('buttons.destructive')}</Button>
          <Button variant="accent" size="lg">
            {t('buttons.accent')}
          </Button>
          <Button variant="warning" size="lg">
            {t('buttons.warning')}
          </Button>
          <Button variant="success" size="lg">
            {t('buttons.success')}
          </Button>
          <Button variant="outline">{t('buttons.outline')}</Button>
          <Button variant="ghost">{t('buttons.ghost')}</Button>
          <Button variant="link">{t('buttons.link')}</Button>
        </div>
      </div>

      <DashboardSnippets />

      {/* Card showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('test.cardShowcase')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{t('cards.title')}</h3>
            <p className="text-muted-foreground">{t('cards.description')}</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold mb-2">
              {t('cards.anotherCard')}
            </h3>
            <p className="text-muted-foreground">
              {t('cards.cardDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Color showcase */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('test.colorShowcase')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary text-primary-foreground">
            {t('colors.primary')}
          </div>
          <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
            {t('colors.secondary')}
          </div>
          <div className="p-4 rounded-lg bg-muted text-muted-foreground">
            {t('colors.muted')}
          </div>
          <div className="p-4 rounded-lg bg-accent text-accent-foreground">
            {t('colors.accent')}
          </div>
        </div>
      </div>
    </div>
  );
}
