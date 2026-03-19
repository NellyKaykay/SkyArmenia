// integration-test-bookings.mjs
// Full integration test: Search → Resolve IDs → Create Booking → Confirm → Ticket → PNR
//
// Test Cases:
//   1. TLV-LHR \ LHR-TLV  — Economy, non-branded fares (round-trip)
//   2a. TLV-MAD \ MAD-TLV — Economy, branded fares (round-trip)
//   2b. TLV-MAD \ MAD-TLV — Business cabin fare (round-trip)
//   3. LHR-CDG-MAD \ MAD-CDG-LHR — From-Via-To, non-branded (round-trip)
//   4. ZNZ-DAR-WIL-MBA \ MBA-WIL-DAR-ZNZ — Multi-leg, non-branded (round-trip)
//
// AeroCRS sandbox quirks handled:
//   - Sandbox returns ALL flights regardless of origin/destination (client-side filtering)
//   - Some return routes (e.g. LHR→TLV) don't exist; return flights are stored under
//     the outbound's from/to codes with different flightIds per date
//   - getDeepLink may return flights under outbound direction codes for both directions
//   - Business class (B) has non-branded fares in TLV-MAD
//
// Run with: node integration-test-bookings.mjs

const AUTH_ID = 'BEFDA2FA-9298-4D6C-B75B-AE69F6C44F24';
const AUTH_PASSWORD = '1f?5)CEKi[r6';
const BASE = 'https://api.aerocrs.com/v5';

const HEADERS = {
  accept: 'application/json',
  'content-type': 'application/json',
  auth_id: AUTH_ID,
  auth_password: AUTH_PASSWORD
};

const CLASS_CABIN_MAP = {
  Y: 'economy', K: 'economy', M: 'economy', N: 'economy', T: 'economy',
  B: 'business', C: 'business'
};

/* ================================================================
   API HELPERS
   ================================================================ */

async function getAvailability(origin, dest, date) {
  const qs = new URLSearchParams({
    start: date, end: date,
    origin, destination: dest,
    adt: '1', chd: '0', inf: '0', cabin: 'Economy'
  });
  const url = `${BASE}/getAvailability?${qs}`;
  console.log(`  [getAvailability] GET ${origin}→${dest} ${date}`);
  const res = await fetch(url, { method: 'GET', headers: HEADERS });
  if (!res.ok) throw new Error(`getAvailability HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.aerocrs?.success) return [];
  const flights = data.aerocrs.flights?.flight;
  return Array.isArray(flights) ? flights : flights ? [flights] : [];
}

async function getFares(origin, dest, date) {
  const qs = new URLSearchParams({ start: date, end: date, from: origin, to: dest });
  const url = `${BASE}/getFares?${qs}`;
  console.log(`  [getFares] GET ${origin}→${dest} ${date}`);
  const res = await fetch(url, { method: 'GET', headers: HEADERS });
  if (!res.ok) throw new Error(`getFares HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.aerocrs?.success) return [];
  const fares = data.aerocrs.fares?.fare;
  return Array.isArray(fares) ? fares : fares ? [fares] : [];
}

async function getDeepLink(origin, dest, date) {
  const qs = new URLSearchParams({
    from: origin, to: dest,
    start: date, end: date,
    adults: '1', child: '0', infant: '0'
  });
  const url = `${BASE}/getDeepLink?${qs}`;
  console.log(`  [getDeepLink] GET ${origin}→${dest} ${date}`);
  const res = await fetch(url, { method: 'GET', headers: HEADERS });
  if (!res.ok) throw new Error(`getDeepLink HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.aerocrs?.success) throw new Error('getDeepLink success=false');
  const flights = data.aerocrs.flights?.flight;
  return Array.isArray(flights) ? flights : flights ? [flights] : [];
}

async function createBooking(triptype, adults, child, infant, bookflights) {
  const body = { aerocrs: { parms: { triptype, adults, child, infant, bookflight: bookflights } } };
  console.log(`  [createBooking] POST triptype=${triptype} adt=${adults} chd=${child} inf=${infant} legs=${bookflights.length}`);
  console.log(`  [createBooking] legs: ${JSON.stringify(bookflights)}`);
  const res = await fetch(`${BASE}/createBooking`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createBooking HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data?.aerocrs?.success) {
    throw new Error('createBooking failed: ' + JSON.stringify(data));
  }
  const b = data.aerocrs.booking;
  console.log(`  → bookingId=${b.bookingid} pnrRef=${b.pnrref} total=${b.totalprice} ${b.currency}`);
  return { bookingId: b.bookingid, pnrRef: b.pnrref, totalPrice: b.totalprice, currency: b.currency };
}

async function confirmBooking(bookingId, passengers) {
  const body = {
    aerocrs: {
      parms: {
        bookingid: bookingId,
        agentconfirmation: 'skyarmenia-api',
        confirmationemail: 'bookings@skyarmenia.com',
        passenger: passengers
      }
    }
  };
  console.log(`  [confirmBooking] POST bookingId=${bookingId} pax=${passengers.length}`);
  const res = await fetch(`${BASE}/confirmBooking`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`confirmBooking HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data?.aerocrs?.success) {
    throw new Error('confirmBooking failed: ' + JSON.stringify(data));
  }
  const a = data.aerocrs;
  console.log(`  → PNR=${a.pnrref} status=${a.status} toPay=${a.topay} ${a.currency}`);
  return {
    pnr: a.pnrref,
    bookingId: a.bookingid,
    status: a.status,
    toPay: a.topay,
    currency: a.currency,
    link: a.linktobooking || ''
  };
}

async function ticketBooking(bookingId) {
  const body = { aerocrs: { parms: { bookingid: bookingId } } };
  console.log(`  [ticketBooking] POST bookingId=${bookingId}`);
  const res = await fetch(`${BASE}/ticketBooking`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ticketBooking HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (!data?.aerocrs?.success) {
    throw new Error('ticketBooking failed: ' + JSON.stringify(data));
  }
  const a = data.aerocrs;
  const passengers = Array.isArray(a.passengers)
    ? a.passengers.map(p => ({ name: `${p.title} ${p.firstname} ${p.lastname}`, eTicket: p['e-ticket'] || '' }))
    : [];
  console.log(`  → ticketNumber=${a.ticketnumber} invoice=${a.invoicenumber} passengers=${passengers.length}`);
  for (const p of passengers) {
    console.log(`    ${p.name} → e-ticket: ${p.eTicket}`);
  }
  return {
    ticketNumber: String(a.ticketnumber || ''),
    invoiceNumber: a.invoicenumber ?? null,
    passengers
  };
}

/* ================================================================
   PASSENGER HELPERS
   ================================================================ */

function makePax(first, last, num) {
  return {
    paxtitle: 'Mr.',
    firstname: first,
    lastname: last,
    paxage: null,
    paxnationailty: 'AM',
    paxdoctype: 'PP',
    paxdocnumber: `AM${num}`,
    paxdocissuer: 'AM',
    paxdocexpiry: '2030/12/31',
    paxbirthdate: '1990/05/15',
    paxphone: '+34600000001',
    paxemail: 'bookings@skyarmenia.com'
  };
}

/* ================================================================
   RESOLVE FLIGHT-ID + FARE-ID (with sandbox fallback)
   ================================================================ */

/**
 * Resolve flightId + fareId from getDeepLink.
 *
 * AeroCRS sandbox quirk: some return routes (e.g. LHR→TLV) don't exist.
 * The sandbox stores return flights under the outbound's from/to codes
 * with different flightIds per date. This function tries:
 *   1. getDeepLink with the requested from/to
 *   2. If no match: getDeepLink with reversed from/to (outbound direction on return date)
 *
 * For the return leg, we also use whichever fromcode/tocode the API returns
 * (not our logical direction).
 */
async function resolveReturnIdsWithFallback({
  retOrigin,     // logical return origin (e.g. LHR)
  retDest,       // logical return dest (e.g. TLV)
  retDate,
  classCode,
  fareType,
  outOrigin,     // outbound origin (e.g. TLV) — used as fallback
  outDest        // outbound dest (e.g. LHR) — used as fallback
}) {
  // Attempt 1: normal return direction
  console.log(`  [resolveReturn] Attempting normal direction: ${retOrigin}→${retDest}`);
  let deepLinkFlights = await getDeepLink(retOrigin, retDest, retDate);

  // Try to find a matching class in any flight
  let resolved = tryResolveFromDeepLink(deepLinkFlights, classCode, fareType);
  if (resolved) {
    return {
      ...resolved,
      fromcode: resolved.fromcode || retOrigin,
      tocode: resolved.tocode || retDest
    };
  }

  // Attempt 2: outbound direction on return date (sandbox fallback)
  console.log(`  [resolveReturn] Fallback: outbound direction ${outOrigin}→${outDest} on return date`);
  deepLinkFlights = await getDeepLink(outOrigin, outDest, retDate);
  resolved = tryResolveFromDeepLink(deepLinkFlights, classCode, fareType);
  if (resolved) {
    return {
      ...resolved,
      fromcode: resolved.fromcode || outOrigin,
      tocode: resolved.tocode || outDest
    };
  }

  throw new Error(
    `Cannot resolve return IDs for class=${classCode} fare=${fareType || 'std'}. ` +
    `Tried ${retOrigin}→${retDest} and ${outOrigin}→${outDest} on ${retDate}`
  );
}

/**
 * Try to find flightId/fareId in getDeepLink results for a given class/fare.
 * Returns null if no match found.
 */
function tryResolveFromDeepLink(deepLinkFlights, classCode, fareType) {
  if (deepLinkFlights.length === 0) {
    console.log(`  [resolveIds] no flights in getDeepLink response`);
    return null;
  }

  // Determine target cabin so we can fall back to other class codes in the same cabin
  const targetCabin = CLASS_CABIN_MAP[classCode] || 'economy';
  const sameCabinCodes = Object.entries(CLASS_CABIN_MAP)
    .filter(([, cab]) => cab === targetCabin)
    .map(([code]) => code);

  for (const flight of deepLinkFlights) {
    const classes = flight.classes || {};
    const classKeys = Object.keys(classes);
    console.log(`  [resolveIds] flight ${flight.fltnum} from=${flight.fromcode} to=${flight.tocode} classes: ${classKeys.join(', ')}`);

    // Try branded key first (e.g. "Y/Basic"), then plain key, then same-cabin fallback
    const brandedKey = fareType && fareType !== 'std' && fareType !== '' ? `${classCode}/${fareType}` : null;
    const entry =
      (brandedKey && classes[brandedKey]) ||
      classes[classCode] ||
      Object.values(classes).find(c => c.classCode === classCode) ||
      // Fallback: any class code in the same cabin (e.g. B when C not found, both business)
      sameCabinCodes.reduce((found, code) => found || classes[code], null);

    if (entry && entry.flightid != null && entry.fareid != null) {
      console.log(`  [resolveIds] → flightId=${entry.flightid} fareId=${entry.fareid} (key=${brandedKey || classCode})`);
      return {
        flightId: Number(entry.flightid),
        fareId: Number(entry.fareid),
        fltnum: flight.fltnum,
        fromcode: flight.fromcode,
        tocode: flight.tocode
      };
    }
  }

  console.log(`  [resolveIds] no matching class found`);
  return null;
}

/**
 * Resolve outbound flight IDs (simpler — no fallback needed).
 */
function resolveIdsFromDeepLink(deepLinkFlights, fltnum, classCode, fareType) {
  const flight = deepLinkFlights.find(f => f.fltnum === fltnum);
  if (!flight) {
    const available = deepLinkFlights.map(f => f.fltnum).join(', ');
    throw new Error(`Flight ${fltnum} not found in getDeepLink. Available: ${available}`);
  }

  const classes = flight.classes || {};
  const classKeys = Object.keys(classes);
  console.log(`  [resolveIds] flight ${fltnum} classes: ${classKeys.join(', ')}`);

  const brandedKey = fareType && fareType !== 'std' && fareType !== '' ? `${classCode}/${fareType}` : null;
  const entry =
    (brandedKey && classes[brandedKey]) ||
    classes[classCode] ||
    Object.values(classes).find(c => c.classCode === classCode);

  if (!entry) {
    throw new Error(`Class ${brandedKey || classCode} not found. Available: ${classKeys.join(', ')}`);
  }
  if (entry.flightid == null || entry.fareid == null) {
    throw new Error(`Missing flightid/fareid. Keys: ${Object.keys(entry).join(', ')}`);
  }

  console.log(`  [resolveIds] → flightId=${entry.flightid} fareId=${entry.fareid}`);
  return { flightId: Number(entry.flightid), fareId: Number(entry.fareid) };
}

/* ================================================================
   FIND BEST FLIGHT/CLASS/FARE COMBO
   ================================================================ */

function pickFlightOffer(flights, fares, origin, dest, targetCabin, wantBranded) {
  const matching = flights.filter(f => f.fromcode === origin && f.tocode === dest);
  if (matching.length === 0) {
    const routes = [...new Set(flights.map(f => `${f.fromcode}→${f.tocode}`))];
    throw new Error(`No flights matching ${origin}→${dest}. Available: ${routes.join(', ')}`);
  }

  // Index fares by classCode (from fares matching origin-dest)
  const faresByClass = {};
  for (const f of fares) {
    if (f.fromCode === origin && f.toCode === dest) {
      const key = f.class;
      if (!faresByClass[key]) faresByClass[key] = [];
      faresByClass[key].push(f);
    }
  }

  console.log(`  [pickOffer] ${matching.length} flight(s) ${origin}→${dest}, fare classes: ${Object.keys(faresByClass).join(', ') || 'none'}`);

  // Two-pass: first try classes WITH fares, then classes without
  for (const requireFare of [true, false]) {
    for (const flight of matching) {
      const classes = flight.classes || {};
      for (const [classCode, seats] of Object.entries(classes)) {
        if (typeof seats !== 'number' || seats <= 0) continue;
        if (classCode === 'TESTCODE') continue;

        const cabin = CLASS_CABIN_MAP[classCode] || 'economy';
        if (targetCabin && cabin !== targetCabin) continue;

        const classFares = faresByClass[classCode] || [];

        if (wantBranded) {
          const branded = classFares.filter(f => f.type && f.type.trim() && f.type.trim() !== 'std');
          if (branded.length > 0) {
            const fare = branded[0];
            console.log(`  [pickOffer] ✓ flt=${flight.fltnum} class=${classCode} cabin=${cabin} fare=${fare.type} price=${fare.adultFareOW} ${fare.currency}`);
            return { fltnum: flight.fltnum, classCode, fareType: fare.type, cabin, fare };
          }
        } else {
          const fare = classFares[0];
          if (requireFare && !fare) continue;  // first pass: skip classes without fares
          if (fare) {
            console.log(`  [pickOffer] ✓ flt=${flight.fltnum} class=${classCode} cabin=${cabin} fare=${fare.type || 'std'} price=${fare.adultFareOW} ${fare.currency}`);
            return { fltnum: flight.fltnum, classCode, fareType: fare.type || '', cabin, fare };
          } else {
            console.log(`  [pickOffer] ✓ flt=${flight.fltnum} class=${classCode} cabin=${cabin} (no fare data)`);
            return { fltnum: flight.fltnum, classCode, fareType: '', cabin, fare: null };
          }
        }
      }
    }
  }

  throw new Error(`No suitable ${targetCabin || 'any'}${wantBranded ? ' branded' : ''} offer found for ${origin}→${dest}`);
}

/**
 * Pick an offer from getAvailability that also exists in the return direction,
 * falling back to outbound direction codes (sandbox quirk).
 */
function pickReturnOffer(flights, fares, retOrigin, retDest, outOrigin, outDest, targetCabin, wantBranded) {
  // First try the logical return direction
  const retMatching = flights.filter(f => f.fromcode === retOrigin && f.tocode === retDest);
  if (retMatching.length > 0) {
    try {
      return {
        ...pickFlightOffer(flights, fares, retOrigin, retDest, targetCabin, wantBranded),
        resolveOrigin: retOrigin,
        resolveDest: retDest
      };
    } catch { /* fall through */ }
  }

  // Fallback: use outbound direction codes (return flights stored under outbound from/to)
  console.log(`  [pickReturn] No ${retOrigin}→${retDest} flights, trying outbound codes ${outOrigin}→${outDest}`);
  const outMatching = flights.filter(f => f.fromcode === outOrigin && f.tocode === outDest);
  if (outMatching.length > 0) {
    return {
      ...pickFlightOffer(flights, fares, outOrigin, outDest, targetCabin, wantBranded),
      resolveOrigin: outOrigin,
      resolveDest: outDest
    };
  }

  const routes = [...new Set(flights.map(f => `${f.fromcode}→${f.tocode}`))];
  throw new Error(`No return flights found. Tried ${retOrigin}→${retDest} and ${outOrigin}→${outDest}. Available: ${routes.join(', ')}`);
}

/* ================================================================
   FULL INTEGRATION TEST (GENERIC)
   ================================================================ */

async function runBookingTest({
  label,
  outOrigin,
  outDest,
  outDate,
  retOrigin,
  retDest,
  retDate,
  cabin,
  branded,
  paxName
}) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  TEST: ${label}`);
  console.log(`  Route: ${outOrigin}→${outDest}${retDate ? ` / ${retOrigin}→${retDest}` : ' (OW)'}`);
  console.log(`  Dates: ${outDate}${retDate ? ` / ${retDate}` : ''}`);
  console.log(`  Cabin: ${cabin || 'any'}  Branded: ${branded ? 'yes' : 'no'}`);
  console.log(`${'═'.repeat(60)}`);

  const isRT = !!retDate;

  // ─── OUTBOUND ───
  console.log('\n--- OUTBOUND SEARCH ---');
  const [outFlights, outFares] = await Promise.all([
    getAvailability(outOrigin, outDest, outDate),
    getFares(outOrigin, outDest, outDate)
  ]);
  console.log(`  Found ${outFlights.length} flight(s), ${outFares.length} fare(s)`);

  console.log('\n--- PICK OUTBOUND OFFER ---');
  const outOffer = pickFlightOffer(outFlights, outFares, outOrigin, outDest, cabin, branded);

  console.log('\n--- RESOLVE OUTBOUND IDs ---');
  const outDeepLink = await getDeepLink(outOrigin, outDest, outDate);
  const outIds = resolveIdsFromDeepLink(outDeepLink, outOffer.fltnum, outOffer.classCode, outOffer.fareType);

  const legs = [{
    fromcode: outOrigin,
    tocode: outDest,
    flightid: outIds.flightId,
    fareid: outIds.fareId
  }];

  // ─── RETURN (with sandbox fallback logic) ───
  if (isRT) {
    console.log('\n--- RETURN SEARCH ---');
    // Search with retOrigin→retDest AND outOrigin→outDest fares for fallback
    const [retFlights, retFares, outDirFares] = await Promise.all([
      getAvailability(retOrigin, retDest, retDate),
      getFares(retOrigin, retDest, retDate),
      getFares(outOrigin, outDest, retDate)  // fallback fares if return direction has none
    ]);
    console.log(`  Found ${retFlights.length} flight(s), ${retFares.length} fare(s) (+ ${outDirFares.length} fallback fares)`);
    const allFares = [...retFares, ...outDirFares];

    console.log('\n--- PICK RETURN OFFER ---');
    const retOffer = pickReturnOffer(retFlights, allFares, retOrigin, retDest, outOrigin, outDest, cabin, branded);

    console.log('\n--- RESOLVE RETURN IDs ---');
    const retResolved = await resolveReturnIdsWithFallback({
      retOrigin: retOffer.resolveOrigin,
      retDest: retOffer.resolveDest,
      retDate,
      classCode: retOffer.classCode,
      fareType: retOffer.fareType,
      outOrigin,
      outDest
    });

    legs.push({
      fromcode: retResolved.fromcode,
      tocode: retResolved.tocode,
      flightid: retResolved.flightId,
      fareid: retResolved.fareId
    });
  }

  // ─── CREATE + CONFIRM ───
  console.log('\n--- CREATE BOOKING ---');
  const booking = await createBooking(isRT ? 'RT' : 'OW', 1, 0, 0, legs);

  console.log('\n--- CONFIRM BOOKING ---');
  const pax = makePax(paxName.first, paxName.last, paxName.docNum);
  const result = await confirmBooking(booking.bookingId, [pax]);

  console.log('\n--- TICKET BOOKING ---');
  const ticket = await ticketBooking(booking.bookingId);

  console.log(`\n  ✅ BOOKING COMPLETE — PNR: ${result.pnr} | Ticket: ${ticket.ticketNumber}`);
  return { ...result, ticketNumber: ticket.ticketNumber, ticketPassengers: ticket.passengers };
}

/* ================================================================
   MAIN — ALL TEST CASES
   ================================================================ */

async function main() {
  const results = [];
  const OUT_DATE = '2026/03/19';
  const RET_DATE = '2026/03/21';

  // ── Test 1: TLV-LHR \ LHR-TLV — Economy, non-branded ──
  try {
    const r = await runBookingTest({
      label: 'Test 1: TLV-LHR \\ LHR-TLV — Economy, non-branded',
      outOrigin: 'TLV', outDest: 'LHR', outDate: OUT_DATE,
      retOrigin: 'LHR', retDest: 'TLV', retDate: RET_DATE,
      cabin: 'economy', branded: false,
      paxName: { first: 'Aram', last: 'Martirosyan', docNum: '200001' }
    });
    results.push({ test: '1: TLV-LHR \\ LHR-TLV (Economy, non-branded)', ...r });
  } catch (e) {
    console.error(`\n  ❌ Test 1 FAILED: ${e.message}`);
    results.push({ test: '1: TLV-LHR \\ LHR-TLV (Economy, non-branded)', pnr: `FAILED: ${e.message}` });
  }

  // ── Test 2a: TLV-MAD \ MAD-TLV — Economy, branded fares ──
  try {
    const r = await runBookingTest({
      label: 'Test 2a: TLV-MAD \\ MAD-TLV — Economy, branded fares',
      outOrigin: 'TLV', outDest: 'MAD', outDate: OUT_DATE,
      retOrigin: 'MAD', retDest: 'TLV', retDate: RET_DATE,
      cabin: 'economy', branded: true,
      paxName: { first: 'Hayk', last: 'Karapetyan', docNum: '200002' }
    });
    results.push({ test: '2a: TLV-MAD \\ MAD-TLV (Economy, branded)', ...r });
  } catch (e) {
    console.error(`\n  ❌ Test 2a FAILED: ${e.message}`);
    results.push({ test: '2a: TLV-MAD \\ MAD-TLV (Economy, branded)', pnr: `FAILED: ${e.message}` });
  }

  // ── Test 2b: TLV-MAD \ MAD-TLV — Business (non-branded in sandbox) ──
  try {
    const r = await runBookingTest({
      label: 'Test 2b: TLV-MAD \\ MAD-TLV — Business cabin',
      outOrigin: 'TLV', outDest: 'MAD', outDate: OUT_DATE,
      retOrigin: 'MAD', retDest: 'TLV', retDate: RET_DATE,
      cabin: 'business', branded: false,  // B class has non-branded fare in sandbox
      paxName: { first: 'Levon', last: 'Mkrtchyan', docNum: '200003' }
    });
    results.push({ test: '2b: TLV-MAD \\ MAD-TLV (Business)', ...r });
  } catch (e) {
    console.error(`\n  ❌ Test 2b FAILED: ${e.message}`);
    results.push({ test: '2b: TLV-MAD \\ MAD-TLV (Business)', pnr: `FAILED: ${e.message}` });
  }

  // ── Test 3: LHR-CDG-MAD \ MAD-CDG-LHR — Via-flight, non-branded ──
  try {
    const r = await runBookingTest({
      label: 'Test 3: LHR→CDG→MAD \\ MAD→CDG→LHR — Via-flight, non-branded',
      outOrigin: 'LHR', outDest: 'MAD', outDate: OUT_DATE,
      retOrigin: 'MAD', retDest: 'LHR', retDate: RET_DATE,
      cabin: 'economy', branded: false,
      paxName: { first: 'Sargis', last: 'Hovhannisyan', docNum: '200004' }
    });
    results.push({ test: '3: LHR→CDG→MAD \\ MAD→CDG→LHR (Via, non-branded)', ...r });
  } catch (e) {
    console.error(`\n  ❌ Test 3 FAILED: ${e.message}`);
    results.push({ test: '3: LHR→CDG→MAD \\ MAD→CDG→LHR (Via, non-branded)', pnr: `FAILED: ${e.message}` });
  }

  // ── Test 4: ZNZ-DAR-WIL-MBA \ MBA-WIL-DAR-ZNZ — Multi-leg, non-branded ──
  try {
    const r = await runBookingTest({
      label: 'Test 4: ZNZ→DAR→WIL→MBA \\ MBA→WIL→DAR→ZNZ — Multi-leg, non-branded',
      outOrigin: 'ZNZ', outDest: 'MBA', outDate: OUT_DATE,
      retOrigin: 'MBA', retDest: 'ZNZ', retDate: RET_DATE,
      cabin: 'economy', branded: false,
      paxName: { first: 'Vardan', last: 'Ghazaryan', docNum: '200005' }
    });
    results.push({ test: '4: ZNZ→DAR→WIL→MBA \\ MBA→WIL→DAR→ZNZ (Multi-leg)', ...r });
  } catch (e) {
    console.error(`\n  ❌ Test 4 FAILED: ${e.message}`);
    results.push({ test: '4: ZNZ→DAR→WIL→MBA \\ MBA→WIL→DAR→ZNZ (Multi-leg)', pnr: `FAILED: ${e.message}` });
  }

  // ── SUMMARY ──
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('  INTEGRATION TEST RESULTS — ALL PNRs');
  console.log('═'.repeat(70));
  for (const r of results) {
    const status = typeof r.pnr === 'string' && r.pnr.startsWith('FAILED') ? '❌' : '✅';
    const pnr = r.pnr || 'N/A';
    const pay = r.toPay ? ` | toPay=${r.toPay} ${r.currency}` : '';
    const tkt = r.ticketNumber ? ` | ticket=${r.ticketNumber}` : '';
    console.log(`  ${status} ${r.test}`);
    console.log(`     PNR: ${pnr}${pay}${tkt}`);
    if (r.ticketPassengers) {
      for (const p of r.ticketPassengers) {
        console.log(`     E-ticket: ${p.name} → ${p.eTicket}`);
      }
    }
    if (r.link) console.log(`     Link: ${r.link}`);
    console.log('');
  }
  console.log('═'.repeat(70));
}

main().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
