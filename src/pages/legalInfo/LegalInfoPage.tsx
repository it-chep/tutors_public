import { useCallback, useEffect, useState } from 'react';
import { legalInfoService, LegalInfo } from '../../entities/legalInfo';
import { EmptyState, ErrorState, LoadingState } from '../../shared/ui/pageState';
import { SurfaceBlock } from '../../shared/ui/surfaceBlock';
import classes from './legalInfoPage.module.scss';

type PageStatus = 'loading' | 'success' | 'error';

const fields: Array<{ key: keyof LegalInfo; label: string }> = [
  { key: 'fullName', label: 'Полное наименование / ФИО ИП' },
  { key: 'inn', label: 'ИНН' },
  { key: 'ogrnip', label: 'ОГРНИП' },
  { key: 'registrationAddress', label: 'Адрес регистрации' },
  { key: 'email', label: 'Email' },
];

const messageFromError = (): string => 'Попробуйте ещё раз позже.';

export const LegalInfoPage = () => {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [legalInfo, setLegalInfo] = useState<LegalInfo | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');

    try {
      setLegalInfo(await legalInfoService.getLegalInfo());
      setStatus('success');
    } catch {
      setError(messageFromError());
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleFields = legalInfo
    ? fields.filter(({ key }) => Boolean(legalInfo[key].trim()))
    : [];

  return (
    <section className={classes.page} aria-labelledby="legal-info-title">
      <div className={classes.heading}>
        <h1 id="legal-info-title">Юридическая информация</h1>
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && (
        <ErrorState
          description={error}
          onRetry={() => void load()}
          title="Не удалось загрузить информацию"
        />
      )}
      {status === 'success' && visibleFields.length === 0 && (
        <EmptyState
          description="Юридические реквизиты пока не опубликованы. Пожалуйста, зайдите позже."
          title="Информация пока отсутствует"
        />
      )}
      {status === 'success' && visibleFields.length > 0 && legalInfo && (
        <SurfaceBlock className={classes.card}>
          <dl className={classes.list}>
            {visibleFields.map(({ key, label }) => (
              <div className={classes.item} key={key}>
                <dt>{label}</dt>
                <dd>
                  {key === 'email' ? <a href={`mailto:${legalInfo.email}`}>{legalInfo.email}</a> : legalInfo[key]}
                </dd>
              </div>
            ))}
          </dl>
        </SurfaceBlock>
      )}
    </section>
  );
};
