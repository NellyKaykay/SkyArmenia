// src/lib/providers/aerocrs.ts
// AeroCRS provider adapter — implements the Provider interface.
// Calls the AeroCRS API v5 (getAvailability + getFares) via GET + query params
// and maps the response to the same offer shape used by
// flyone/blackstone & ResultsList.svelte.
//
// API notes:
//   - Method: GET with query string parameters
//   - Date format: yyyy/MM/dd
//   - getAvailability response path: data.aerocrs.flights.flight[]
//   - getFares response path: data.aerocrs.fares.fare[]
//   - Flight fields: fromcode, tocode, STD, STA, fltnum, airlineDesignator, classes
//   - Fare fields: fromCode, toCode, class, type, currency, adultFareOW, childFareOW, infantFareOW, tax1OW-tax4OW, notification

import type { Provider, SearchRequest, ProviderOffer } from '$lib/providers/types';
import {
	AEROCRS_AUTH_ID,
	AEROCRS_AUTH_PASSWORD,
	AEROCRS_BASE_URL
} from '$env/static/private';

/* ---------- constants ---------- */

const CLASS_CABIN_MAP: Record<string, 'economy' | 'business'> = {
	Y: 'economy', K: 'economy', M: 'economy', N: 'economy', T: 'economy',
	B: 'business', C: 'business'
};

const MAX_OFFERS = 30;

/* ---------- config ---------- */

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

/* ---------- date / time helpers ---------- */

/** Convert 'YYYY-MM-DD' → 'YYYY/MM/DD' (AeroCRS required format). */
function toAeroCrsDate(isoDate: string): string {
	return isoDate.replace(/-/g, '/');
}

/** Parse AeroCRS datetime "2026-06-15 07:00:00.000" → ISO string for the UI. */
function parseDateTime(dt: string): string {
	if (!dt) return '';
	return dt.replace(' ', 'T').replace(/\.000$/, '') + 'Z';
}

function minutesBetween(a: string, b: string): number {
	const da = new Date(a).getTime();
	const db = new Date(b).getTime();
	if (isNaN(da) || isNaN(db)) return 0;
	return Math.max(0, Math.round((db - da) / 60000));
}

/* ---------- segment mapping ---------- */

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

/* ---------- multi-stop segment reconstruction ---------- */

/**
 * Reconstruct ordered segments for a multi-stop flight.
 *
 * The API returns every board-alight combination for the same fltnum.
 * E.g. API401: LHR->CDG, CDG->MAD, LHR->MAD.
 * We need to pick only the consecutive leg segments (LHR->CDG, CDG->MAD)
 * for the user's requested origin->destination.
 */
function reconstructSegments(
	allFlightsForFltnum: any[],
	userOrigin: string,
	userDest: string
): ReturnType<typeof mapSegment>[] {
	if (allFlightsForFltnum.length <= 1) {
		return [mapSegment(allFlightsForFltnum[0])];
	}

	// Collect the earliest departure from each boarding point
	const airportDepTime = new Map<string, string>();
	for (const f of allFlightsForFltnum) {
		const existing = airportDepTime.get(f.fromcode);
		if (!existing || f.STD < existing) {
			airportDepTime.set(f.fromcode, f.STD);
		}
	}

	// Sort airports by their departure time to get route order
	const sortedAirports = [...airportDepTime.entries()]
		.sort((a, b) => a[1].localeCompare(b[1]))
		.map(([code]) => code);

	// Add final destinations not in fromcode set
	const allFromCodes = new Set(allFlightsForFltnum.map((f: any) => f.fromcode));
	for (const f of allFlightsForFltnum) {
		if (!allFromCodes.has(f.tocode) && !sortedAirports.includes(f.tocode)) {
			sortedAirports.push(f.tocode);
		}
	}

	// Find user's origin and destination in the route order
	const originIdx = sortedAirports.indexOf(userOrigin);
	const destIdx = sortedAirports.indexOf(userDest);

	if (originIdx === -1 || destIdx === -1 || originIdx >= destIdx) {
		// Fallback: return the through entry as single segment
		const through = allFlightsForFltnum.find(
			(f: any) => f.fromcode === userOrigin && f.tocode === userDest
		);
		return through ? [mapSegment(through)] : [mapSegment(allFlightsForFltnum[0])];
	}

	// If origin and destination are adjacent, it's a direct segment
	if (destIdx - originIdx === 1) {
		const direct = allFlightsForFltnum.find(
			(f: any) => f.fromcode === userOrigin && f.tocode === userDest
		);
		return direct ? [mapSegment(direct)] : [mapSegment(allFlightsForFltnum[0])];
	}

	// Build segments from consecutive airport pairs
	const segments: ReturnType<typeof mapSegment>[] = [];
	for (let i = originIdx; i < destIdx; i++) {
		const from = sortedAirports[i];
		const to = sortedAirports[i + 1];
		const entry = allFlightsForFltnum.find(
			(f: any) => f.fromcode === from && f.tocode === to
		);
		if (entry) {
			segments.push(mapSegment(entry));
		}
	}

	if (segments.length > 0) return segments;

	// Final fallback
	const through = allFlightsForFltnum.find(
		(f: any) => f.fromcode === userOrigin && f.tocode === userDest
	);
	return through ? [mapSegment(through)] : [mapSegment(allFlightsForFltnum[0])];
}

/* ---------- API calls ---------- */

/** Fetch ALL flights from AeroCRS getAvailability for a single date. */
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
	console.log('[AeroCRS] getAvailability GET →', url);

	const res = await fetch(url, { method: 'GET', headers: authHeaders });

	if (!res.ok) {
		const body = await res.text();
		console.error(`[AeroCRS] getAvailability failed [${res.status}]:`, body);
		return [];
	}

	const data = await res.json();
	const flightsWrapper = data?.aerocrs?.flights;
	if (!flightsWrapper || !data.aerocrs.success) return [];

	const flights = flightsWrapper.flight;
	return Array.isArray(flights) ? flights : flights ? [flights] : [];
}

/** Fetch fares from AeroCRS getFares for a route + date. */
async function fetchFares(
	baseUrl: string,
	authHeaders: Record<string, string>,
	origin: string,
	destination: string,
	date: string
): Promise<any[]> {
	const qs = new URLSearchParams({
		start: toAeroCrsDate(date),
		end: toAeroCrsDate(date),
		from: origin,
		to: destination
	});

	const url = `${baseUrl}/getFares?${qs.toString()}`;
	console.log('[AeroCRS] getFares GET →', url);

	const res = await fetch(url, { method: 'GET', headers: authHeaders });

	if (!res.ok) {
		console.error(`[AeroCRS] getFares failed [${res.status}]`);
		return [];
	}

	const data = await res.json();
	const faresWrapper = data?.aerocrs?.fares;
	if (!faresWrapper || !data.aerocrs.success) return [];

	const fares = faresWrapper.fare;
	return Array.isArray(fares) ? fares : fares ? [fares] : [];
}

/* ---------- fare helpers ---------- */

/** Index fares by "fromCode|toCode|class" for fast lookup. */
function indexFares(fares: any[]): Map<string, any[]> {
	const map = new Map<string, any[]>();
	for (const f of fares) {
		const key = `${f.fromCode}|${f.toCode}|${f.class}`;
		const arr = map.get(key) || [];
		arr.push(f);
		map.set(key, arr);
	}
	return map;
}

/** Calculate total price in cents for a fare given passenger counts. */
function calcPriceCents(
	fare: any,
	pax: { adults: number; children: number; infants: number }
): { amountCents: number; currency: string } {
	const adultBase = parseFloat(fare.adultFareOW || '0');
	const childBase = parseFloat(fare.childFareOW || '0');
	const infantBase = parseFloat(fare.infantFareOW || '0');
	const taxes =
		parseFloat(fare.tax1OW || '0') +
		parseFloat(fare.tax2OW || '0') +
		parseFloat(fare.tax3OW || '0') +
		parseFloat(fare.tax4OW || '0');

	const perAdult = adultBase + taxes;
	const perChild = childBase + taxes;
	const perInfant = infantBase;

	const total =
		perAdult * pax.adults +
		perChild * pax.children +
		perInfant * pax.infants;

	return {
		amountCents: Math.round(Math.max(0, total) * 100),
		currency: fare.currency || 'USD'
	};
}

/* ---------- direction offer builder ---------- */

interface DirectionOffer {
	fltnum: string;
	classCode: string;
	cabin: string;
	fareType: string;
	segments: ReturnType<typeof mapSegment>[];
	durationMin: number;
	price: { amountCents: number; currency: string };
	bagsIncluded: number;
	notification: string;
}

/**
 * Build direction-level offers (outbound or return) from raw flights + fares.
 * Returns an array of intermediate offers, one per flight/class/fareType combo.
 */
function buildDirectionOffers(
	allRawFlights: any[],
	origin: string,
	destination: string,
	fareIndex: Map<string, any[]>,
	pax: { adults: number; children: number; infants: number },
	requestedCabin?: string
): DirectionOffer[] {
	// Filter flights matching user's origin/destination
	const matchingFlights = allRawFlights.filter(
		(f: any) => f.fromcode === origin && f.tocode === destination
	);

	if (matchingFlights.length === 0) return [];

	// Group ALL raw flights by fltnum (needed for multi-stop segment reconstruction)
	const flightsByFltnum = new Map<string, any[]>();
	for (const f of allRawFlights) {
		const arr = flightsByFltnum.get(f.fltnum) || [];
		arr.push(f);
		flightsByFltnum.set(f.fltnum, arr);
	}

	const offers: DirectionOffer[] = [];

	for (const flight of matchingFlights) {
		const fltnum = flight.fltnum;
		const allForFltnum = flightsByFltnum.get(fltnum) || [flight];

		// Reconstruct segments (handles multi-stop)
		const segments = reconstructSegments(allForFltnum, origin, destination);
		const totalDuration = segments.length > 0
			? minutesBetween(segments[0].departTime, segments[segments.length - 1].arriveTime)
			: 0;

		// Iterate over available class codes
		const classes = flight.classes || {};
		for (const [classCode, seatCount] of Object.entries(classes)) {
			if (typeof seatCount !== 'number' || seatCount <= 0) continue;
			if (classCode === 'TESTCODE') continue;

			const cabin = CLASS_CABIN_MAP[classCode] || 'economy';
			if (requestedCabin && cabin !== requestedCabin) continue;

			// Look up fares
			const fareKey = `${origin}|${destination}|${classCode}`;
			const matchingFares = fareIndex.get(fareKey) || [];

			if (matchingFares.length === 0) {
				// No fare found — show flight with zero price
				offers.push({
					fltnum,
					classCode,
					cabin,
					fareType: '',
					segments,
					durationMin: totalDuration,
					price: { amountCents: 0, currency: 'USD' },
					bagsIncluded: 0,
					notification: ''
				});
			} else {
				// One offer per fare type (branded fares)
				for (const fare of matchingFares) {
					const price = calcPriceCents(fare, pax);
					const bagsIncluded = extractBagsIncluded(fare.notification);
					offers.push({
						fltnum,
						classCode,
						cabin,
						fareType: fare.type || '',
						segments,
						durationMin: totalDuration,
						price,
						bagsIncluded,
						notification: fare.notification || ''
					});
				}
			}
		}
	}

	return offers;
}

/** Extract number of included bags from fare notification text. */
function extractBagsIncluded(notification: string): number {
	if (!notification) return 0;
	if (/no\s*(checked\s*)?bag/i.test(notification)) return 0;
	if (/\d+\s*kg/i.test(notification)) return 1;
	if (/\bbag/i.test(notification)) return 1;
	return 0;
}

/* ---------- provider ---------- */

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
		const pax = {
			adults: req.passengers.adults,
			children: req.passengers.children ?? 0,
			infants: req.passengers.infants ?? 0
		};
		const requestedCabin = req.cabin || undefined;

		// --- Fetch outbound flights + fares in parallel ---
		const [outRawFlights, outFares] = await Promise.all([
			fetchFlights(baseUrl, authHeaders, req.origin, req.destination, req.depart, pax, 'Economy'),
			fetchFares(baseUrl, authHeaders, req.origin, req.destination, req.depart)
		]);

		const outFareIndex = indexFares(outFares);
		const outOffers = buildDirectionOffers(
			outRawFlights, req.origin, req.destination, outFareIndex, pax, requestedCabin
		);

		if (outOffers.length === 0) return [];

		// --- Return direction (round-trip only) ---
		let retOffers: DirectionOffer[] = [];
		if (req.trip === 'round' && req.return) {
			const [retRawFlights, retFares] = await Promise.all([
				fetchFlights(baseUrl, authHeaders, req.destination, req.origin, req.return, pax, 'Economy'),
				fetchFares(baseUrl, authHeaders, req.destination, req.origin, req.return)
			]);

			const retFareIndex = indexFares(retFares);
			retOffers = buildDirectionOffers(
				retRawFlights, req.destination, req.origin, retFareIndex, pax, requestedCabin
			);
		}

		// --- Build final offers in ResultsList.svelte UI shape ---
		const offers: ProviderOffer[] = [];
		let idx = 0;

		if (req.trip !== 'round' || retOffers.length === 0) {
			// One-way or no return flights found
			for (const out of outOffers) {
				if (offers.length >= MAX_OFFERS) break;
				offers.push(buildFinalOffer(out, undefined, req.depart, idx++) as any);
			}
		} else {
			// Round trip: pair by same (classCode, fareType) to avoid cartesian explosion
			const retByKey = new Map<string, DirectionOffer[]>();
			for (const ret of retOffers) {
				const key = `${ret.classCode}|${ret.fareType}`;
				const arr = retByKey.get(key) || [];
				arr.push(ret);
				retByKey.set(key, arr);
			}

			for (const out of outOffers) {
				if (offers.length >= MAX_OFFERS) break;
				const key = `${out.classCode}|${out.fareType}`;
				const matchingRets = retByKey.get(key) || [];

				if (matchingRets.length === 0) {
					// No matching return — try same cabin at least
					const sameCabinRet = retOffers.find(r => r.cabin === out.cabin);
					offers.push(buildFinalOffer(out, sameCabinRet, req.depart, idx++) as any);
				} else {
					for (const ret of matchingRets) {
						if (offers.length >= MAX_OFFERS) break;
						offers.push(buildFinalOffer(out, ret, req.depart, idx++) as any);
					}
				}
			}
		}

		console.log(`[AeroCRS] returning ${offers.length} offer(s)`);
		return offers;
	}
};

/** Build the final UI-shaped offer from outbound (+ optional return) direction offers. */
function buildFinalOffer(
	out: DirectionOffer,
	ret: DirectionOffer | undefined,
	departDate: string,
	idx: number
): Record<string, any> {
	const combinedPrice = ret
		? {
				amountCents: out.price.amountCents + ret.price.amountCents,
				currency: out.price.currency
			}
		: out.price;

	const offer: Record<string, any> = {
		id: `aerocrs-${out.fltnum}-${out.classCode}-${out.fareType || 'std'}-${departDate}-${idx}`,
		provider: 'aerocrs',
		cabin: out.cabin,
		bagsIncluded: out.bagsIncluded,
		fareType: out.fareType || undefined,
		notification: out.notification || undefined,
		price: combinedPrice,
		out: {
			segments: out.segments,
			durationMin: out.durationMin
		},
		deepLink: 'https://booking.aerocrs.com/'
	};

	if (ret) {
		offer.ret = {
			segments: ret.segments,
			durationMin: ret.durationMin
		};
	}

	return offer;
}

export default aerocrs;
