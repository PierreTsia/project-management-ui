/**
 * File-related utility functions for the UI
 * Centralizes logic for file size formatting, extension extraction, type checks, etc.
 */

/**
 * Format a file size in bytes to a human-readable string (e.g., 1.2 MB)
 * @param bytes - The file size in bytes
 * @returns Human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Extract the file extension from a filename (e.g., ".pdf")
 * @param filename - The file name
 * @returns The file extension, including the dot (e.g., ".pdf"), or an empty string if none
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
}

/**
 * Check if a file type is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Check if a file type is a PDF
 */
export function isPdfFile(fileType: string): boolean {
  return fileType === 'application/pdf';
}

/**
 * Check if a file type is a Word document
 */
export function isWordFile(fileType: string): boolean {
  return fileType.includes('word') || fileType.includes('document');
}

/**
 * Check if a file type is an Excel spreadsheet
 */
export function isExcelFile(fileType: string): boolean {
  return fileType.includes('excel') || fileType.includes('spreadsheet');
}

/**
 * Check if a file type is a PowerPoint presentation
 */
export function isPowerPointFile(fileType: string): boolean {
  return fileType.includes('powerpoint') || fileType.includes('presentation');
}

/**
 * Check if a file type is a plain text file
 */
export function isTextFile(fileType: string): boolean {
  return fileType.includes('text');
}

/**
 * Check if a file type is an archive (zip, rar)
 */
export function isArchiveFile(fileType: string): boolean {
  return fileType.includes('zip') || fileType.includes('rar');
}

/**
 * Check if a file type is code (source code, scripts)
 */
export function isCodeFile(fileType: string): boolean {
  return (
    fileType.includes('code') ||
    fileType.includes('javascript') ||
    fileType.includes('typescript')
  );
}

// Future: add getFileType, getFileName, etc. as needed
