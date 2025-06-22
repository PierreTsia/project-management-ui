import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
//import { ThemeToggle } from '@/components/ThemeToggle';
//import { LanguageSwitcher } from '@/components/LanguageSwitcher';
//import { Navigation } from '@/components/Navigation';
//import { Breadcrumb } from '@/components/Breadcrumb';
//import { LogoutButton } from './LogoutButton';
//import { useTranslations } from '@/hooks/useTranslations';

export const Layout = () => {
  // const { t } = useTranslations();

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};
