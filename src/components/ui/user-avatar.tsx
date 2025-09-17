import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import type { User } from '@/types/user';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

export function UserAvatar({
  user,
  size = 'md',
  className = '',
  showName = false,
}: UserAvatarProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  const sizeClass = sizeClasses[size];
  const fallbackText = user.name?.charAt(0)?.toUpperCase() || '?';

  const avatar = (
    <Avatar
      className={`${sizeClass} rounded-full`}
      title={user.name || user.email}
    >
      {!imageLoadError && user.avatarUrl && (
        <AvatarImage
          src={user.avatarUrl}
          alt={user.name || user.email}
          onError={handleImageError}
          onLoad={handleImageLoad}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      )}
      <AvatarFallback className="rounded-lg text-xs">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );

  if (!showName) {
    return <div className={className}>{avatar}</div>;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {avatar}
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
    </div>
  );
}
