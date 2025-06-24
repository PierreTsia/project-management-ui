import { Link, useLocation } from 'react-router-dom';
import { type TranslationKey, useTranslations } from '@/hooks/useTranslations';
import { useProject } from '@/hooks/useProjects';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import React from 'react';

interface BreadcrumbSegment {
  name: string;
  path: string;
  isLast: boolean;
  isProjectId?: boolean;
  projectId?: string;
}

export const HeaderBreadcrumb = () => {
  const location = useLocation();

  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const path = '/' + array.slice(0, index + 1).join('/');
      const isLast = index === array.length - 1;

      // Detect if this is a project ID (previous segment is 'projects' and this looks like a UUID)
      const isProjectId =
        array[index - 1] === 'projects' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        );

      return {
        name: segment,
        path,
        isLast,
        isProjectId,
        projectId: isProjectId ? segment : undefined,
      } as BreadcrumbSegment;
    });

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
          <React.Fragment key={segment.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {segment.isLast ? (
                <BreadcrumbPage className="capitalize">
                  <BreadcrumbContent segment={segment} />
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={segment.path} className="capitalize">
                    <BreadcrumbContent segment={segment} />
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

// Separate component to handle project name fetching
const BreadcrumbContent = ({ segment }: { segment: BreadcrumbSegment }) => {
  const { t } = useTranslations();

  // If this is a project ID, fetch the project data
  const { data: project } = useProject(
    segment.isProjectId ? segment.projectId! : ''
  );

  if (segment.isProjectId) {
    // Show project name if available, otherwise show loading or fallback
    return project?.name || t('common.loading');
  }

  // For non-project segments, use the translation approach
  try {
    return t(`navigation.${segment.name}` as TranslationKey);
  } catch {
    // Fallback for unknown navigation keys
    return segment.name;
  }
};
