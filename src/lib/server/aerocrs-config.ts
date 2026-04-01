// src/lib/server/aerocrs-config.ts
// Centralized AeroCRS credentials and configuration.
// All AeroCRS modules import from here — credentials never leak to the client.
// Uses dynamic env so the build doesn't fail when vars aren't set at build time.

import { env } from '$env/dynamic/private';

export type AeroCrsEnvironment = 'LIVE' | 'TEST';

export interface AeroCrsConfig {
	baseUrl: string;
	authHeaders: Record<string, string>;
	environment: AeroCrsEnvironment;
}

/** Returns validated AeroCRS credentials. Throws if any env var is missing. */
export function getAeroCrsConfig(): AeroCrsConfig {
	const { AEROCRS_AUTH_ID, AEROCRS_AUTH_PASSWORD, AEROCRS_BASE_URL, AEROCRS_ENV } = env;

	const mode: AeroCrsEnvironment =
		AEROCRS_ENV?.toLowerCase() === 'test' ? 'TEST' : 'LIVE';

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
		environment: mode
	};
}
