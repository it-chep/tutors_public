import { publicGet } from '../../../shared/api';
import { LegalInfo } from '../model/types';

type ApiLegalInfo = Partial<LegalInfo>;

const toValue = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

const normalizeLegalInfo = (source: ApiLegalInfo | undefined): LegalInfo => ({
  fullName: toValue(source?.fullName),
  inn: toValue(source?.inn),
  ogrnip: toValue(source?.ogrnip),
  registrationAddress: toValue(source?.registrationAddress),
  email: toValue(source?.email),
});

class LegalInfoService {
  getLegalInfo = async (): Promise<LegalInfo> => {
    const response = await publicGet<{ legalInfo?: ApiLegalInfo }>('/api/v1/public/legal-info');
    return normalizeLegalInfo(response.legalInfo);
  };
}

export const legalInfoService = new LegalInfoService();
