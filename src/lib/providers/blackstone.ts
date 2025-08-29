// src/lib/providers/blackstone.ts
import type { Provider, SearchRequest, ProviderOffer } from './types';

const blackstone: Provider = {
  id: 'blackstone',

  async search(req: SearchRequest): Promise<ProviderOffer[]> {
    // TODO (real): consultar https://www.blackstone.am/ y normalizar resultados.
    // Por ahora, devolvemos un stub vacío.
    return [];
  },

  async health() {
    return { ok: true, details: { site: 'https://www.blackstone.am' } };
  }
};

export default blackstone;
