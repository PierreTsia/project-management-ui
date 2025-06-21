import { useLocation, useNavigate } from 'react-router-dom';

export const routes = {
  dashboard: '/',
  projects: '/projects',
  tasks: '/tasks',
  team: '/team',
  settings: '/settings',
} as const;

export type RouteKey = keyof typeof routes;

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (route: RouteKey) => {
    navigate(routes[route]);
  };

  const goToPath = (path: string) => {
    navigate(path);
  };

  const goBack = () => {
    navigate(-1);
  };

  const isActive = (route: RouteKey) => {
    return location.pathname === routes[route];
  };

  return {
    goTo,
    goToPath,
    goBack,
    isActive,
    currentPath: location.pathname,
    routes,
  };
}
