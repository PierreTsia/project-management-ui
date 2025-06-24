import {
  Image as ImageIcon,
  FileText,
  File,
  FileArchive,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import React from 'react';
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

/**
 * Get a file icon React node for a given file type
 * @param fileType - The file MIME type
 */
export function getFileIcon(fileType: string): React.ReactNode {
  const sizeClass = 'h-5 w-5';
  if (isImageFile(fileType)) {
    return <ImageIcon className={sizeClass + ' text-blue-400'} />;
  }
  if (isPdfFile(fileType)) {
    return <FileText className={sizeClass + ' text-red-500'} />;
  }
  if (isWordFile(fileType)) {
    return <FileText className={sizeClass + ' text-blue-600'} />;
  }
  if (isExcelFile(fileType)) {
    return <FileSpreadsheet className={sizeClass + ' text-green-600'} />;
  }
  if (isPowerPointFile(fileType)) {
    return <FileText className={sizeClass + ' text-orange-500'} />;
  }
  if (isTextFile(fileType)) {
    return <FileText className={sizeClass + ' text-gray-500'} />;
  }
  if (isArchiveFile(fileType)) {
    return <FileArchive className={sizeClass + ' text-yellow-600'} />;
  }
  if (isCodeFile(fileType)) {
    return <FileCode className={sizeClass + ' text-purple-500'} />;
  }
  return <File className={sizeClass + ' text-muted-foreground'} />;
}
