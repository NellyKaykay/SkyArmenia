// src/lib/providers/flyone.ts
import type { Provider, SearchRequest, ProviderOffer } from '$lib/providers/types';

function minutesBetween(isoStart: string, isoEnd: string) {
  const a = new Date(isoStart).getTime();
  const b = new Date(isoEnd).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}

const flyone: Provider = {
  id: 'flyone',

  async search(req: SearchRequest): Promise<ProviderOffer[]> {
    // Si el origen/destino no están completos, sin resultados
    if (!req.origin || !req.destination || !req.depart) return [];

    // Horarios mock sencillos (salida 09:00, llegada 13:30 → 4h30m)
    const outDepart = `${req.depart}T09:00:00Z`;
    const outArrive = `${req.depart}T13:30:00Z`;

    const outSegments = [
      {
        origin: req.origin,
        destination: req.destination,
        carrier: '5F',                       // FlyOne IATA
        flightNumber: '5F 701',
        departTime: outDepart,
        arriveTime: outArrive,
        durationMin: minutesBetween(outDepart, outArrive)
      }
    ];

    const offer: ProviderOffer = {
      id: `flyone-${req.origin}-${req.destination}-${req.depart}`,
      provider: 'flyone',
      cabin: req.cabin ?? 'economy',
      bagsIncluded: Math.min(1, req.bags ?? 0),
      price: {
        currency: 'EUR',
        amountCents: 19900                  // 199,00 €
      },
      out: {
        segments: outSegments,
        durationMin: outSegments.reduce((s, x) => s + (x.durationMin ?? 0), 0)
      },
      // Itinerario de vuelta si es round
      ...(req.trip === 'round' && req.return
        ? (() => {
            const retDepart = `${req.return}T15:30:00Z`;
            const retArrive = `${req.return}T20:00:00Z`;
            const retSegments = [
              {
                origin: req.destination,
                destination: req.origin,
                carrier: '5F',
                flightNumber: '5F 702',
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
      deepLink: `https://flyone.eu/` // luego lo sustituiremos por el link real con query
    };

    return [offer];
  }
};

export default flyone;
