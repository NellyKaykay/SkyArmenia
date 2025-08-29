// src/routes/api/search/+server.ts
import type { RequestHandler } from './$types';

type TripKind = 'oneway' | 'round';

function toInt(v: string | null, def = 0) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : def;
}

export const GET: RequestHandler = async ({ url }) => {
  const origin = (url.searchParams.get('origin') || 'BCN').toUpperCase();
  const destination = (url.searchParams.get('destination') || 'EVN').toUpperCase();
  const depart = url.searchParams.get('depart') || '';      // YYYY-MM-DD
  const ret = url.searchParams.get('return') || '';         // YYYY-MM-DD (solo round)
  const trip = (url.searchParams.get('trip') as TripKind) || 'round';
  const adults = toInt(url.searchParams.get('adults'), 1);
  const bags = toInt(url.searchParams.get('bags'), 0);

  // Validación mínima
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid IATA code(s)' }), { status: 400 });
  }
  if (!depart) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing depart date (YYYY-MM-DD)' }), { status: 400 });
  }
  if (trip === 'round' && !ret) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing return date for round trip' }), { status: 400 });
  }

  // 🔧 Stub de resultados (mientras conectamos FlyOne/Blackstone)
  const sample = [
    {
      id: 'stub-flyone-1',
      airline: 'FlyOne',
      from: origin,
      to: destination,
      depart: `${depart}T10:25:00`,
      arrive: `${depart}T16:05:00`,
      duration: '5h 40m',
      bags_included: 0,
      price: { amount: 17900, currency: 'EUR' } // en céntimos
    },
    ...(trip === 'round'
      ? [{
          id: 'stub-flyone-2',
          airline: 'FlyOne',
          from: destination,
          to: origin,
          depart: `${ret}T12:10:00`,
          arrive: `${ret}T17:40:00`,
          duration: '5h 30m',
          bags_included: 0,
          price: { amount: 16500, currency: 'EUR' }
        }]
      : [])
  ];

  const payload = {
    ok: true,
    query: { origin, destination, depart, return: ret, trip, adults, bags },
    meta: { currency: 'EUR', count: sample.length },
    results: sample
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
};
