import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { key: 'dashboard', href: '/' },
  { key: 'projects', href: '/projects' },
  { key: 'tasks', href: '/tasks' },
  { key: 'team', href: '/team' },
  { key: 'settings', href: '/settings' },
] as const;

export function Navigation() {
  const { t } = useTranslation();

  return (
    <nav className="border-b bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navigationItems.map(item => (
            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'px-3 py-4 text-sm font-medium transition-colors hover:text-primary',
                  isActive
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              {t(`navigation.${item.key}`)}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
