import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { UsersService } from '@/services/users';
import { useQueryClient } from '@tanstack/react-query';

type UseAvatarUploadOptions = {
  onSuccess?: () => void | Promise<void>;
  allowedTypes?: ReadonlyArray<string>;
  maxSizeBytes?: number;
  initialOpen?: boolean;
};

type UseAvatarUploadResult = {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isUploading: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  allowedImageTypes: ReadonlyArray<string>;
  maxAvatarBytes: number;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  resetPreview: () => void;
};

export function useAvatarUpload(
  options: UseAvatarUploadOptions = {}
): UseAvatarUploadResult {
  const queryClient = useQueryClient();
  const allowedImageTypes = useMemo(
    () =>
      options.allowedTypes ??
      (['image/jpeg', 'image/png', 'image/webp'] as const),
    [options.allowedTypes]
  );
  const maxAvatarBytes = options.maxSizeBytes ?? 2 * 1024 * 1024; // 2 MB

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(
    options.initialOpen ?? false
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetPreview = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const file = selectedFile;
    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Invalid file type');
      return;
    }
    if (file.size > maxAvatarBytes) {
      toast.error('File is too large (max 2 MB)');
      return;
    }

    setIsUploading(true);
    try {
      await UsersService.uploadAvatar(file);
      // Invalidate the user query by default so consumers don't have to
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Saved');
      if (options.onSuccess) await options.onSuccess();
      setIsDialogOpen(false);
      resetPreview();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isUploading,
    selectedFile,
    previewUrl,
    allowedImageTypes,
    maxAvatarBytes,
    handleFileSelect,
    handleUpload,
    resetPreview,
  };
}
