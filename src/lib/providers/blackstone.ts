// src/lib/providers/blackstone.ts
import type { Provider, SearchRequest, ProviderOffer } from '$lib/providers/types';

function minutesBetween(isoStart: string, isoEnd: string) {
  const a = new Date(isoStart).getTime();
  const b = new Date(isoEnd).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}

const blackstone: Provider = {
  id: 'blackstone',

  async search(req: SearchRequest): Promise<ProviderOffer[]> {
    if (!req.origin || !req.destination || !req.depart) return [];

    // Horarios mock alternativos (salida 11:10, llegada 15:50 → 4h40m)
    const outDepart = `${req.depart}T11:10:00Z`;
    const outArrive = `${req.depart}T15:50:00Z`;

    const outSegments = [
      {
        origin: req.origin,
        destination: req.destination,
        carrier: 'BS',           // código ficticio para Blackstone
        flightNumber: 'BS 401',
        departTime: outDepart,
        arriveTime: outArrive,
        durationMin: minutesBetween(outDepart, outArrive)
      }
    ];

    const offer: ProviderOffer = {
      id: `blackstone-${req.origin}-${req.destination}-${req.depart}`,
      provider: 'blackstone',
      cabin: req.cabin ?? 'economy',
      bagsIncluded: Math.min(1, req.bags ?? 0),
      price: {
        currency: 'EUR',
        amountCents: 18900      // 189,00 €
      },
      out: {
        segments: outSegments,
        durationMin: outSegments.reduce((s, x) => s + (x.durationMin ?? 0), 0)
      },
      ...(req.trip === 'round' && req.return
        ? (() => {
            const retDepart = `${req.return}T17:45:00Z`;
            const retArrive = `${req.return}T22:20:00Z`;
            const retSegments = [
              {
                origin: req.destination,
                destination: req.origin,
                carrier: 'BS',
                flightNumber: 'BS 402',
                departTime: retDepart,
                arriveTime: retArrive,
                durationMin: minutesBetween(retDepart, retArrive)
              }
            ];
            return {
              ret: {
                segments: retSegments,
                durationMin: retSegments.reduce((s, x) => s + (x.durationMin ?? 0), 0)
              }
            };
          })()
        : {}),
      deepLink: `https://www.blackstone.am/` // luego sustituiremos con link con query
    };

    return [offer];
  }
};

export default blackstone;
