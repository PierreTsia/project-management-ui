import { UserAvatar } from '@/components/ui/user-avatar';
import type { User } from '@/types/user';

type AssigneeAvatarProps = {
  assignee?: User | undefined;
  fallbackToCurrentUser?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export const AssigneeAvatar = ({
  assignee,
  fallbackToCurrentUser: _fallbackToCurrentUser = true,
  size = 'sm',
}: AssigneeAvatarProps) => {
  if (assignee) {
    return <UserAvatar user={assignee} size={size} />;
  }

  return (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border border-slate-500/30">
      <span className="text-xs text-slate-300 font-medium">U</span>
    </div>
  );
};
