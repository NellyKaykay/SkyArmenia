// src/lib/providers/aerocrs.ts
// AeroCRS provider adapter — implements the Provider interface.
// Calls the AeroCRS API v5 (getAvailability) via GET + query params
// and maps the response to the same offer shape used by
// flyone/blackstone & ResultsList.svelte.
//
// API notes:
//   - Method: GET with query string parameters
//   - Date format: yyyy/MM/dd
//   - Response path: data.aerocrs.flights.flight[]
//   - Flight fields: fromcode, tocode, STD, STA, fltnum, airlineDesignator, classes
//   - getAvailability does NOT return prices, only seat availability

import type { Provider, SearchRequest, ProviderOffer } from '$lib/providers/types';
import {
	AEROCRS_AUTH_ID,
	AEROCRS_AUTH_PASSWORD,
	AEROCRS_BASE_URL
} from '$env/static/private';

function getConfig() {
	if (!AEROCRS_AUTH_ID || !AEROCRS_AUTH_PASSWORD || !AEROCRS_BASE_URL) {
		throw new Error(
			'AeroCRS: missing environment variables (AEROCRS_AUTH_ID, AEROCRS_AUTH_PASSWORD, AEROCRS_BASE_URL)'
		);
	}
	return {
		baseUrl: AEROCRS_BASE_URL.replace(/\/+$/, ''),
		authHeaders: {
			accept: 'application/json',
			auth_id: AEROCRS_AUTH_ID,
			auth_password: AEROCRS_AUTH_PASSWORD
		}
	};
}

/** Convert 'YYYY-MM-DD' → 'YYYY/MM/DD' (AeroCRS required format). */
function toAeroCrsDate(isoDate: string): string {
	return isoDate.replace(/-/g, '/');
}

/** Parse AeroCRS datetime "2026-06-15 07:00:00.000" → ISO string for the UI. */
function parseDateTime(dt: string): string {
	if (!dt) return '';
	// Replace space with 'T' and trim milliseconds, add Z for UTC
	return dt.replace(' ', 'T').replace(/\.000$/, '') + 'Z';
}

function minutesBetween(a: string, b: string): number {
	const da = new Date(a).getTime();
	const db = new Date(b).getTime();
	if (isNaN(da) || isNaN(db)) return 0;
	return Math.max(0, Math.round((db - da) / 60000));
}

/** Map an AeroCRS flight object to the segment shape used by ResultsList.svelte. */
function mapSegment(f: any) {
	const departTime = parseDateTime(f.STD);
	const arriveTime = parseDateTime(f.STA);

	return {
		origin: f.fromcode || '',
		destination: f.tocode || '',
		carrier: f.airlineDesignator || '',
		flightNumber: f.fltnum || '',
		departTime,
		arriveTime,
		durationMin: departTime && arriveTime ? minutesBetween(departTime, arriveTime) : 0
	};
}

/** Fetch flights from AeroCRS getAvailability for a single date/direction. */
async function fetchFlights(
	baseUrl: string,
	authHeaders: Record<string, string>,
	origin: string,
	destination: string,
	date: string,
	passengers: { adults: number; children: number; infants: number },
	cabin: string
): Promise<any[]> {
	const qs = new URLSearchParams({
		start: toAeroCrsDate(date),
		end: toAeroCrsDate(date),
		origin,
		destination,
		adt: String(passengers.adults),
		chd: String(passengers.children),
		inf: String(passengers.infants),
		cabin
	});

	const url = `${baseUrl}/getAvailability?${qs.toString()}`;
	console.log('[AeroCRS] GET →', url);

	const res = await fetch(url, {
		method: 'GET',
		headers: authHeaders
	});

	if (!res.ok) {
		const body = await res.text();
		console.error(`[AeroCRS] getAvailability failed [${res.status}]:`, body);
		return [];
	}

	const data = await res.json();

	// Response structure: { aerocrs: { success, flights: { count, flight: [...] } } }
	const flightsWrapper = data?.aerocrs?.flights;
	if (!flightsWrapper || !data.aerocrs.success) return [];

	const flights = flightsWrapper.flight;
	return Array.isArray(flights) ? flights : flights ? [flights] : [];
}

const aerocrs: Provider = {
	id: 'aerocrs',

	async search(req: SearchRequest): Promise<ProviderOffer[]> {
		if (!req.origin || !req.destination || !req.depart) return [];

		let config: ReturnType<typeof getConfig>;
		try {
			config = getConfig();
		} catch {
			console.warn('[AeroCRS] provider skipped: missing credentials');
			return [];
		}

		const { baseUrl, authHeaders } = config;
		const cabin = req.cabin === 'business' ? 'Business' : 'Economy';
		const pax = {
			adults: req.passengers.adults,
			children: req.passengers.children ?? 0,
			infants: req.passengers.infants ?? 0
		};

		// --- Outbound flights ---
		const outFlights = await fetchFlights(
			baseUrl, authHeaders, req.origin, req.destination, req.depart, pax, cabin
		);

		if (outFlights.length === 0) return [];

		// --- Return flights (round-trip only) ---
		let retFlights: any[] = [];
		if (req.trip === 'round' && req.return) {
			retFlights = await fetchFlights(
				baseUrl, authHeaders, req.destination, req.origin, req.return, pax, cabin
			);
		}

		// --- Build offers matching ResultsList.svelte shape ---
		const offers: ProviderOffer[] = [];

		for (let i = 0; i < outFlights.length; i++) {
			const outFlight = outFlights[i];
			const outSeg = mapSegment(outFlight);

			const offer: any = {
				id: `aerocrs-${outFlight.fltnum || i}-${req.depart}-${i}`,
				provider: 'aerocrs',
				cabin: cabin.toLowerCase(),
				bagsIncluded: 0,
				price: {
					currency: 'EUR',
					amountCents: 0  // AeroCRS getAvailability does not return prices
				},
				out: {
					segments: [outSeg],
					durationMin: outSeg.durationMin
				},
				deepLink: `https://booking.aerocrs.com/`
			};

			// Pair with a return flight if available
			if (retFlights.length > 0) {
				const retFlight = retFlights[Math.min(i, retFlights.length - 1)];
				const retSeg = mapSegment(retFlight);

				offer.ret = {
					segments: [retSeg],
					durationMin: retSeg.durationMin
				};
			}

			offers.push(offer);
		}

		console.log(`[AeroCRS] returning ${offers.length} offer(s)`);
		return offers;
	}
};

export default aerocrs;
