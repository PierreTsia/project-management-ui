import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { SiteHeader } from '@/components/SiteHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const Layout = () => {
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
