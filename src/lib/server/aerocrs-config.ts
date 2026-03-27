// src/lib/server/aerocrs-config.ts
// Centralized AeroCRS credentials and configuration.
// All AeroCRS modules import from here — credentials never leak to the client.

import {
	AEROCRS_AUTH_ID,
	AEROCRS_AUTH_PASSWORD,
	AEROCRS_BASE_URL,
	AEROCRS_ENV
} from '$env/static/private';

export type AeroCrsEnvironment = 'LIVE' | 'TEST';

/** Resolved environment: defaults to LIVE unless explicitly set to "test". */
export const AEROCRS_MODE: AeroCrsEnvironment =
	AEROCRS_ENV?.toLowerCase() === 'test' ? 'TEST' : 'LIVE';

// Startup banner
console.log(`[AeroCRS] ▸ Environment: ${AEROCRS_MODE}`);
console.log(`[AeroCRS] ▸ API base:    ${AEROCRS_BASE_URL || '(not set)'}`);
console.log(`[AeroCRS] ▸ Auth ID:     ${AEROCRS_AUTH_ID ? AEROCRS_AUTH_ID.substring(0, 8) + '…' : '(not set)'}`);

if (AEROCRS_MODE === 'TEST') {
	console.warn('[AeroCRS] ⚠  Running in TEST mode — bookings will use test credentials');
}

export interface AeroCrsConfig {
	baseUrl: string;
	authHeaders: Record<string, string>;
	environment: AeroCrsEnvironment;
}

/** Returns validated AeroCRS credentials. Throws if any env var is missing. */
export function getAeroCrsConfig(): AeroCrsConfig {
	if (!AEROCRS_AUTH_ID || !AEROCRS_AUTH_PASSWORD || !AEROCRS_BASE_URL) {
		throw new Error(
			'AeroCRS: missing environment variables. Required: AEROCRS_AUTH_ID, AEROCRS_AUTH_PASSWORD, AEROCRS_BASE_URL'
		);
	}

	return {
		baseUrl: AEROCRS_BASE_URL.replace(/\/+$/, ''),
		authHeaders: {
			accept: 'application/json',
			'content-type': 'application/json',
			auth_id: AEROCRS_AUTH_ID,
			auth_password: AEROCRS_AUTH_PASSWORD
		},
		environment: AEROCRS_MODE
	};
}
