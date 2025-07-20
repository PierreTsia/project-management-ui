import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserAvatar } from '../user-avatar';
import { createMockUser } from '../../../test/mock-factories';

describe('UserAvatar', () => {
  const mockUser = createMockUser({
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
  });

  it('should render avatar without name by default', () => {
    render(<UserAvatar user={mockUser} />);

    // Check for avatar container
    const avatarContainer = screen.getByTitle('John Doe');
    expect(avatarContainer).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });

  it('should render avatar with name when showName is true', () => {
    render(<UserAvatar user={mockUser} showName={true} />);

    // Check for avatar container
    const avatarContainer = screen.getByTitle('John Doe');
    expect(avatarContainer).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<UserAvatar user={mockUser} size="sm" />);
    expect(screen.getByTitle('John Doe')).toHaveClass('h-6', 'w-6');

    rerender(<UserAvatar user={mockUser} size="md" />);
    expect(screen.getByTitle('John Doe')).toHaveClass('h-8', 'w-8');

    rerender(<UserAvatar user={mockUser} size="lg" />);
    expect(screen.getByTitle('John Doe')).toHaveClass('h-10', 'w-10');
  });

  it('should show fallback initials when avatar fails to load', () => {
    const userWithAvatar = createMockUser({
      name: 'Jane Smith',
      avatarUrl: 'https://example.com/broken-image.jpg',
    });

    render(<UserAvatar user={userWithAvatar} />);

    // The fallback will show when image fails to load
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <UserAvatar user={mockUser} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should include title attribute with user name', () => {
    render(<UserAvatar user={mockUser} />);

    const avatar = screen.getByTitle('John Doe');
    expect(avatar).toHaveAttribute('title', 'John Doe');
  });
});
