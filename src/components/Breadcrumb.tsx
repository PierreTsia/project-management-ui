import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb() {
  const { t } = useTranslation();
  const location = useLocation();

  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment,
      path: '/' + array.slice(0, index + 1).join('/'),
      isLast: index === array.length - 1,
    }));

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {pathSegments.map(segment => (
        <div key={segment.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {segment.isLast ? (
            <span className="text-foreground font-medium capitalize">
              {t(`navigation.${segment.name}`)}
            </span>
          ) : (
            <Link
              to={segment.path}
              className="hover:text-foreground transition-colors capitalize"
            >
              {t(`navigation.${segment.name}`)}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
