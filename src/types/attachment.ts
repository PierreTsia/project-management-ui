import type { User } from './user';

export const ATTACHMENT_ENTITY_TYPES = ['PROJECT', 'TASK'] as const;
export type AttachmentEntityType = (typeof ATTACHMENT_ENTITY_TYPES)[number];

export type Attachment = {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  entityType: AttachmentEntityType;
  entityId: string;
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: User;
};
