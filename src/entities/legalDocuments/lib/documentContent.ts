import { LegalDocumentContent } from '../model/types';

const normalizeBase64 = (content: string): string => (
  content
    .replace(/^data:[^;]+;base64,/, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
);

export const createDocumentBlob = ({ content, contentType }: LegalDocumentContent): Blob => {
  const binary = window.atob(normalizeBase64(content));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: contentType });
};

export const isPdf = ({ contentType }: LegalDocumentContent): boolean => (
  contentType.toLowerCase().includes('application/pdf')
);
