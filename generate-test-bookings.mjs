// generate-test-bookings.mjs
// Generates the 5 test bookings required by GO7 for LIVE activation.
// Run with: node generate-test-bookings.mjs

const AUTH_ID = 'BEFDA2FA-9298-4D6C-B75B-AE69F6C44F24';
const AUTH_PASSWORD = '1f?5)CEKi[r6';
const BASE = 'https://api.aerocrs.com/v5';

const HEADERS = {
  'accept': 'application/json',
  'content-type': 'application/json',
  'auth_id': AUTH_ID,
  'auth_password': AUTH_PASSWORD
};

// IDs from getDeepLink (TLV-LHR / LHR-TLV, 2026-06-15 / 2026-06-20, class K)
const OUT_FLIGHT_ID = 45835144; // TLV→LHR API101 K
const OUT_FARE_ID   = 490583;
const RET_FLIGHT_ID = 45835154; // LHR→TLV API101 K
const RET_FARE_ID   = 490583;

async function createBooking(triptype, adults, child, infant, bookflights) {
  const body = { aerocrs: { parms: { triptype, adults, child, infant, bookflight: bookflights } } };
  console.log(`  createBooking ${triptype} adt=${adults} chd=${child} inf=${infant} legs=${bookflights.length}`);
  const res = await fetch(`${BASE}/createBooking`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data?.aerocrs?.success) throw new Error('createBooking failed: ' + JSON.stringify(data));
  const b = data.aerocrs.booking;
  console.log(`  → bookingId=${b.bookingid} pnrRef=${b.pnrref} total=${b.totalprice} ${b.currency}`);
  return b.bookingid;
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
  console.log(`  confirmBooking bookingId=${bookingId} pax=${passengers.length}`);
  const res = await fetch(`${BASE}/confirmBooking`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data?.aerocrs?.success) throw new Error('confirmBooking failed: ' + JSON.stringify(data));
  const a = data.aerocrs;
  console.log(`  → PNR=${a.pnrref} status=${a.status} toPay=${a.topay} ${a.currency}`);
  return a.pnrref;
}

async function ticketBooking(bookingId) {
  const body = { aerocrs: { parms: { bookingid: bookingId } } };
  console.log(`  ticketBooking bookingId=${bookingId}`);
  const res = await fetch(`${BASE}/ticketBooking`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
  const data = await res.json();
  if (!data?.aerocrs?.success) throw new Error('ticketBooking failed: ' + JSON.stringify(data));
  const a = data.aerocrs;
  console.log(`  → ticket=${a.ticketnumber} invoice=${a.invoicenumber}`);
  if (Array.isArray(a.passengers)) {
    for (const p of a.passengers) {
      console.log(`    ${p.title} ${p.firstname} ${p.lastname} → e-ticket: ${p['e-ticket']}`);
    }
  }
  return a.ticketnumber;
}

function adultPax(first, last, num) {
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

function childPax(first, last, num) {
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
    paxbirthdate: '2014/03/10',
    paxphone: '',
    paxemail: ''
  };
}

const OW_LEG = [{ fromcode: 'TLV', tocode: 'LHR', flightid: OUT_FLIGHT_ID, fareid: OUT_FARE_ID }];
// NOTE: AeroCRS sandbox stores return flight with same from/to codes as outbound.
// The fromcode/tocode must match the flight record, not the logical travel direction.
const RT_LEGS = [
  { fromcode: 'TLV', tocode: 'LHR', flightid: OUT_FLIGHT_ID, fareid: OUT_FARE_ID },
  { fromcode: 'TLV', tocode: 'LHR', flightid: RET_FLIGHT_ID, fareid: RET_FARE_ID }
];

async function main() {
  const results = [];

  // 1. One-way, 1 ADT
  console.log('\n=== BOOKING 1: OW, 1 ADT ===');
  let bid = await createBooking('OW', 1, 0, 0, OW_LEG);
  let pnr = await confirmBooking(bid, [adultPax('Armen', 'Petrosyan', '100001')]);
  let tkt = await ticketBooking(bid);
  results.push({ num: 1, desc: 'OW 1 ADT', pnr, tkt });

  // 2. Return, 1 ADT
  console.log('\n=== BOOKING 2: RT, 1 ADT ===');
  bid = await createBooking('RT', 1, 0, 0, RT_LEGS);
  pnr = await confirmBooking(bid, [adultPax('Gevorg', 'Hakobyan', '100002')]);
  tkt = await ticketBooking(bid);
  results.push({ num: 2, desc: 'RT 1 ADT', pnr, tkt });

  // 3. Return, 2 ADT
  console.log('\n=== BOOKING 3: RT, 2 ADT ===');
  bid = await createBooking('RT', 2, 0, 0, RT_LEGS);
  pnr = await confirmBooking(bid, [
    adultPax('Tigran', 'Sargsyan', '100003'),
    adultPax('Anahit', 'Sargsyan', '100004')
  ]);
  tkt = await ticketBooking(bid);
  results.push({ num: 3, desc: 'RT 2 ADT', pnr, tkt });

  // 4. One-way, 1 ADT + 1 CHD (child age 12, sandbox min age = 11)
  console.log('\n=== BOOKING 4: OW, 1 ADT + 1 CHD ===');
  bid = await createBooking('OW', 2, 0, 0, OW_LEG);
  pnr = await confirmBooking(bid, [
    adultPax('Narek', 'Hovhannisyan', '100005'),
    childPax('Ani', 'Hovhannisyan', '100006')
  ]);
  tkt = await ticketBooking(bid);
  results.push({ num: 4, desc: 'OW 1 ADT + 1 CHD', pnr, tkt });

  // 5. Return, 1 ADT + 1 CHD (child age 12, sandbox min age = 11)
  console.log('\n=== BOOKING 5: RT, 1 ADT + 1 CHD ===');
  bid = await createBooking('RT', 2, 0, 0, RT_LEGS);
  pnr = await confirmBooking(bid, [
    adultPax('Davit', 'Grigoryan', '100007'),
    childPax('Lusine', 'Grigoryan', '100008')
  ]);
  tkt = await ticketBooking(bid);
  results.push({ num: 5, desc: 'RT 1 ADT + 1 CHD', pnr, tkt });

  // Summary
  console.log('\n══════════════════════════════════════════');
  console.log('  ALL 5 BOOKING REFERENCES FOR GO7');
  console.log('══════════════════════════════════════════');
  results.forEach(r => {
    console.log(`  ${r.num}. ${r.desc.padEnd(22)} → PNR: ${r.pnr}  Ticket: ${r.tkt}`);
  });
  console.log('══════════════════════════════════════════\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
