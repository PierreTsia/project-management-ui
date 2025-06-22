import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Palette,
} from 'lucide-react';
import { useUser } from './useUser';

export const useAppSidebarData = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: user, isLoading } = useUser();

  console.log(location.pathname);

  const navMain = [
    {
      title: t('navigation.dashboard'),
      url: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      title: t('navigation.projects'),
      url: '/projects',
      icon: FolderKanban,
      isActive: location.pathname === '/projects',
    },
    {
      title: t('navigation.tasks'),
      url: '/tasks',
      icon: CheckSquare,
      isActive: location.pathname === '/tasks',
    },
    {
      title: t('navigation.team'),
      url: '/team',
      icon: Users,
      isActive: location.pathname === '/team',
    },
    {
      title: 'Sandbox',
      url: '/sandbox',
      icon: Palette,
      isActive: location.pathname === '/sandbox',
    },
    {
      title: t('navigation.settings'),
      url: '/settings',
      icon: Settings,
      isActive: location.pathname === '/settings',
    },
  ];

  // Mock projects data for now - this could come from a useProjects hook later
  const projects = [
    {
      name: 'Design Engineering',
      url: '#',
      icon: FolderKanban,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: FolderKanban,
    },
    {
      name: 'Travel',
      url: '#',
      icon: FolderKanban,
    },
  ];

  const user_data = isLoading
    ? {
        name: 'Loading...',
        email: 'loading@example.com',
        avatar: '',
      }
    : {
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com',
        avatar: user?.avatarUrl || '',
      };

  return {
    user: user_data,
    navMain,
    projects,
  };
};
