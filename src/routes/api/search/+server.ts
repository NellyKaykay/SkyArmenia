// src/routes/api/search/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import type { SearchRequest, ProviderBatchResult, AggregatedSearchResponse, TripType, Cabin } from '$lib/providers/types';
import flyone from '$lib/providers/flyone';
import blackstone from '$lib/providers/blackstone';

function asTripType(v: string | null): TripType {
  return v === 'oneway' ? 'oneway' : 'round';
}
function asCabin(v: string | null): Cabin | undefined {
  if (!v) return undefined;
  if (v === 'economy' || v === 'premium_economy' || v === 'business') return v;
  return undefined;
}
function asInt(v: string | null, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : d;
}

export const GET: RequestHandler = async ({ url }) => {
  const origin = (url.searchParams.get('origin') || '').toUpperCase().trim();
  const destination = (url.searchParams.get('destination') || '').toUpperCase().trim();
  const depart = (url.searchParams.get('depart') || '').trim();
  const ret = (url.searchParams.get('return') || '').trim();
  const trip = asTripType(url.searchParams.get('trip'));
  const adults = asInt(url.searchParams.get('adults'), 1) || 1;
  const children = asInt(url.searchParams.get('children'), 0);
  const infants = asInt(url.searchParams.get('infants'), 0);
  const bags = asInt(url.searchParams.get('bags'), 0);
  const cabin = asCabin(url.searchParams.get('cabin'));

  // Validación mínima
  if (!origin || !destination || !depart) {
    return json({ ok: false, error: 'origin, destination y depart son obligatorios' }, { status: 400 });
  }
  if (trip === 'round' && !ret) {
    return json({ ok: false, error: "return es obligatorio cuando trip='round'" }, { status: 400 });
  }

  const req: SearchRequest = {
    origin,
    destination,
    depart,
    return: trip === 'round' ? ret : undefined,
    trip,
    cabin,
    passengers: { adults, children, infants },
    bags
  };

  const providers = [flyone, blackstone];
  const started = Date.now();

  const promises = providers.map(async (p): Promise<ProviderBatchResult> => {
    const t0 = Date.now();
    try {
      const offers = await p.search(req);
      return {
        provider: p.id,
        durationMs: Date.now() - t0,
        offers
      };
    } catch (err) {
      return {
        provider: p.id,
        durationMs: Date.now() - t0,
        offers: [],
        error: (err as Error)?.message || 'provider error'
      };
    }
  });

  const results = await Promise.all(promises);
  const totalOffers = results.reduce((sum, r) => sum + r.offers.length, 0);
  const resp: AggregatedSearchResponse = {
    ok: true,
    query: req,
    results,
    totalOffers,
    tookMs: Date.now() - started
  };

  return json(resp);
};
