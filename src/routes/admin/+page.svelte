<script lang="ts">
  import { onMount } from 'svelte';
  let loggingOut = false;
  let currentTime = new Date();

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  async function handleLogout() {
    loggingOut = true;
    try {
      await fetch('/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/admin/login';
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
  <!-- Animated background elements -->
  <div class="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
  <div class="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
  <div class="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

  <!-- Header -->
  <header class="relative border-b border-white/10 backdrop-blur-md bg-white/5">
    <div class="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
          SkyArmenia Admin
        </h1>
        <p class="text-gray-300 text-sm mt-2 flex items-center gap-2">
          <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Dashboard
        </p>
      </div>
      <button
        on:click={handleLogout}
        disabled={loggingOut}
        class="group relative px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105"
      >
        <span class="relative z-10">{loggingOut ? 'Logging out...' : 'Logout'}</span>
        <div class="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="relative max-w-7xl mx-auto px-6 py-12 z-10">
    <!-- Welcome Card -->
    <div class="mb-12 p-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl backdrop-blur-md">
      <p class="text-gray-200">
        Welcome back! It's <span class="font-semibold text-purple-300">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </p>
    </div>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <!-- Orders Card -->
      <a
        href="/admin/orders"
        class="group relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-2xl p-8 block transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">Orders</h2>
            <span class="text-5xl group-hover:scale-125 transition-transform duration-500">📦</span>
          </div>
          <p class="text-gray-300 text-sm mb-6">View, manage and track all customer orders in real-time</p>
          <div class="inline-flex items-center px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/50 text-blue-200 rounded-lg text-xs font-semibold transition-all">
            View Orders <span class="ml-2">→</span>
          </div>
        </div>
      </a>

      <!-- Test Orders Card -->
      <a
        href="/admin/test-orders"
        class="group relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-2xl p-8 block transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-2"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">Test API</h2>
            <span class="text-5xl group-hover:scale-125 transition-transform duration-500">🧪</span>
          </div>
          <p class="text-gray-300 text-sm mb-6">Test and debug the orders API endpoint with live responses</p>
          <div class="inline-flex items-center px-4 py-2 bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-400/50 text-yellow-200 rounded-lg text-xs font-semibold transition-all">
            Run Tests <span class="ml-2">→</span>
          </div>
        </div>
      </a>

      <!-- Settings Card -->
      <div class="group relative bg-gradient-to-br from-gray-600/20 to-gray-700/20 border border-gray-600/30 rounded-2xl p-8 opacity-60 cursor-not-allowed">
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-400">Settings</h2>
            <span class="text-5xl grayscale">⚙️</span>
          </div>
          <p class="text-gray-400 text-sm mb-6">Configure admin settings and preferences</p>
          <div class="inline-flex items-center px-4 py-2 bg-gray-600/30 border border-gray-600/50 text-gray-400 rounded-lg text-xs font-semibold">
            Coming Soon
          </div>
        </div>
      </div>
    </div>

    <!-- Status Section -->
    <div class="mb-12">
      <h3 class="text-xl font-bold text-white mb-6">System Status</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Supabase Status -->
        <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-md hover:border-green-500/60 transition-all duration-300">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-14 w-14 rounded-lg bg-green-500/20 border border-green-500/50">
                <span class="text-2xl">✓</span>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-green-200">Supabase Connected</h3>
              <p class="text-xs text-green-300/80 mt-1">Database is online and responding normally</p>
              <div class="mt-3 w-full bg-gray-700/50 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin API Status -->
        <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-md hover:border-blue-500/60 transition-all duration-300">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-14 w-14 rounded-lg bg-blue-500/20 border border-blue-500/50">
                <span class="text-2xl">✓</span>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-blue-200">Admin API Active</h3>
              <p class="text-xs text-blue-300/80 mt-1">All endpoints are operational and healthy</p>
              <div class="mt-3 w-full bg-gray-700/50 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl p-8 backdrop-blur-md">
      <div class="flex items-start space-x-4">
        <span class="text-3xl mt-1">💡</span>
        <div>
          <h3 class="text-sm font-bold text-cyan-200 mb-2">Welcome to your Admin Panel</h3>
          <p class="text-sm text-cyan-300/90 leading-relaxed">
            You have access to powerful tools for managing your SkyArmenia platform. Use the navigation cards above to explore orders management, test the API, and more. Your session is secure and protected with authentication.
          </p>
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  @keyframes blob {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  :global(.animate-blob) {
    animation: blob 7s infinite;
  }

  :global(.animation-delay-2000) {
    animation-delay: 2s;
  }

  :global(.animation-delay-4000) {
    animation-delay: 4s;
  }

  :global(body) {
    background: linear-gradient(to bottom, #0f172a, #1e1b4b);
    color: #f1f5f9;
  }
</style>
