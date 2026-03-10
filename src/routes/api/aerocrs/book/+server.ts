// src/routes/api/aerocrs/book/+server.ts
// POST /api/aerocrs/book — full AeroCRS booking pipeline.
// Server-side only: credentials never reach the client.

import { json, type RequestHandler } from '@sveltejs/kit';
import { bookFlight, type BookingPassenger } from '$lib/server/aerocrs/booking';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// --- Validate required fields ---
		const { offerId, returnOfferId, origin, destination, passengers } = body;

		if (!offerId || typeof offerId !== 'string') {
			return json({ ok: false, error: 'Missing or invalid offerId' }, { status: 400 });
		}

		if (!origin || typeof origin !== 'string') {
			return json(
				{ ok: false, error: 'Missing or invalid origin (3-letter IATA code)' },
				{ status: 400 }
			);
		}

		if (!destination || typeof destination !== 'string') {
			return json(
				{ ok: false, error: 'Missing or invalid destination (3-letter IATA code)' },
				{ status: 400 }
			);
		}

		if (!Array.isArray(passengers) || passengers.length === 0) {
			return json(
				{ ok: false, error: 'passengers must be a non-empty array' },
				{ status: 400 }
			);
		}

		// Validate each passenger at the endpoint level (booking service does deeper validation)
		const validTypes = new Set(['ADT', 'CHD', 'INF']);
		for (let i = 0; i < passengers.length; i++) {
			const p = passengers[i];
			if (!p.type || !validTypes.has(p.type)) {
				return json(
					{ ok: false, error: `passengers[${i}].type must be ADT, CHD, or INF` },
					{ status: 400 }
				);
			}
			if (!p.firstName || typeof p.firstName !== 'string') {
				return json(
					{ ok: false, error: `passengers[${i}].firstName is required` },
					{ status: 400 }
				);
			}
			if (!p.lastName || typeof p.lastName !== 'string') {
				return json(
					{ ok: false, error: `passengers[${i}].lastName is required` },
					{ status: 400 }
				);
			}
			if (!p.birthDate || typeof p.birthDate !== 'string') {
				return json(
					{ ok: false, error: `passengers[${i}].birthDate is required (YYYY-MM-DD)` },
					{ status: 400 }
				);
			}
		}

		// --- Execute booking flow ---
		const result = await bookFlight({
			offerId,
			returnOfferId: returnOfferId || undefined,
			origin: origin.toUpperCase().trim(),
			destination: destination.toUpperCase().trim(),
			passengers: passengers as BookingPassenger[]
		});

		return json({
			ok: true,
			bookingReference: result.bookingReference
		});
	} catch (err) {
		const message = (err as Error)?.message || 'Unknown booking error';
		console.error('[AeroCRS Booking] endpoint error:', message);

		return json({ ok: false, error: message }, { status: 500 });
	}
};
