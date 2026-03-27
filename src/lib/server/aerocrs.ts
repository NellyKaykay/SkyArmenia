// src/lib/server/aerocrs.ts
// Server-only AeroCRS API v5 connector.
import { getAeroCrsConfig } from '$lib/server/aerocrs-config';

function getCredentials() {
	const config = getAeroCrsConfig();
	return {
		baseUrl: config.baseUrl,
		authHeaders: config.authHeaders
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
