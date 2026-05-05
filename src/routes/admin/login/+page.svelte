<script lang="ts">
  let username = '';
  let password = '';
  let loading = false;
  let error: string | null = null;

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = null;

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        error = data.error || 'Login failed';
        loading = false;
        return;
      }

      // Successful login - redirect to orders page
      window.location.href = '/admin/orders';
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center px-4">
  <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">Admin Login</h1>
    <p class="text-gray-600 text-center mb-8">SkyArmenia Orders System</p>

    {#if error}
      <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800 text-sm font-medium">{error}</p>
      </div>
    {/if}

    <form on:submit={handleLogin} class="space-y-4">
      <!-- Username Input -->
      <div>
        <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          bind:value={username}
          placeholder="Enter your username"
          disabled={loading}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
      </div>

      <!-- Password Input -->
      <div>
        <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Enter your password"
          disabled={loading}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          required
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <!-- Footer -->
    <p class="text-gray-600 text-xs text-center mt-6">
      © 2026 SkyArmenia. All rights reserved.
    </p>
  </div>
</div>
