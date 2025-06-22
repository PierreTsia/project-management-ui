'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogout } from '@/hooks/useAuth';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { t } = useTranslation();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-testid="user-menu-trigger"
            >
              <Avatar
                className="h-8 w-8 rounded-lg"
                data-testid="user-avatar-trigger"
              >
                {!imageLoadError && (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                  />
                )}
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
            data-testid="user-menu-content"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar
                  className="h-8 w-8 rounded-lg"
                  data-testid="user-avatar-dropdown"
                >
                  {!imageLoadError && (
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  )}
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem data-testid="user-menu-upgrade">
                <Sparkles />
                {t('userMenu.upgradeToPro')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem data-testid="user-menu-account">
                <BadgeCheck />
                {t('userMenu.account')}
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="user-menu-billing">
                <CreditCard />
                {t('userMenu.billing')}
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="user-menu-notifications">
                <Bell />
                {t('userMenu.notifications')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              data-testid="user-menu-logout"
            >
              <LogOut />
              {isLoggingOut ? 'Logging out...' : t('userMenu.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
