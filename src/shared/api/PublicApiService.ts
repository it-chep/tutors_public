import { PublicApiError } from './PublicApiError';

const debugEnabled = process.env.REACT_APP_DEBUG?.toLowerCase() === 'true';

const browserHostname = (): string => (
  typeof window === 'undefined' ? '' : window.location.hostname
);

const apiOrigin = (): string => {
  const configuredOrigin = process.env.REACT_APP_BACKEND_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, '');
  }

  return window.location.origin;
};

/**
 * В отладочной среде backend-контур выбирается явно через переменную окружения.
 * Во всех остальных случаях юридическая информация загружается для домена,
 * открытого пользователем в браузере.
 */
export const clientDomain = (): string => {
  const configuredDomain = process.env.REACT_APP_CLIENT_DOMAIN?.trim();

  return debugEnabled && configuredDomain ? configuredDomain : browserHostname();
};

export const publicEndpoint = (path: string): string => {
  const url = new URL(path, apiOrigin());
  const hostname = clientDomain();

  if (hostname) {
    url.searchParams.set('hostname', hostname);
  }

  return url.toString();
};

/**
 * Публичные запросы не передают JWT, adminId или другие сведения об
 * административном контуре. REACT_APP_BACKEND_URL направляет запросы
 * в отдельный backend origin в production.
 */
export const publicGet = async <T>(url: string): Promise<T> => {
  const endpoint = publicEndpoint(url);

  if (debugEnabled) {
    console.info('[public-api] Request', {
      method: 'GET',
      url: endpoint,
      hostname: clientDomain(),
    });
  }

  try {
    const response = await fetch(endpoint, { method: 'GET', credentials: 'same-origin' });

    if (debugEnabled) {
      console.info('[public-api] Response', {
        url: endpoint,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
      });
    }

    if (!response.ok) {
      throw new PublicApiError('Не удалось выполнить запрос. Попробуйте ещё раз позже.', response.status);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (debugEnabled) {
      console.error('[public-api] Request failed', {
        url: endpoint,
        hostname: clientDomain(),
        error,
      });
    }

    throw error;
  }
};
