// src/routes/admin/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  // Check if admin session cookie exists
  const adminSession = cookies.get('admin_session');

  if (!adminSession) {
    // Redirect to login if not authenticated
    throw redirect(302, '/admin/login');
  }

  return {
    title: 'Admin Dashboard'
  };
};
