// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const origin = url.searchParams.get('origin');
	const destination = url.searchParams.get('destination');
	const depart = url.searchParams.get('depart');

	// No search params → no search (initial page load)
	if (!origin || !destination || !depart) {
		return { searchResults: null, searchError: null };
	}

	// Forward all search params to the internal API endpoint
	const apiUrl = `/api/search?${url.searchParams.toString()}`;

	try {
		const res = await fetch(apiUrl);
		const json = await res.json();

		if (!json.ok) {
			return { searchResults: null, searchError: json.error || 'Search failed' };
		}

		return { searchResults: json, searchError: null };
	} catch (err) {
		return {
			searchResults: null,
			searchError: (err as Error)?.message || 'Network error'
		};
	}
};
