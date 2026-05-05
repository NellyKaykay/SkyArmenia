<script lang="ts">
  import { onMount } from 'svelte';

  // Temporary admin token for testing
  const ADMIN_TOKEN = 'david2026';

  interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    [key: string]: any;
  }

  let loading = true;
  let error: string | null = null;
  let response: { orders: Order[] } | null = null;
  let orderCount = 0;

  onMount(async () => {
    try {
      console.log('Starting request to /api/admin/orders');
      console.log(`Authorization: Bearer ${ADMIN_TOKEN}`);

      const res = await fetch('/api/admin/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        error = `HTTP Error ${res.status}: ${data.error || 'Unknown error'}`;
        loading = false;
        return;
      }

      response = data;
      orderCount = data.orders?.length || 0;
      error = null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      error = `Fetch Error: ${errorMessage}`;
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-100 py-8 px-4">
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Admin Orders - Test Page</h1>

      {#if loading}
        <div class="flex items-center justify-center py-8">
          <div class="text-lg text-gray-600">
            <span class="inline-block animate-spin mr-2">⏳</span>
            Loading orders...
          </div>
        </div>
      {:else if error}
        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <h2 class="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p class="text-red-700 font-mono text-sm">{error}</p>
        </div>
      {:else if response}
        <div class="space-y-6">
          <!-- Summary -->
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p class="text-blue-900 font-semibold">
              ✓ Success! Found <span class="font-bold text-lg">{orderCount}</span> order(s)
            </p>
          </div>

          <!-- Raw JSON Response -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-3">Raw JSON Response</h2>
            <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre class="text-sm font-mono">{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>

          <!-- Orders List -->
          {#if response.orders && response.orders.length > 0}
            <div>
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Orders Summary</h2>
              <div class="space-y-3">
                {#each response.orders as order (order.id)}
                  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="text-gray-600 font-semibold">ID:</span>
                        <p class="text-gray-900 font-mono break-all">{order.id}</p>
                      </div>
                      <div>
                        <span class="text-gray-600 font-semibold">Status:</span>
                        <p class="text-gray-900">{order.status}</p>
                      </div>
                      <div>
                        <span class="text-gray-600 font-semibold">Total Amount:</span>
                        <p class="text-gray-900 font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <span class="text-gray-600 font-semibold">Created:</span>
                        <p class="text-gray-900 text-xs">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Test Info -->
          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-6">
            <h3 class="text-sm font-semibold text-yellow-900 mb-2">Test Page Info</h3>
            <ul class="text-sm text-yellow-800 space-y-1 font-mono">
              <li>Token: {ADMIN_TOKEN}</li>
              <li>Endpoint: /api/admin/orders</li>
              <li>Method: GET</li>
              <li>Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }
</style>
