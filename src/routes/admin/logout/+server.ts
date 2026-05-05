// src/routes/admin/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
  // Clear the admin session cookie
  cookies.delete('admin_session', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  // Redirect to login page
  throw redirect(302, '/admin/login');
};

// Also support GET for convenience (though POST is safer for logout)
export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete('admin_session', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });

  throw redirect(302, '/admin/login');
};
