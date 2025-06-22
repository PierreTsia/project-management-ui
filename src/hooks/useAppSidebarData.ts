import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Home, FolderKanban, CheckSquare, Users, Settings } from 'lucide-react';
import { useUser } from './useUser';

export const useAppSidebarData = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { data: user } = useUser();

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

  return {
    user: user
      ? {
          name: user.name || 'User',
          email: user.email || 'user@example.com',
          avatar: user.avatarUrl || '/avatars/user.jpg',
        }
      : {
          name: 'Loading...',
          email: '',
          avatar: '/avatars/user.jpg',
        },
    navMain,
    projects,
  };
};
