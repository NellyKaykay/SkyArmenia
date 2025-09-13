import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { provider } = params; // 'facebook' | 'google' | 'apple'
  // Cuando tengas OAuth real, cambia el destino según provider.
  throw redirect(302, '/login');
};

