import { LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';

export const LogoutButton = () => {
  const { t } = useTranslations();
  const { mutateAsync: logout, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => logout()}
      disabled={isPending}
      aria-label={t('navigation.logout')}
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
};
