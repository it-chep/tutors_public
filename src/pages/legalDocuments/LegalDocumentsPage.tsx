import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createDocumentBlob,
  isPdf,
  legalDocumentsService,
  LegalDocument,
  LegalDocumentGroup,
  LegalDocumentVersion,
} from '../../entities/legalDocuments';
import { MyButton } from '../../shared/ui/button';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/pageState';
import { SurfaceBlock } from '../../shared/ui/surfaceBlock';
import classes from './legalDocumentsPage.module.scss';

type PageStatus = 'loading' | 'success' | 'error';

const documentTypeLabels: Record<string, string> = {
  PUBLIC_LEGAL_DOCUMENT_TYPE_OFFER: 'Оферта',
  PUBLIC_LEGAL_DOCUMENT_TYPE_PERSONAL_DATA_PROCESSING_POLICY: 'Политика обработки персональных данных',
  PUBLIC_LEGAL_DOCUMENT_TYPE_PERSONAL_DATA_PROCESSING_CONSENT: 'Согласие на обработку персональных данных',
};

const documentTypeLabel = (type: string): string => (
  documentTypeLabels[type] ?? 'Юридические документы'
);

const documentOpenKey = (documentId: string, versionId?: string): string => (
  versionId ? `${documentId}:${versionId}` : documentId
);

const formatUpdatedAt = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Дата обновления не указана';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).format(date);
};

const messageFromError = (): string => 'Попробуйте ещё раз позже.';

export const LegalDocumentsPage = () => {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [groups, setGroups] = useState<LegalDocumentGroup[]>([]);
  const [error, setError] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<Record<string, LegalDocumentVersion[]>>({});
  const [historyDocument, setHistoryDocument] = useState<LegalDocument | null>(null);
  const [loadingVersionsId, setLoadingVersionsId] = useState<string | null>(null);
  const [versionsError, setVersionsError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      setGroups(await legalDocumentsService.listDocumentGroups());
      setStatus('success');
    } catch {
      setError(messageFromError());
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!historyDocument) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHistoryDocument(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [historyDocument]);

  const publishedGroups = useMemo(
    () => groups
      .map((group) => ({
        ...group,
        documents: group.documents.filter((document) => document.primaryVersion),
      }))
      .filter((group) => group.documents.length > 0),
    [groups],
  );

  const openDocument = async (legalDocument: LegalDocument, version?: LegalDocumentVersion) => {
    const openKey = documentOpenKey(legalDocument.id, version?.id);
    setOpeningId(openKey);
    setDocumentError('');

    // Открываем вкладку синхронно с кликом, чтобы браузер не заблокировал её как popup.
    const previewWindow = window.open('', '_blank');
    if (previewWindow) previewWindow.opener = null;

    try {
      const documentContent = version
        ? await legalDocumentsService.getDocumentVersionContent(legalDocument.id, version.id)
        : await legalDocumentsService.getDocumentContent(legalDocument.id);
      const url = URL.createObjectURL(createDocumentBlob(documentContent));

      if (isPdf(documentContent)) {
        if (previewWindow) {
          previewWindow.location.replace(url);
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        previewWindow?.close();
        const link = document.createElement('a');
        link.href = url;
        link.download = documentContent.fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      }
    } catch {
      previewWindow?.close();
      setDocumentError('Не удалось открыть документ. Попробуйте ещё раз позже.');
    } finally {
      setOpeningId(null);
    }
  };

  const openVersionHistory = async (legalDocument: LegalDocument) => {
    setHistoryDocument(legalDocument);
    setVersionsError('');

    if (versionHistory[legalDocument.id]) return;

    setLoadingVersionsId(legalDocument.id);
    try {
      const versions = await legalDocumentsService.listDocumentVersions(legalDocument.id);
      setVersionHistory((history) => ({ ...history, [legalDocument.id]: versions }));
    } catch {
      setVersionsError('Не удалось загрузить историю версий. Попробуйте ещё раз позже.');
    } finally {
      setLoadingVersionsId(null);
    }
  };

  return (
    <section className={classes.page} aria-labelledby="legal-documents-title">
      <div className={classes.heading}>
        <h1 id="legal-documents-title">Документы</h1>
      </div>

      {documentError && <p className={classes.documentError} role="alert">{documentError}</p>}
      {status === 'loading' && <LoadingState text="Загружаем документы…" />}
      {status === 'error' && (
        <ErrorState
          description={error}
          onRetry={() => void load()}
          title="Не удалось загрузить документы"
        />
      )}
      {status === 'success' && publishedGroups.length === 0 && (
        <EmptyState
          description="Опубликованных юридических документов пока нет."
          title="Документы пока отсутствуют"
        />
      )}
      {status === 'success' && publishedGroups.length > 0 && (
        <div className={classes.documents}>
          {publishedGroups.map((group) => (
            <section className={classes.group} key={group.type}>
              <div className={classes.groupDocuments}>
                {group.documents.map((document) => (
                  <SurfaceBlock className={classes.card} key={document.id}>
                    <div>
                      <h3>
                        <button
                          aria-label={`Открыть документ «${documentTypeLabel(document.type || group.type)}»`}
                          className={classes.documentTitle}
                          disabled={openingId === documentOpenKey(document.id)}
                          onClick={() => void openDocument(document)}
                          type="button"
                        >
                          {documentTypeLabel(document.type || group.type)}
                        </button>
                      </h3>
                      {document.description && <p>{document.description}</p>}
                      <p>Опубликован: {formatUpdatedAt(document.primaryVersion?.publishedAt ?? document.updatedAt)}</p>
                      {document.primaryVersion?.number && <p>Версия: {document.primaryVersion.number}</p>}
                      {document.primaryVersion?.fileName && <p>Файл: {document.primaryVersion.fileName}</p>}
                    </div>
                    <div className={classes.actions}>
                      <MyButton
                        isLoading={openingId === documentOpenKey(document.id)}
                        onClick={() => void openDocument(document)}
                      >
                        Открыть документ
                      </MyButton>
                      <MyButton
                        isLoading={loadingVersionsId === document.id}
                        onClick={() => void openVersionHistory(document)}
                      >
                        История версий
                      </MyButton>
                    </div>
                  </SurfaceBlock>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {historyDocument && (
        <div
          aria-label="Закрыть историю версий"
          className={classes.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHistoryDocument(null);
          }}
          role="presentation"
        >
          <section
            aria-labelledby="version-history-title"
            aria-modal="true"
            className={classes.modal}
            role="dialog"
          >
            <div className={classes.modalHeader}>
              <h2 id="version-history-title">История версий: {documentTypeLabel(historyDocument.type)}</h2>
              <button
                aria-label="Закрыть"
                className={classes.closeButton}
                onClick={() => setHistoryDocument(null)}
                type="button"
              >
                ×
              </button>
            </div>
            {loadingVersionsId === historyDocument.id && <LoadingState text="Загружаем версии…" />}
            {versionsError && <p className={classes.versionError} role="alert">{versionsError}</p>}
            {!loadingVersionsId && !versionsError && versionHistory[historyDocument.id] && (
              <ul className={classes.versionHistory}>
                {versionHistory[historyDocument.id].map((version) => (
                  <li key={version.id || `${version.number}-${version.publishedAt}`}>
                    <button
                      aria-label={`Открыть версию ${version.number}`}
                      className={classes.versionTitle}
                      disabled={!version.id || openingId === documentOpenKey(historyDocument.id, version.id)}
                      onClick={() => void openDocument(historyDocument, version)}
                      type="button"
                    >
                      Версия {version.number}
                    </button>
                    <span>Опубликована: {formatUpdatedAt(version.publishedAt)}</span>
                    {version.fileName && <span>Файл: {version.fileName}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  );
};
