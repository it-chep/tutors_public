export interface LegalDocument {
  id: string;
  type: string;
  title: string;
  description: string;
  primaryVersion: LegalDocumentVersion | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDocumentVersion {
  id: string;
  number: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publishedAt: string;
  isCurrent: boolean;
}

export interface LegalDocumentGroup {
  type: string;
  documents: LegalDocument[];
}

export interface LegalDocumentContent {
  fileName: string;
  contentType: string;
  content: string;
}
