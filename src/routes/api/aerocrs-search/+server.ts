// src/routes/api/aerocrs-search/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { aeroCrsSearchFlights } from '$lib/server/aerocrs-search';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.searchParams.get('origin') || 'EVN';
	const destination = url.searchParams.get('destination') || 'BCN';
	const departureDate = url.searchParams.get('date') || '2026-06-15';
	const passengers = Number(url.searchParams.get('passengers')) || 1;
	const cabinClass = url.searchParams.get('cabin') || 'Economy';

	try {
		const result = await aeroCrsSearchFlights({
			origin,
			destination,
			departureDate,
			passengers,
			cabinClass
		});
		return json({ ok: true, result });
	} catch (err) {
		return json(
			{ ok: false, error: (err as Error)?.message || 'unknown error' },
			{ status: 500 }
		);
	}
};
