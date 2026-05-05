// src/routes/admin/login/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    // Validate credentials against environment variables
    if (username === env.ADMIN_USER && password === env.ADMIN_PASSWORD) {
      // Set httpOnly cookie for session (valid for 24 hours)
      cookies.set('admin_session', 'true', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return json({ success: true, message: 'Login successful' });
    }

    // Invalid credentials
    return json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
