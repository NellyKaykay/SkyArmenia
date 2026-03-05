// src/routes/api/aerocrs-login/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { aeroCrsGetAirlines } from '$lib/server/aerocrs';

export const GET: RequestHandler = async () => {
	try {
		const airlines = await aeroCrsGetAirlines();
		return json({ ok: true, airlines });
	} catch (err) {
		return json(
			{ ok: false, error: (err as Error)?.message || 'unknown error' },
			{ status: 500 }
		);
	}
};
