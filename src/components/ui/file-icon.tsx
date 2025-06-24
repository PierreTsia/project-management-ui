import {
  Image as ImageIcon,
  FileText,
  File,
  FileArchive,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import {
  isImageFile,
  isPdfFile,
  isWordFile,
  isExcelFile,
  isPowerPointFile,
  isTextFile,
  isArchiveFile,
  isCodeFile,
} from '@/lib/file-helpers';

export type Props = {
  fileType: string;
  className?: string;
  size?: number;
};

/**
 * FileIcon component renders the appropriate icon for a given file type
 */
export const FileIcon = ({ fileType, className = '', size = 20 }: Props) => {
  const sizeClass = size === 20 ? 'h-5 w-5' : `h-[${size}px] w-[${size}px]`;
  if (isImageFile(fileType)) {
    return <ImageIcon className={`${sizeClass} text-blue-400 ${className}`} />;
  }
  if (isPdfFile(fileType)) {
    return <FileText className={`${sizeClass} text-red-500 ${className}`} />;
  }
  if (isWordFile(fileType)) {
    return <FileText className={`${sizeClass} text-blue-600 ${className}`} />;
  }
  if (isExcelFile(fileType)) {
    return (
      <FileSpreadsheet className={`${sizeClass} text-green-600 ${className}`} />
    );
  }
  if (isPowerPointFile(fileType)) {
    return <FileText className={`${sizeClass} text-orange-500 ${className}`} />;
  }
  if (isTextFile(fileType)) {
    return <FileText className={`${sizeClass} text-gray-500 ${className}`} />;
  }
  if (isArchiveFile(fileType)) {
    return (
      <FileArchive className={`${sizeClass} text-yellow-600 ${className}`} />
    );
  }
  if (isCodeFile(fileType)) {
    return <FileCode className={`${sizeClass} text-purple-500 ${className}`} />;
  }
  return <File className={`${sizeClass} text-muted-foreground ${className}`} />;
};
