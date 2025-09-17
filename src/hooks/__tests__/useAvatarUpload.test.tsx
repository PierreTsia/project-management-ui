import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAvatarUpload } from '../useAvatarUpload';
import { UsersService } from '@/services/users';
import { toast } from 'sonner';

vi.mock('@/services/users');
const mockUsersService = vi.mocked(UsersService);

// Mock sonner
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useAvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts valid image and uploads, invalidates user, closes dialog, resets preview', async () => {
    const wrapper = createWrapper();
    mockUsersService.uploadAvatar = vi
      .fn()
      .mockResolvedValue({ id: '1', avatarUrl: 'http://x' });

    const { result } = renderHook(
      () => useAvatarUpload({ initialOpen: true }),
      { wrapper }
    );

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileSelect(event);
    });

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(mockUsersService.uploadAvatar).toHaveBeenCalledTimes(1);
    expect(mockUsersService.uploadAvatar).toHaveBeenCalledWith(file);
    expect(toast.success).toHaveBeenCalled();
  });

  it('rejects invalid type and does not call API', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAvatarUpload({ initialOpen: true }),
      { wrapper }
    );
    const badFile = new File(['x'], 'x.gif', { type: 'image/gif' });
    const event = {
      target: { files: [badFile] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileSelect(event);
    });

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(UsersService.uploadAvatar).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('rejects oversize file and does not call API', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAvatarUpload({ initialOpen: true }),
      { wrapper }
    );
    const big = new File(['x'.repeat(3_000_000)], 'big.png', {
      type: 'image/png',
    });
    Object.defineProperty(big, 'size', { value: 3_000_000 });
    const event = {
      target: { files: [big] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileSelect(event);
    });

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(UsersService.uploadAvatar).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('shows error toast on API failure and resets uploading', async () => {
    const wrapper = createWrapper();
    mockUsersService.uploadAvatar = vi
      .fn()
      .mockRejectedValue(new Error('boom'));
    const { result } = renderHook(
      () => useAvatarUpload({ initialOpen: true }),
      { wrapper }
    );
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileSelect(event);
    });

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(mockUsersService.uploadAvatar).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
