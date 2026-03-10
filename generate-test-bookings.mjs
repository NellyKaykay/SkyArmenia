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

function infantPax(first, last, num) {
  return {
    paxtitle: 'Inf.',
    firstname: first,
    lastname: last,
    paxage: null,
    paxnationailty: 'AM',
    paxdoctype: 'PP',
    paxdocnumber: `AM${num}`,
    paxdocissuer: 'AM',
    paxdocexpiry: '2030/12/31',
    paxbirthdate: '2025/01/10',
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
  results.push({ num: 1, desc: 'OW 1 ADT', pnr });

  // 2. Return, 1 ADT
  console.log('\n=== BOOKING 2: RT, 1 ADT ===');
  bid = await createBooking('RT', 1, 0, 0, RT_LEGS);
  pnr = await confirmBooking(bid, [adultPax('Gevorg', 'Hakobyan', '100002')]);
  results.push({ num: 2, desc: 'RT 1 ADT', pnr });

  // 3. Return, 2 ADT
  console.log('\n=== BOOKING 3: RT, 2 ADT ===');
  bid = await createBooking('RT', 2, 0, 0, RT_LEGS);
  pnr = await confirmBooking(bid, [
    adultPax('Tigran', 'Sargsyan', '100003'),
    adultPax('Anahit', 'Sargsyan', '100004')
  ]);
  results.push({ num: 3, desc: 'RT 2 ADT', pnr });

  // 4. One-way, 1 ADT + 1 INF
  console.log('\n=== BOOKING 4: OW, 1 ADT + 1 INF ===');
  bid = await createBooking('OW', 1, 0, 1, OW_LEG);
  pnr = await confirmBooking(bid, [
    adultPax('Narek', 'Hovhannisyan', '100005'),
    infantPax('Ani', 'Hovhannisyan', '100006')
  ]);
  results.push({ num: 4, desc: 'OW 1 ADT + 1 INF', pnr });

  // 5. Return, 1 ADT + 1 INF
  console.log('\n=== BOOKING 5: RT, 1 ADT + 1 INF ===');
  bid = await createBooking('RT', 1, 0, 1, RT_LEGS);
  pnr = await confirmBooking(bid, [
    adultPax('Davit', 'Grigoryan', '100007'),
    infantPax('Lusine', 'Grigoryan', '100008')
  ]);
  results.push({ num: 5, desc: 'RT 1 ADT + 1 INF', pnr });

  // Summary
  console.log('\n══════════════════════════════════════════');
  console.log('  ALL 5 BOOKING REFERENCES FOR GO7');
  console.log('══════════════════════════════════════════');
  results.forEach(r => {
    console.log(`  ${r.num}. ${r.desc.padEnd(22)} → PNR: ${r.pnr}`);
  });
  console.log('══════════════════════════════════════════\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
