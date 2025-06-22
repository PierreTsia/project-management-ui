import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const HeaderBreadcrumb = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment,
      path: '/' + array.slice(0, index + 1).join('/'),
      isLast: index === array.length - 1,
    }));

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map(segment => (
          <div key={segment.path} className="flex items-center space-x-2">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {segment.isLast ? (
                <BreadcrumbPage className="capitalize">
                  {t(`navigation.${segment.name}`)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={segment.path} className="capitalize">
                    {t(`navigation.${segment.name}`)}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
