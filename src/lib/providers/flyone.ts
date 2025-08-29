// src/lib/providers/flyone.ts
import type { Provider, SearchRequest, ProviderOffer } from './types';

const flyone: Provider = {
  id: 'flyone',

  async search(req: SearchRequest): Promise<ProviderOffer[]> {
    // TODO (real): consultar https://flyone.eu/ y normalizar resultados.
    // De momento, devolvemos un array vacío como stub.
    return [];
  },

  async health() {
    return { ok: true, details: { site: 'https://flyone.eu' } };
  }
};

export default flyone;
