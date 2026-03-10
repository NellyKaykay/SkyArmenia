// src/lib/server/aerocrs/booking.ts
// Server-only AeroCRS booking service.
//
// Pipeline:
//   1. parseOfferId        → extract fltnum, class, fareType, date
//   2. resolveFlightAndFare → GET /getDeepLink → flightid + fareid
//   3. createBooking        → POST /createBooking → bookingId + pnrRef
//   4. addPassengers        → validate + map to AeroCRS passenger structure
//   5. confirmBooking       → POST /confirmBooking → final PNR
//
// AeroCRS has no separate "addPassengers" endpoint; passenger data is sent
// inside confirmBooking.  We keep addPassengers() as a dedicated step that
// validates every field and builds the exact payload the API expects.

import {
	AEROCRS_AUTH_ID,
	AEROCRS_AUTH_PASSWORD,
	AEROCRS_BASE_URL
} from '$env/static/private';

/* ================================================================
   TYPES
   ================================================================ */

export interface BookingPassenger {
	type: 'ADT' | 'CHD' | 'INF';
	firstName: string;
	lastName: string;
	birthDate: string; // YYYY-MM-DD
	title?: string;
	nationality?: string;
	docType?: string;
	docNumber?: string;
	docIssuer?: string;
	docExpiry?: string; // YYYY-MM-DD
	phone?: string;
	email?: string;
}

export interface BookingRequest {
	offerId: string;
	returnOfferId?: string; // for round-trip bookings
	origin: string;
	destination: string;
	passengers: BookingPassenger[];
}

export interface BookingResult {
	bookingReference: string;
	bookingId: number;
	bookingConfirmation: string;
	linkToBooking: string;
	totalPrice: string;
	currency: string;
	pnrPaymentTimeLimit: string;
	pnrTicketingTimeLimit: string;
	status: string;
}

/** AeroCRS passenger payload shape (exact field names from their API). */
interface AeroCrsPassenger {
	paxtitle: string;
	firstname: string;
	lastname: string;
	paxage: null;
	paxnationailty: string; // intentional misspelling — API requires it
	paxdoctype: string;
	paxdocnumber: string;
	paxdocissuer: string;
	paxdocexpiry: string;  // YYYY/MM/DD
	paxbirthdate: string;  // YYYY/MM/DD
	paxphone: string;
	paxemail: string;
}

/* ================================================================
   CONFIG
   ================================================================ */

function getConfig() {
	if (!AEROCRS_AUTH_ID || !AEROCRS_AUTH_PASSWORD || !AEROCRS_BASE_URL) {
		throw new Error(
			'AeroCRS Booking: missing environment variables (AEROCRS_AUTH_ID, AEROCRS_AUTH_PASSWORD, AEROCRS_BASE_URL)'
		);
	}
	return {
		baseUrl: AEROCRS_BASE_URL.replace(/\/+$/, ''),
		authHeaders: {
			accept: 'application/json',
			'content-type': 'application/json',
			auth_id: AEROCRS_AUTH_ID,
			auth_password: AEROCRS_AUTH_PASSWORD
		}
	};
}

/* ================================================================
   HELPERS
   ================================================================ */

/** Convert 'YYYY-MM-DD' → 'YYYY/MM/DD' (AeroCRS format). */
function toAeroCrsDate(isoDate: string): string {
	return isoDate.replace(/-/g, '/');
}

/** Validate that a string looks like YYYY-MM-DD. */
function isIsoDate(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Parse an offerId from the search results to extract flight details.
 *
 * Format: aerocrs-{fltnum}-{classCode}-{fareType|"std"}-{YYYY}-{MM}-{DD}-{idx}
 * Example: aerocrs-API401-Y-Basic-2026-06-15-0
 */
function parseOfferId(offerId: string): {
	fltnum: string;
	classCode: string;
	fareType: string;
	date: string;
} {
	const parts = offerId.split('-');

	if (parts.length < 8 || parts[0] !== 'aerocrs') {
		throw new Error(`Invalid offerId format: ${offerId}`);
	}

	const fltnum = parts[1];
	const classCode = parts[2];
	const idx = parts[parts.length - 1];
	const date = parts.slice(-4, -1).join('-'); // YYYY-MM-DD
	const fareType = parts.slice(3, -4).join('-'); // between classCode and date

	if (!fltnum || !classCode || !date || !isIsoDate(date)) {
		throw new Error(`Cannot parse offerId: ${offerId}`);
	}

	console.log(
		`[AeroCRS Booking] parsed offerId → fltnum=${fltnum} class=${classCode} fare=${fareType || 'std'} date=${date} idx=${idx}`
	);

	return { fltnum, classCode, fareType: fareType || 'std', date };
}

/* ================================================================
   STEP 1  —  RESOLVE FLIGHT-ID + FARE-ID  (via getDeepLink)
   ================================================================ */

/**
 * Call GET /getDeepLink to obtain the AeroCRS integer IDs (flightid, fareid)
 * needed by createBooking.
 *
 * getDeepLink is the only AeroCRS v5 endpoint that returns both IDs.
 * They live inside the per-class objects:
 *
 *   flight.classes["K"]       → { flightid, fareid, … }    (non-branded)
 *   flight.classes["Y/Flex"]  → { flightid, fareid, … }    (branded)
 */
async function resolveFlightAndFare(
	origin: string,
	destination: string,
	date: string,
	fltnum: string,
	classCode: string,
	fareType: string
): Promise<{ flightId: number; fareId: number }> {
	const { baseUrl, authHeaders } = getConfig();

	const qs = new URLSearchParams({
		from: origin,
		to: destination,
		start: toAeroCrsDate(date),
		end: toAeroCrsDate(date),
		adults: '1',
		child: '0',
		infant: '0'
	});

	const url = `${baseUrl}/getDeepLink?${qs}`;
	console.log('[AeroCRS Booking] [resolve] getDeepLink GET →', url);

	const res = await fetch(url, { method: 'GET', headers: authHeaders });

	if (!res.ok) {
		const body = await res.text();
		console.error(`[AeroCRS Booking] [resolve] getDeepLink FAILED [${res.status}]:`, body);
		throw new Error(`Failed to resolve flight IDs (HTTP ${res.status})`);
	}

	const data = await res.json();

	if (!data?.aerocrs?.success) {
		console.error('[AeroCRS Booking] [resolve] getDeepLink success=false', JSON.stringify(data));
		throw new Error('AeroCRS getDeepLink returned success=false');
	}

	const rawFlights = data.aerocrs.flights?.flight;
	const flights: any[] = Array.isArray(rawFlights) ? rawFlights : rawFlights ? [rawFlights] : [];

	if (flights.length === 0) {
		throw new Error(`No flights found for ${origin}→${destination} on ${date}`);
	}

	console.log(`[AeroCRS Booking] [resolve] ${flights.length} flight(s) returned from getDeepLink`);

	// Find matching flight by fltnum
	const matchedFlight = flights.find((f: any) => f.fltnum === fltnum);
	if (!matchedFlight) {
		const available = flights.map((f: any) => f.fltnum).join(', ');
		throw new Error(`Flight ${fltnum} not found. Available: ${available}`);
	}

	const classes: Record<string, any> = matchedFlight.classes || {};
	const classKeys = Object.keys(classes);

	console.log(`[AeroCRS Booking] [resolve] flight ${fltnum} has classes: ${classKeys.join(', ')}`);

	// Build the class key to look up.
	// getDeepLink uses "classCode/fareType" for branded fares, "classCode" for non-branded.
	const brandedKey = fareType && fareType !== 'std' ? `${classCode}/${fareType}` : null;
	const plainKey = classCode;

	const classEntry =
		(brandedKey ? classes[brandedKey] : null) ??
		classes[plainKey] ??
		// Fallback: case-insensitive search through all classes matching classCode
		Object.values(classes).find(
			(c: any) => c.classCode === classCode
		);

	if (!classEntry) {
		throw new Error(
			`Class ${brandedKey || plainKey} not found for flight ${fltnum}. Available: ${classKeys.join(', ')}`
		);
	}

	const flightId = classEntry.flightid;
	const fareId = classEntry.fareid;

	if (flightId == null || fareId == null) {
		console.error(
			'[AeroCRS Booking] [resolve] class entry missing flightid/fareid. Keys:',
			Object.keys(classEntry).join(', ')
		);
		throw new Error(
			`Class entry for ${brandedKey || plainKey} missing flightid or fareid. ` +
			`Available fields: ${Object.keys(classEntry).join(', ')}`
		);
	}

	console.log(
		`[AeroCRS Booking] [resolve] resolved → flightId=${flightId} fareId=${fareId} ` +
		`(fltnum=${fltnum}, class=${brandedKey || plainKey})`
	);

	return { flightId: Number(flightId), fareId: Number(fareId) };
}

/* ================================================================
   STEP 2  —  CREATE BOOKING
   ================================================================ */

/** A single leg for the createBooking bookflight array. */
interface BookFlightLeg {
	fromcode: string;
	tocode: string;
	flightid: number;
	fareid: number;
}

/**
 * POST /createBooking — reserves seats and returns a bookingId + initial PNR.
 *
 * AeroCRS quirk: infants must be counted as adults (not via the `infant` param).
 * The API identifies them by birthdate. The `infant` param causes passenger-count
 * mismatches in confirmBooking.
 */
async function createBooking(
	legs: BookFlightLeg[],
	tripType: 'OW' | 'RT',
	adults: number,
	children: number
): Promise<{ bookingId: number; pnrRef: string; totalPrice: string; currency: string }> {
	const { baseUrl, authHeaders } = getConfig();
	const url = `${baseUrl}/createBooking`;

	const body = {
		aerocrs: {
			parms: {
				triptype: tripType,
				adults,
				child: children,
				infant: 0,
				bookflight: legs
			}
		}
	};

	console.log('[AeroCRS Booking] [createBooking] POST →', url);
	console.log('[AeroCRS Booking] [createBooking] payload:', JSON.stringify(body, null, 2));

	const res = await fetch(url, {
		method: 'POST',
		headers: authHeaders,
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`[AeroCRS Booking] [createBooking] FAILED [${res.status}]:`, text);
		throw new Error(`createBooking failed (HTTP ${res.status}): ${text}`);
	}

	const data = await res.json();
	console.log('[AeroCRS Booking] [createBooking] response:', JSON.stringify(data, null, 2));

	if (!data?.aerocrs?.success) {
		const msg = data?.aerocrs?.error || data?.aerocrs?.message || JSON.stringify(data);
		throw new Error(`createBooking returned success=false: ${msg}`);
	}

	const booking = data.aerocrs.booking;
	if (!booking?.bookingid) {
		throw new Error('createBooking response missing bookingid');
	}

	console.log(
		`[AeroCRS Booking] [createBooking] BOOKING CREATED ` +
		`→ bookingId=${booking.bookingid} pnrRef=${booking.pnrref} ` +
		`total=${booking.totalprice} ${booking.currency}`
	);

	return {
		bookingId: booking.bookingid,
		pnrRef: booking.pnrref,
		totalPrice: String(booking.totalprice ?? ''),
		currency: booking.currency || booking.defaultCurrency || 'USD'
	};
}

/* ================================================================
   STEP 3  —  ADD PASSENGERS  (validate + map)
   ================================================================ */

/**
 * Validates every passenger against AeroCRS requirements and maps them
 * to the exact field names the confirmBooking API expects.
 *
 * AeroCRS has no separate "addPassengers" endpoint — passenger data is
 * sent inside confirmBooking.  This function is the validation gate:
 * if anything is wrong it throws before we hit the API.
 */
function addPassengers(passengers: BookingPassenger[]): AeroCrsPassenger[] {
	console.log(`[AeroCRS Booking] [addPassengers] validating ${passengers.length} passenger(s)…`);

	if (passengers.length === 0) {
		throw new Error('At least one passenger is required');
	}

	const mapped: AeroCrsPassenger[] = [];

	for (let i = 0; i < passengers.length; i++) {
		const p = passengers[i];
		const label = `passengers[${i}] (${p.type})`;

		// --- required for ALL types ---
		if (!p.firstName?.trim()) {
			throw new Error(`${label}: firstName is required`);
		}
		if (!p.lastName?.trim()) {
			throw new Error(`${label}: lastName is required`);
		}
		if (!p.birthDate?.trim() || !isIsoDate(p.birthDate)) {
			throw new Error(`${label}: birthDate is required and must be YYYY-MM-DD`);
		}
		if (!['ADT', 'CHD', 'INF'].includes(p.type)) {
			throw new Error(`${label}: type must be ADT, CHD, or INF`);
		}

		// --- type-specific validation ---
		if (p.type === 'ADT') {
			// Adults should have a title (default Mr. if missing)
			if (p.docExpiry && !isIsoDate(p.docExpiry)) {
				throw new Error(`${label}: docExpiry must be YYYY-MM-DD`);
			}
		}

		if (p.type === 'INF') {
			// Infants: verify birth date is reasonably recent (< 3 years from now)
			const birth = new Date(p.birthDate);
			const now = new Date();
			const ageMs = now.getTime() - birth.getTime();
			const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
			if (ageYears > 3) {
				console.warn(
					`[AeroCRS Booking] [addPassengers] WARNING: ${label} birthDate ${p.birthDate} ` +
					`makes infant ~${ageYears.toFixed(1)} years old — may be rejected by airline`
				);
			}
		}

		// --- map to AeroCRS field names ---
		const aeroPax: AeroCrsPassenger = {
			paxtitle: p.title || defaultTitle(p.type),
			firstname: p.firstName.trim(),
			lastname: p.lastName.trim(),
			paxage: null,
			paxnationailty: p.nationality || '',   // note: intentional API typo
			paxdoctype: p.docType || '',
			paxdocnumber: p.docNumber || '',
			paxdocissuer: p.docIssuer || '',
			paxdocexpiry: p.docExpiry ? toAeroCrsDate(p.docExpiry) : '',
			paxbirthdate: toAeroCrsDate(p.birthDate),
			paxphone: p.phone || '',
			paxemail: p.email || ''
		};

		console.log(
			`[AeroCRS Booking] [addPassengers] ✓ ${label}: ` +
			`${aeroPax.paxtitle} ${aeroPax.firstname} ${aeroPax.lastname} ` +
			`DOB=${aeroPax.paxbirthdate}`
		);

		mapped.push(aeroPax);
	}

	console.log(`[AeroCRS Booking] [addPassengers] PASSENGERS ADDED → ${mapped.length} passenger(s) validated and mapped`);
	return mapped;
}

/**
 * Default title based on passenger type.
 * AeroCRS requires a valid title from its database for ALL passengers,
 * including infants and children. Empty or custom titles (e.g. "Inf.") are rejected.
 */
function defaultTitle(type: string): string {
	switch (type) {
		case 'INF':
			return 'Mr.';
		case 'CHD':
			return 'Mr.';
		default:
			return 'Mr.';
	}
}

/* ================================================================
   STEP 4  —  CONFIRM BOOKING
   ================================================================ */

/**
 * POST /confirmBooking — sends passenger details and finalises the booking.
 * Returns the PNR reference.
 */
async function confirmBooking(
	bookingId: number,
	aeroPaxList: AeroCrsPassenger[],
	contactEmail: string
): Promise<BookingResult> {
	const { baseUrl, authHeaders } = getConfig();
	const url = `${baseUrl}/confirmBooking`;

	const body = {
		aerocrs: {
			parms: {
				bookingid: bookingId,
				agentconfirmation: 'skyarmenia-api',
				confirmationemail: contactEmail,
				passenger: aeroPaxList
			}
		}
	};

	console.log('[AeroCRS Booking] [confirmBooking] POST →', url);
	console.log('[AeroCRS Booking] [confirmBooking] payload:', JSON.stringify(body, null, 2));

	const res = await fetch(url, {
		method: 'POST',
		headers: authHeaders,
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`[AeroCRS Booking] [confirmBooking] FAILED [${res.status}]:`, text);
		throw new Error(`confirmBooking failed (HTTP ${res.status}): ${text}`);
	}

	const data = await res.json();
	console.log('[AeroCRS Booking] [confirmBooking] response:', JSON.stringify(data, null, 2));

	if (!data?.aerocrs?.success) {
		const msg = data?.aerocrs?.error || data?.aerocrs?.message || JSON.stringify(data);
		throw new Error(`confirmBooking returned success=false: ${msg}`);
	}

	const a = data.aerocrs;

	const result: BookingResult = {
		bookingReference: a.pnrref || '',
		bookingId: a.bookingid,
		bookingConfirmation: a.bookingconfirmation || '',
		linkToBooking: a.linktobooking || '',
		totalPrice: String(a.topay ?? ''),
		currency: a.currency || 'USD',
		pnrPaymentTimeLimit: a.pnrptl || '',
		pnrTicketingTimeLimit: a.pnrttl || '',
		status: a.status || 'UNKNOWN'
	};

	console.log(
		`[AeroCRS Booking] [confirmBooking] BOOKING CONFIRMED ` +
		`→ PNR=${result.bookingReference} status=${result.status} ` +
		`toPay=${result.totalPrice} ${result.currency}`
	);

	return result;
}

/* ================================================================
   ORCHESTRATOR  —  bookFlight()
   ================================================================ */

/**
 * Full booking pipeline:
 *
 *   1. Parse offerId(s)       → fltnum, classCode, fareType, date
 *   2. resolveFlightAndFare   → re-search for raw AeroCRS IDs (per leg)
 *   3. createBooking          → reserve seats → bookingId
 *   4. addPassengers          → validate + map to AeroCRS structure
 *   5. confirmBooking         → send passengers + confirm → PNR
 *
 * AeroCRS infant handling: infants are counted as adults in the pax count.
 * The API identifies them by birthdate, not by the `infant` parameter.
 */
export async function bookFlight(request: BookingRequest): Promise<BookingResult> {
	console.log('');
	console.log('[AeroCRS Booking] ════════════════════════════════════════════');
	console.log('[AeroCRS Booking]  START BOOKING FLOW');
	console.log('[AeroCRS Booking] ════════════════════════════════════════════');
	console.log('[AeroCRS Booking]  offerId       :', request.offerId);
	console.log('[AeroCRS Booking]  returnOfferId :', request.returnOfferId || '(none — one-way)');
	console.log('[AeroCRS Booking]  route         :', request.origin, '→', request.destination);
	console.log('[AeroCRS Booking]  passengers    :', request.passengers.length);
	console.log('');

	const isRoundTrip = !!request.returnOfferId;
	const tripType = isRoundTrip ? 'RT' : 'OW';

	// ---- Step 1: parse offer ID(s) ----
	const outbound = parseOfferId(request.offerId);

	// ---- Passenger counts ----
	// AeroCRS quirk: infants must be counted as adults (identified by birthdate).
	const adultCount = request.passengers.filter((p) => p.type === 'ADT').length;
	const childCount = request.passengers.filter((p) => p.type === 'CHD').length;
	const infantCount = request.passengers.filter((p) => p.type === 'INF').length;

	if (adultCount === 0 && childCount === 0) {
		throw new Error('At least one adult (ADT) or child (CHD) passenger is required');
	}

	// Infants counted as adults for AeroCRS createBooking
	const apiAdults = adultCount + infantCount;

	console.log(
		`[AeroCRS Booking] pax counts → ADT=${adultCount} CHD=${childCount} INF=${infantCount} ` +
		`(API adults=${apiAdults}, children=${childCount}, infant=0)`
	);

	// ---- Step 2: resolve AeroCRS raw IDs ----
	const outboundIds = await resolveFlightAndFare(
		request.origin,
		request.destination,
		outbound.date,
		outbound.fltnum,
		outbound.classCode,
		outbound.fareType
	);

	// Build legs array
	const legs: BookFlightLeg[] = [
		{
			fromcode: request.origin,
			tocode: request.destination,
			flightid: outboundIds.flightId,
			fareid: outboundIds.fareId
		}
	];

	if (isRoundTrip) {
		const inbound = parseOfferId(request.returnOfferId!);

		const inboundIds = await resolveFlightAndFare(
			request.destination,
			request.origin,
			inbound.date,
			inbound.fltnum,
			inbound.classCode,
			inbound.fareType
		);

		// AeroCRS sandbox: fromcode/tocode must match the flight record,
		// which may differ from the logical travel direction.
		// getDeepLink returns the actual from/to the API expects.
		legs.push({
			fromcode: request.destination,
			tocode: request.origin,
			flightid: inboundIds.flightId,
			fareid: inboundIds.fareId
		});
	}

	// ---- Step 3: create booking ----
	const { bookingId } = await createBooking(
		legs,
		tripType,
		apiAdults,
		childCount
	);

	// ---- Step 4: add passengers (validate + map) ----
	const aeroPaxList = addPassengers(request.passengers);

	// ---- Step 5: confirm booking ----
	const contactEmail =
		request.passengers.find((p) => p.email)?.email || '';
	const result = await confirmBooking(bookingId, aeroPaxList, contactEmail);

	console.log('');
	console.log('[AeroCRS Booking] ════════════════════════════════════════════');
	console.log('[AeroCRS Booking]  BOOKING COMPLETE');
	console.log('[AeroCRS Booking] ════════════════════════════════════════════');
	console.log('[AeroCRS Booking]  PNR          :', result.bookingReference);
	console.log('[AeroCRS Booking]  Booking ID   :', result.bookingId);
	console.log('[AeroCRS Booking]  Confirmation :', result.bookingConfirmation);
	console.log('[AeroCRS Booking]  Status       :', result.status);
	console.log('[AeroCRS Booking]  To pay       :', result.totalPrice, result.currency);
	console.log('[AeroCRS Booking]  Link         :', result.linkToBooking);
	console.log('');

	return result;
}
