import { publicGet } from '../../../shared/api';
import {
  LegalDocument,
  LegalDocumentContent,
  LegalDocumentGroup,
  LegalDocumentVersion,
} from '../model/types';

type ApiDocument = Partial<Omit<LegalDocument, 'primaryVersion'>> & {
  primaryVersion?: Partial<LegalDocumentVersion>;
};

type ApiDocumentGroup = Partial<LegalDocumentGroup> & {
  documents?: ApiDocument[];
};

type ApiDocumentContent = Partial<LegalDocumentContent>;

const value = (raw: unknown, fallback = ''): string => (
  raw === null || raw === undefined ? fallback : String(raw)
);

const bool = (raw: unknown): boolean => raw === true || raw === 'true';

const normalizeDocumentVersion = (version: Partial<LegalDocumentVersion>): LegalDocumentVersion => ({
  id: value(version.id),
  number: value(version.number),
  fileName: value(version.fileName),
  mimeType: value(version.mimeType),
  sizeBytes: Number(version.sizeBytes) || 0,
  publishedAt: value(version.publishedAt),
  isCurrent: bool(version.isCurrent),
});

const normalizeDocument = (document: ApiDocument): LegalDocument => ({
  id: value(document.id),
  type: value(document.type),
  title: value(document.title),
  description: value(document.description),
  primaryVersion: document.primaryVersion ? normalizeDocumentVersion(document.primaryVersion) : null,
  createdAt: value(document.createdAt),
  updatedAt: value(document.updatedAt),
});

const normalizeGroup = (group: ApiDocumentGroup): LegalDocumentGroup => ({
  type: value(group.type),
  documents: Array.isArray(group.documents) ? group.documents.map(normalizeDocument) : [],
});

const normalizeDocumentContent = (document: ApiDocumentContent): LegalDocumentContent => ({
  fileName: value(document.fileName, 'legal-document.pdf'),
  contentType: value(document.contentType, 'application/pdf'),
  content: value(document.content),
});

class LegalDocumentsService {
  listDocumentGroups = async (): Promise<LegalDocumentGroup[]> => {
    const response = await publicGet<{ groups?: ApiDocumentGroup[] }>('/api/v1/public/documents');
    return Array.isArray(response.groups) ? response.groups.map(normalizeGroup) : [];
  };

  getDocumentContent = async (documentId: string): Promise<LegalDocumentContent> => {
    const response = await publicGet<ApiDocumentContent>(
      `/api/v1/public/documents/${encodeURIComponent(documentId)}/content`,
    );
    return normalizeDocumentContent(response);
  };

  getDocumentVersionContent = async (
    documentId: string,
    versionId: string,
  ): Promise<LegalDocumentContent> => {
    const response = await publicGet<ApiDocumentContent>(
      `/api/v1/public/documents/${encodeURIComponent(documentId)}/versions/${encodeURIComponent(versionId)}/content`,
    );
    return normalizeDocumentContent(response);
  };

  listDocumentVersions = async (documentId: string): Promise<LegalDocumentVersion[]> => {
    const response = await publicGet<{ versions?: Partial<LegalDocumentVersion>[] }>(
      `/api/v1/public/documents/${encodeURIComponent(documentId)}/versions`,
    );
    return Array.isArray(response.versions) ? response.versions.map(normalizeDocumentVersion) : [];
  };
}

export const legalDocumentsService = new LegalDocumentsService();
