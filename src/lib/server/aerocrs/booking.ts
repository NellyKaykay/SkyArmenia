// src/lib/server/aerocrs/booking.ts
// Server-only AeroCRS booking service.
//
// Pipeline:
//   1. parseOfferId        → extract fltnum, class, fareType, date
//   2. resolveFlightAndFare → GET /getDeepLink → flightid + fareid
//   3. createBooking        → POST /createBooking → bookingId + pnrRef
//   4. addPassengers        → validate + map to AeroCRS passenger structure
//   5. confirmBooking       → POST /confirmBooking → final PNR
//   6. ticketBooking        → POST /ticketBooking → e-tickets
//
// AeroCRS has no separate "addPassengers" endpoint; passenger data is sent
// inside confirmBooking.  We keep addPassengers() as a dedicated step that
// validates every field and builds the exact payload the API expects.

import { getAeroCrsConfig } from '$lib/server/aerocrs-config';

/* ================================================================
   TYPES
   ================================================================ */

export interface BookingPassenger {
	type: 'ADT' | 'CHD' | 'INF';
	firstName: string;
	lastName: string;
	birthDate: string; // YYYY-MM-DD
	gender?: 'M' | 'F';
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

export interface TicketedPassenger {
	title: string;
	firstName: string;
	lastName: string;
	eTicket: string;
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
	bookingStatus: 'ticketed' | 'pending_ticketing';
	ticketNumber: string;
	invoiceNumber: number | null;
	ticketedPassengers: TicketedPassenger[];
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
	const config = getAeroCrsConfig();
	return {
		baseUrl: config.baseUrl,
		authHeaders: config.authHeaders
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
	const date = parts.slice(-4, -1).join('-'); // YYYY-MM-DD
	const fareType = parts.slice(3, -4).join('-'); // between classCode and date

	if (!fltnum || !classCode || !date || !isIsoDate(date)) {
		throw new Error(`Cannot parse offerId: ${offerId}`);
	}

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
	const res = await fetch(url, { method: 'GET', headers: authHeaders });

	if (!res.ok) {
		const body = await res.text();
		console.error(`[Booking] resolveFlightAndFare failed [${res.status}]`);
		throw new Error(`Failed to resolve flight IDs (HTTP ${res.status})`);
	}

	const data = await res.json();

	if (!data?.aerocrs?.success) {
		throw new Error('AeroCRS getDeepLink returned success=false');
	}

	const rawFlights = data.aerocrs.flights?.flight;
	const flights: any[] = Array.isArray(rawFlights) ? rawFlights : rawFlights ? [rawFlights] : [];

	if (flights.length === 0) {
		throw new Error(`No flights found for ${origin}→${destination} on ${date}`);
	}

	// Find matching flight by fltnum
	const matchedFlight = flights.find((f: any) => f.fltnum === fltnum);
	if (!matchedFlight) {
		const available = flights.map((f: any) => f.fltnum).join(', ');
		throw new Error(`Flight ${fltnum} not found. Available: ${available}`);
	}

	const classes: Record<string, any> = matchedFlight.classes || {};
	const classKeys = Object.keys(classes);

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
		throw new Error(
			`Class entry for ${brandedKey || plainKey} missing flightid or fareid. ` +
			`Available fields: ${Object.keys(classEntry).join(', ')}`
		);
	}

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

	const res = await fetch(url, {
		method: 'POST',
		headers: authHeaders,
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`[Booking] createBooking failed [${res.status}]`);
		throw new Error(`createBooking failed (HTTP ${res.status}): ${text}`);
	}

	const data = await res.json();

	if (!data?.aerocrs?.success) {
		const msg = data?.aerocrs?.error || data?.aerocrs?.message || JSON.stringify(data);
		throw new Error(`createBooking returned success=false: ${msg}`);
	}

	const booking = data.aerocrs.booking;
	if (!booking?.bookingid) {
		throw new Error('createBooking response missing bookingid');
	}

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
			if (p.docExpiry && !isIsoDate(p.docExpiry)) {
				throw new Error(`${label}: docExpiry must be YYYY-MM-DD`);
			}
		}

		if (p.type === 'INF') {
			const birth = new Date(p.birthDate);
			const now = new Date();
			const ageYears = (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
			if (ageYears > 3) {
				console.warn(`[Booking] ${label} age ~${ageYears.toFixed(1)}y — may be rejected as infant`);
			}
		}

		// --- map to AeroCRS field names ---
		const aeroPax: AeroCrsPassenger = {
			paxtitle: p.title || defaultTitle(p.type, p.gender),
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

		mapped.push(aeroPax);
	}

	return mapped;
}

/**
 * Default title based on passenger type and gender.
 * AeroCRS requires a valid title from its database for ALL passengers.
 */
function defaultTitle(type: string, gender?: 'M' | 'F'): string {
	if (type === 'INF' || type === 'CHD') {
		return gender === 'F' ? 'Miss' : 'Mr.';
	}
	return gender === 'F' ? 'Mrs.' : 'Mr.';
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

	const res = await fetch(url, {
		method: 'POST',
		headers: authHeaders,
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`[Booking] confirmBooking failed [${res.status}]`);
		throw new Error(`confirmBooking failed (HTTP ${res.status}): ${text}`);
	}

	const data = await res.json();

	if (!data?.aerocrs?.success) {
		const msg = data?.aerocrs?.error || data?.aerocrs?.message || JSON.stringify(data);
		throw new Error(`confirmBooking returned success=false: ${msg}`);
	}

	const a = data.aerocrs;

	return {
		bookingReference: a.pnrref || '',
		bookingId: a.bookingid,
		bookingConfirmation: a.bookingconfirmation || '',
		linkToBooking: a.linktobooking || '',
		totalPrice: String(a.topay ?? ''),
		currency: a.currency || 'USD',
		pnrPaymentTimeLimit: a.pnrptl || '',
		pnrTicketingTimeLimit: a.pnrttl || '',
		status: a.status || 'UNKNOWN',
		bookingStatus: 'pending_ticketing',
		ticketNumber: '',
		invoiceNumber: null,
		ticketedPassengers: []
	};
}

/* ================================================================
   STEP 5  —  TICKET BOOKING
   ================================================================ */

/**
 * POST /ticketBooking — issues e-tickets for a confirmed booking.
 * Must be called after confirmBooking.
 */
async function ticketBooking(
	bookingId: number
): Promise<{ ticketNumber: string; invoiceNumber: number | null; passengers: TicketedPassenger[] }> {
	const { baseUrl, authHeaders } = getConfig();
	const url = `${baseUrl}/ticketBooking`;

	const body = {
		aerocrs: {
			parms: {
				bookingid: bookingId
			}
		}
	};

	let res: Response;
	try {
		res = await fetch(url, {
			method: 'POST',
			headers: authHeaders,
			body: JSON.stringify(body)
		});
	} catch (networkErr) {
		const netMsg = (networkErr as Error)?.message || 'Unknown network error';
		throw new Error(`ticketBooking network error: ${netMsg}`);
	}

	const rawBody = await res.text();

	if (!res.ok) {
		console.error(`[Booking] ticketBooking failed [${res.status}]`);
		throw new Error(`ticketBooking failed (HTTP ${res.status}): ${rawBody}`);
	}

	let data: any;
	try {
		data = JSON.parse(rawBody);
	} catch {
		throw new Error(`ticketBooking response is not valid JSON: ${rawBody.substring(0, 200)}`);
	}

	if (!data?.aerocrs?.success) {
		const errMsg = data?.aerocrs?.error || data?.aerocrs?.message || JSON.stringify(data);
		throw new Error(`ticketBooking returned success=false: ${errMsg}`);
	}

	const a = data.aerocrs;

	const passengers: TicketedPassenger[] = [];
	const rawPassengers = a.passengers;

	if (Array.isArray(rawPassengers)) {
		for (const p of rawPassengers) {
			passengers.push({
				title: p.title || '',
				firstName: p.firstname || '',
				lastName: p.lastname || '',
				eTicket: p['e-ticket'] || ''
			});
		}
	}

	return {
		ticketNumber: String(a.ticketnumber || ''),
		invoiceNumber: a.invoicenumber ?? null,
		passengers
	};
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
 *   6. ticketBooking          → issue e-tickets for the confirmed PNR
 *
 * AeroCRS infant handling: infants are counted as adults in the pax count.
 * The API identifies them by birthdate, not by the `infant` parameter.
 */
export async function bookFlight(request: BookingRequest): Promise<BookingResult> {
	const isRoundTrip = !!request.returnOfferId;
	const tripType = isRoundTrip ? 'RT' : 'OW';

	console.log(`[Booking] ${request.origin}→${request.destination} ${tripType} | ${request.passengers.length} pax`);

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

		legs.push({
			fromcode: request.destination,
			tocode: request.origin,
			flightid: inboundIds.flightId,
			fareid: inboundIds.fareId
		});
	}

	// ---- Step 3: create booking ----
	const { bookingId } = await createBooking(legs, tripType, apiAdults, childCount);

	// ---- Step 4: add passengers (validate + map) ----
	const aeroPaxList = addPassengers(request.passengers);

	// ---- Step 5: confirm booking ----
	const contactEmail = request.passengers.find((p) => p.email)?.email || '';
	const result = await confirmBooking(bookingId, aeroPaxList, contactEmail);

	// ---- Step 6: ticket booking ----
	// Wrapped in try/catch so ticketing failure does NOT lose the confirmed PNR.
	try {
		const ticketResult = await ticketBooking(bookingId);
		result.ticketNumber = ticketResult.ticketNumber;
		result.invoiceNumber = ticketResult.invoiceNumber;
		result.ticketedPassengers = ticketResult.passengers;
		result.bookingStatus = 'ticketed';
	} catch (ticketErr) {
		const ticketMsg = (ticketErr as Error)?.message || 'Unknown ticketing error';
		console.error(`[Booking] ticketing failed for bookingId=${bookingId} PNR=${result.bookingReference}: ${ticketMsg}`);
	}

	console.log(`[Booking] complete PNR=${result.bookingReference} status=${result.bookingStatus}`);

	return result;
}
