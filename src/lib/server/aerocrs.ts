// src/lib/server/aerocrs.ts
// Server-only AeroCRS API v5 connector.

import {
	AEROCRS_AUTH_ID,
	AEROCRS_AUTH_PASSWORD,
	AEROCRS_BASE_URL
} from '$env/static/private';

function getCredentials() {
	if (!AEROCRS_AUTH_ID || !AEROCRS_AUTH_PASSWORD || !AEROCRS_BASE_URL) {
		throw new Error(
			'AeroCRS: missing environment variables (AEROCRS_AUTH_ID, AEROCRS_AUTH_PASSWORD, AEROCRS_BASE_URL)'
		);
	}
	return {
		baseUrl: AEROCRS_BASE_URL.replace(/\/+$/, ''),
		authHeaders: {
			'accept': 'application/json',
			'content-type': 'application/json',
			'auth_id': AEROCRS_AUTH_ID,
			'auth_password': AEROCRS_AUTH_PASSWORD
		}
	};
}

/** Authenticate a website user via AeroCRS IBE. */
export async function aeroCrsLogin(usrname: string, usrpass: string): Promise<unknown> {
	const { baseUrl, authHeaders } = getCredentials();
	const url = `${baseUrl}/webLogin`;

	console.log('[AeroCRS] webLogin request →', url);

	const response = await fetch(url, {
		method: 'POST',
		headers: authHeaders,
		body: JSON.stringify({
			logintype: 'web_agent',
			usrname,
			usrpass
		})
	});

	console.log('[AeroCRS] webLogin response status:', response.status);

	if (!response.ok) {
		const body = await response.text();
		console.error('[AeroCRS] webLogin FAILED:', body);
		throw new Error(`AeroCRS webLogin failed [${response.status}]: ${body}`);
	}

	const data = await response.json();
	console.log('[AeroCRS] webLogin SUCCESS');
	return data;
}

/** Retrieve airlines list — lightweight connectivity check. */
export async function aeroCrsGetAirlines(): Promise<unknown> {
	const { baseUrl, authHeaders } = getCredentials();
	const url = `${baseUrl}/getAirlines`;

	console.log('[AeroCRS] getAirlines request →', url);

	const response = await fetch(url, {
		method: 'GET',
		headers: authHeaders
	});

	console.log('[AeroCRS] getAirlines response status:', response.status);

	if (!response.ok) {
		const body = await response.text();
		console.error('[AeroCRS] getAirlines FAILED:', body);
		throw new Error(`AeroCRS getAirlines failed [${response.status}]: ${body}`);
	}

	const data = await response.json();
	console.log('[AeroCRS] getAirlines SUCCESS');
	return data;
}
