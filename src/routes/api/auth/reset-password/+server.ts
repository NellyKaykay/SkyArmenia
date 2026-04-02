import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { email } = await request.json();
		if (!email || typeof email !== 'string') {
			return json({ ok: true }); // Don't reveal validation errors
		}

		const supabase = locals.supabase;
		await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: 'https://skyarmenia.com/auth/callback'
		});

		// Always return ok to prevent email enumeration
		return json({ ok: true });
	} catch {
		return json({ ok: true });
	}
};
