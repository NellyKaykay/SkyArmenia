// src/lib/providers/aerocrs.ts
// AeroCRS provider adapter — implements the Provider interface.
// Calls the AeroCRS API v5 (getAvailability + getFares) via GET + query params
// and maps the response to the same offer shape used by
// blackstone & ResultsList.svelte.
//
// API notes:
//   - Method: GET with query string parameters
//   - Date format: yyyy/MM/dd
//   - getAvailability response path: data.aerocrs.flights.flight[]
//   - getFares response path: data.aerocrs.fares.fare[]
//   - Flight fields: fromcode, tocode, STD, STA, fltnum, airlineDesignator, classes
//   - Fare fields: fromCode, toCode, class, type, currency, adultFareOW, childFareOW, infantFareOW, tax1OW-tax4OW, notification

import type { Provider, SearchRequest, ProviderOffer } from '$lib/providers/types';
import { getAeroCrsConfig } from '$lib/server/aerocrs-config';

/* ---------- constants ---------- */

const CLASS_CABIN_MAP: Record<string, 'economy' | 'business'> = {
	Y: 'economy', K: 'economy', M: 'economy', N: 'economy', T: 'economy',
	B: 'business', C: 'business'
};

const MAX_OFFERS = 30;

/* ---------- config ---------- */

function getConfig() {
	const config = getAeroCrsConfig();
	return {
		baseUrl: config.baseUrl,
		authHeaders: {
			accept: config.authHeaders.accept,
			auth_id: config.authHeaders.auth_id,
			auth_password: config.authHeaders.auth_password
		},
		environment: config.environment
	};
}

/* ---------- debug logging helpers ---------- */

function maskSecret(value: string): string {
	if (!value) return '(empty)';
	if (value.length <= 4) return '***';
	return value.slice(0, 4) + '***';
}

function ts(): string {
	return new Date().toISOString();
}

/** Collects structured log entries for a single search request. */
interface DebugLogEntry {
	time: string;
	label: string;
	data: Record<string, any>;
}

function createDebugLog() {
	const entries: DebugLogEntry[] = [];
	return {
		add(label: string, data: Record<string, any>) {
			const entry = { time: ts(), label, data };
			entries.push(entry);
			console.log(`[AeroCRS:DEBUG] [${entry.time}] ${label}`, JSON.stringify(data, null, 2));
		},
		dump() {
			console.log(
				'\n========== [AeroCRS:DEBUG] FULL SEARCH LOG ==========\n' +
				JSON.stringify(entries, null, 2) +
				'\n========== [AeroCRS:DEBUG] END ==========\n'
			);
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
	cabin: string,
	log?: ReturnType<typeof createDebugLog>
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

	console.log('[AeroCRS:DEBUG] REQUEST URL:', url);
	log?.add('getAvailability REQUEST', {
		method: 'GET',
		url,
		auth_id: maskSecret(authHeaders.auth_id || ''),
		params: { origin, destination, date, passengers, cabin }
	});

	const res = await fetch(url, { method: 'GET', headers: authHeaders });
	const rawBody = await res.text();
	console.log('[AeroCRS:DEBUG] RESPONSE:', rawBody);

	const responseHeaders: Record<string, string> = {};
	res.headers.forEach((v, k) => { responseHeaders[k] = v; });

	if (!res.ok) {
		log?.add('getAvailability RESPONSE ERROR', {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders,
			body: rawBody
		});
		console.error(`[AeroCRS] getAvailability failed [${res.status}]:`, rawBody);
		return [];
	}

	let data: any;
	try {
		data = JSON.parse(rawBody);
	} catch {
		log?.add('getAvailability PARSE ERROR', { rawBody });
		return [];
	}

	log?.add('getAvailability RESPONSE OK', {
		status: res.status,
		headers: responseHeaders,
		success: data?.aerocrs?.success,
		flightCount: Array.isArray(data?.aerocrs?.flights?.flight)
			? data.aerocrs.flights.flight.length
			: data?.aerocrs?.flights?.flight ? 1 : 0,
		fullResponseBody: data
	});

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
	date: string,
	log?: ReturnType<typeof createDebugLog>
): Promise<any[]> {
	const qs = new URLSearchParams({
		start: toAeroCrsDate(date),
		end: toAeroCrsDate(date),
		from: origin,
		to: destination
	});

	const url = `${baseUrl}/getFares?${qs.toString()}`;

	console.log('[AeroCRS:DEBUG] REQUEST URL:', url);
	log?.add('getFares REQUEST', {
		method: 'GET',
		url,
		auth_id: maskSecret(authHeaders.auth_id || ''),
		params: { origin, destination, date }
	});

	const res = await fetch(url, { method: 'GET', headers: authHeaders });
	const rawBody = await res.text();
	console.log('[AeroCRS:DEBUG] RESPONSE:', rawBody);

	const responseHeaders: Record<string, string> = {};
	res.headers.forEach((v, k) => { responseHeaders[k] = v; });

	if (!res.ok) {
		log?.add('getFares RESPONSE ERROR', {
			status: res.status,
			statusText: res.statusText,
			headers: responseHeaders,
			body: rawBody
		});
		console.error(`[AeroCRS] getFares failed [${res.status}]`);
		return [];
	}

	let data: any;
	try {
		data = JSON.parse(rawBody);
	} catch {
		log?.add('getFares PARSE ERROR', { rawBody });
		return [];
	}

	const faresWrapper = data?.aerocrs?.fares;
	if (!faresWrapper || !data.aerocrs.success) {
		log?.add('getFares RESPONSE — no fares or success=false', {
			status: res.status,
			headers: responseHeaders,
			success: data?.aerocrs?.success,
			fullResponseBody: data
		});
		return [];
	}

	const fares = faresWrapper.fare;
	const result = Array.isArray(fares) ? fares : fares ? [fares] : [];

	// --- Fare field analysis (public vs agent pricing) ---
	if (result.length > 0) {
		const allKeys = new Set<string>();
		for (const f of result) {
			for (const k of Object.keys(f)) allKeys.add(k);
		}

		// Flag fields that may indicate agent vs public pricing
		const pricingIndicators = [...allKeys].filter(k =>
			/agent|public|net|markup|commission|wholesale|retail|private|discount/i.test(k)
		);

		const fareSummary = result.map((f: any) => ({
			class: f.class,
			type: f.type,
			currency: f.currency,
			adultFareOW: f.adultFareOW,
			childFareOW: f.childFareOW,
			infantFareOW: f.infantFareOW,
			adultFareRT: f.adultFareRT,
			childFareRT: f.childFareRT,
			infantFareRT: f.infantFareRT,
			tax1OW: f.tax1OW, tax2OW: f.tax2OW, tax3OW: f.tax3OW, tax4OW: f.tax4OW,
			tax1RT: f.tax1RT, tax2RT: f.tax2RT, tax3RT: f.tax3RT, tax4RT: f.tax4RT,
			notification: f.notification
		}));

		log?.add('getFares RESPONSE OK — FARE ANALYSIS', {
			status: res.status,
			headers: responseHeaders,
			totalFares: result.length,
			allFareFieldNames: [...allKeys].sort(),
			pricingIndicatorFields: pricingIndicators.length > 0 ? pricingIndicators : '(none found)',
			fareSummary,
			fullResponseBody: data
		});
	} else {
		log?.add('getFares RESPONSE OK — 0 fares', {
			status: res.status,
			headers: responseHeaders,
			fullResponseBody: data
		});
	}

	return result;
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

/**
 * Calculate total price in cents for a fare given passenger counts.
 * When `useRT` is true and the fare contains round-trip fields (adultFareRT,
 * tax1RT…), those values are used instead of the one-way (OW) fields.
 * This avoids the mismatch with Blackstone, which uses RT pricing.
 */
function calcPriceCents(
	fare: any,
	pax: { adults: number; children: number; infants: number },
	useRT = false
): { amountCents: number; currency: string } {
	// Prefer RT fields when requested and available; fall back to OW
	const hasRT = useRT && (fare.adultFareRT != null || fare.tax1RT != null);
	const suffix = hasRT ? 'RT' : 'OW';

	const adultBase = parseFloat(fare[`adultFare${suffix}`] || fare.adultFareOW || '0');
	const childBase = parseFloat(fare[`childFare${suffix}`] || fare.childFareOW || '0');
	const infantBase = parseFloat(fare[`infantFare${suffix}`] || fare.infantFareOW || '0');
	const taxes =
		parseFloat(fare[`tax1${suffix}`] || fare.tax1OW || '0') +
		parseFloat(fare[`tax2${suffix}`] || fare.tax2OW || '0') +
		parseFloat(fare[`tax3${suffix}`] || fare.tax3OW || '0') +
		parseFloat(fare[`tax4${suffix}`] || fare.tax4OW || '0');

	const perAdult = adultBase + taxes;
	const perChild = childBase + taxes;
	const perInfant = infantBase;

	const total =
		perAdult * pax.adults +
		perChild * pax.children +
		perInfant * pax.infants;

	console.log(`[AeroCRS] calcPriceCents (${suffix}): adult=${adultBase} taxes=${taxes} total=${total} pax=${JSON.stringify(pax)}`);

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
 * When `useRT` is true, fare calculation uses round-trip pricing fields.
 */
function buildDirectionOffers(
	allRawFlights: any[],
	origin: string,
	destination: string,
	fareIndex: Map<string, any[]>,
	pax: { adults: number; children: number; infants: number },
	requestedCabin?: string,
	useRT = false
): { offers: DirectionOffer[]; usedRT: boolean } {
	// Filter flights matching user's origin/destination
	const matchingFlights = allRawFlights.filter(
		(f: any) => f.fromcode === origin && f.tocode === destination
	);

	if (matchingFlights.length === 0) return { offers: [], usedRT: false };

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
					const price = calcPriceCents(fare, pax, useRT);
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

	// Deduplicate: same physical flight + same fare type → keep cheapest
	const dedupMap = new Map<string, DirectionOffer>();
	for (const offer of offers) {
		const key = `${offer.fltnum}|${offer.fareType}`;
		const existing = dedupMap.get(key);
		if (!existing || offer.price.amountCents < existing.price.amountCents) {
			dedupMap.set(key, offer);
		}
	}

	// Detect whether RT fares were actually used
	const usedRT = useRT && [...fareIndex.values()].flat().some(
		(f: any) => f.adultFareRT != null || f.tax1RT != null
	);

	return { offers: [...dedupMap.values()], usedRT };
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

		const { baseUrl, authHeaders, environment } = config;
		const log = createDebugLog();

		console.log('[AeroCRS:DEBUG] SEARCH PARAMS:', JSON.stringify({
			origin: req.origin,
			destination: req.destination,
			depart: req.depart,
			return: req.return,
			trip: req.trip,
			cabin: req.cabin,
			passengers: req.passengers,
			bags: req.bags
		}));

		log.add('SEARCH START', {
			environment,
			baseUrl,
			auth_id: maskSecret(authHeaders.auth_id || ''),
			auth_password: maskSecret(authHeaders.auth_password || ''),
			request: {
				origin: req.origin,
				destination: req.destination,
				depart: req.depart,
				return: req.return,
				trip: req.trip,
				cabin: req.cabin,
				passengers: req.passengers,
				bags: req.bags
			}
		});

		const pax = {
			adults: req.passengers.adults,
			children: req.passengers.children ?? 0,
			infants: req.passengers.infants ?? 0
		};
		const requestedCabin = req.cabin || undefined;

		// --- Fetch outbound flights + fares in parallel ---
		const [outRawFlights, outFares] = await Promise.all([
			fetchFlights(baseUrl, authHeaders, req.origin, req.destination, req.depart, pax, 'Economy', log),
			fetchFares(baseUrl, authHeaders, req.origin, req.destination, req.depart, log)
		]);

		const isRound = req.trip === 'round' && !!req.return;
		const outFareIndex = indexFares(outFares);
		const { offers: outOffers, usedRT: outUsedRT } = buildDirectionOffers(
			outRawFlights, req.origin, req.destination, outFareIndex, pax, requestedCabin, isRound
		);

		if (outOffers.length === 0) {
			log.add('SEARCH END — no outbound offers', { offerCount: 0 });
			log.dump();
			return [];
		}

		// --- Return direction (round-trip only) ---
		let retOffers: DirectionOffer[] = [];
		if (req.trip === 'round' && req.return) {
			const [retRawFlights, retFares] = await Promise.all([
				fetchFlights(baseUrl, authHeaders, req.destination, req.origin, req.return, pax, 'Economy', log),
				fetchFares(baseUrl, authHeaders, req.destination, req.origin, req.return, log)
			]);

			const retFareIndex = indexFares(retFares);
			// Return direction: use OW fares (RT price already covered by outbound when available)
			const retResult = buildDirectionOffers(
				retRawFlights, req.destination, req.origin, retFareIndex, pax, requestedCabin, false
			);
			retOffers = retResult.offers;
		}

		// --- Build final offers in ResultsList.svelte UI shape ---
		const offers: ProviderOffer[] = [];
		let idx = 0;

		if (req.trip !== 'round' || retOffers.length === 0) {
			// One-way or no return flights found
			for (const out of outOffers) {
				if (offers.length >= MAX_OFFERS) break;
				offers.push(buildFinalOffer(out, undefined, req.depart, idx++, req, false) as any);
			}
		} else {
			// Round trip: pair by fareType (classCode already deduped in buildDirectionOffers)
			const retByKey = new Map<string, DirectionOffer[]>();
			for (const ret of retOffers) {
				const key = ret.fareType;
				const arr = retByKey.get(key) || [];
				arr.push(ret);
				retByKey.set(key, arr);
			}

			for (const out of outOffers) {
				if (offers.length >= MAX_OFFERS) break;
				const key = out.fareType;
				const matchingRets = retByKey.get(key) || [];

				if (matchingRets.length === 0) {
					// No matching return — try same cabin at least
					const sameCabinRet = retOffers.find(r => r.cabin === out.cabin);
					offers.push(buildFinalOffer(out, sameCabinRet, req.depart, idx++, req, outUsedRT) as any);
				} else {
					for (const ret of matchingRets) {
						if (offers.length >= MAX_OFFERS) break;
						offers.push(buildFinalOffer(out, ret, req.depart, idx++, req, outUsedRT) as any);
					}
				}
			}
		}

		log.add('SEARCH END', {
			offerCount: offers.length,
			offerSummary: offers.map((o: any) => ({
				id: o.id,
				cabin: o.cabin,
				fareType: o.fareType,
				priceCents: o.price?.amountCents,
				currency: o.price?.currency
			}))
		});
		log.dump();

		console.log(`[AeroCRS] returning ${offers.length} offer(s)`);
		return offers;
	}
};

/** Build the AeroCRS deep-link URL that pre-fills the Blackstone booking engine. */
function buildDeepLinkUrl(req: SearchRequest, currency: string): string {
	const origin = req.origin;
	const dest = req.destination;
	const depart = req.depart;            // 'YYYY-MM-DD'
	const ret = req.return ?? 'NA';       // 'NA' for one-way
	const adults = req.passengers.adults;
	const children = req.passengers.children ?? 0;
	const infants = req.passengers.infants ?? 0;

	return `https://bookings.blackstone.am/en/flight-results/${origin}-${dest}/${depart}/${ret}/${adults}/${children}/${infants}/${currency}`;
}

/**
 * Build the final UI-shaped offer from outbound (+ optional return) direction offers.
 * If the outbound was priced with RT fares, it already includes the round-trip total,
 * so we use it directly instead of summing both directions.
 */
function buildFinalOffer(
	out: DirectionOffer,
	ret: DirectionOffer | undefined,
	departDate: string,
	idx: number,
	req: SearchRequest,
	outUsedRT = false
): Record<string, any> {
	let combinedPrice: { amountCents: number; currency: string };
	if (outUsedRT) {
		// RT fare already covers both directions — don't add return price
		combinedPrice = out.price;
	} else if (ret) {
		combinedPrice = {
			amountCents: out.price.amountCents + ret.price.amountCents,
			currency: out.price.currency
		};
	} else {
		combinedPrice = out.price;
	}

	console.log(`[AeroCRS] offer ${out.fltnum} ${out.fareType}: outPrice=${out.price.amountCents} retPrice=${ret?.price.amountCents ?? 0} usedRT=${outUsedRT} final=${combinedPrice.amountCents}`);

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
		deepLink: buildDeepLinkUrl(req, out.price.currency)
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
