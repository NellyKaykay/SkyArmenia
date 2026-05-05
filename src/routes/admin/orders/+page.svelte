<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';

  interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
  }

  let orders: Order[] = [];
  let loading = true;
  let error: string | null = null;
  let loggingOut = false;

  async function handleLogout() {
    loggingOut = true;
    try {
      await fetch('/admin/logout', { method: 'POST' });
      // Redirect will be handled by server
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/admin/login';
    }
  }

  onMount(async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminToken) {
        error = 'Admin token not found. Please ensure you are logged in as an admin.';
        loading = false;
        return;
      }

      const response = await fetch('/api/admin/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          error = 'Unauthorized. Invalid admin token.';
        } else {
          error = `Failed to fetch orders: ${response.status}`;
        }
        loading = false;
        return;
      }

      const data = await response.json();
      orders = data.orders || [];
      error = null;
    } catch (err) {
      error = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="min-h-screen bg-gray-50 py-8 px-4">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Admin - Orders</h1>
      <button
        on:click={handleLogout}
        disabled={loggingOut}
        class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {loggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>

    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="text-lg text-gray-600">Loading orders...</div>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{error}</p>
      </div>
    {:else if orders.length === 0}
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">No orders found.</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Amount</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each orders as order (order.id)}
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-900 font-mono">{order.id}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusBadgeClass(order.status)}">
                      {order.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p class="text-sm text-gray-600">Showing {orders.length} order(s)</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    @apply bg-gray-50;
  }
</style>
