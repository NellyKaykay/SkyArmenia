// src/routes/api/admin/orders/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { ADMIN_TOKEN } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabase';

export const GET: RequestHandler = async ({ request }) => {
  // Verify admin token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token || token !== ADMIN_TOKEN) {
    return json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch all orders ordered by created_at DESC
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    return json({ orders });
  } catch (err) {
    console.error('Admin orders endpoint error:', err);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
