// src/lib/server/aerocrs-search.ts
// Server-only AeroCRS flight search via getAvailability endpoint.
// Uses GET + query params with date format yyyy/MM/dd.
import { getAeroCrsConfig } from '$lib/server/aerocrs-config';

export interface AeroCrsSearchParams {
	origin: string;
	destination: string;
	departureDate: string;       // 'YYYY-MM-DD'
	passengers?: number;         // defaults to 1
	cabinClass?: string;         // defaults to 'Economy'
}

function getConfig() {
	const config = getAeroCrsConfig();
	return {
		baseUrl: config.baseUrl,
		authHeaders: {
			accept: config.authHeaders.accept,
			auth_id: config.authHeaders.auth_id,
			auth_password: config.authHeaders.auth_password
		}
	};
}

/** Convert 'YYYY-MM-DD' → 'YYYY/MM/DD' (AeroCRS required format). */
function toAeroCrsDate(isoDate: string): string {
	return isoDate.replace(/-/g, '/');
}

export async function aeroCrsSearchFlights(params: AeroCrsSearchParams): Promise<unknown> {
	const { baseUrl, authHeaders } = getConfig();

	const qs = new URLSearchParams({
		start: toAeroCrsDate(params.departureDate),
		end: toAeroCrsDate(params.departureDate),
		origin: params.origin,
		destination: params.destination,
		adt: String(params.passengers ?? 1),
		chd: '0',
		inf: '0',
		cabin: params.cabinClass ?? 'Economy'
	});

	const url = `${baseUrl}/getAvailability?${qs.toString()}`;
	console.log('[AeroCRS] getAvailability GET →', url);

	const response = await fetch(url, {
		method: 'GET',
		headers: authHeaders
	});

	console.log('[AeroCRS] getAvailability response status:', response.status);

	if (!response.ok) {
		const text = await response.text();
		console.error('[AeroCRS] getAvailability FAILED:', text);
		throw new Error(`AeroCRS getAvailability failed [${response.status}]: ${text}`);
	}

	const data = await response.json();
	console.log('[AeroCRS] getAvailability SUCCESS');
	return data;
}
