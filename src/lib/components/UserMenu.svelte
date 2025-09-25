<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';

  // Recibe el usuario desde +layout.svelte (data.user)
  export let user:
    | { email?: string; user_metadata?: { name?: string } }
    | null = null;

  let open = false;

  // Nombre visible: metadata.name → email (parte antes de @) → fallback “Cuenta”
  $: displayName =
    (user?.user_metadata?.name?.trim?.()) ||
    (user?.email ? user.email.split('@')[0] : 'Cuenta');

  // Cerrar al hacer click fuera
  onMount(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest?.('.user-menu')) open = false;
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  });
</script>

<div class="user-menu relative">
  {#if user}
    <button
      class="btn user-btn"
      on:click={() => (open = !open)}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {displayName}
      <span aria-hidden="true">▾</span>
    </button>

    {#if open}
      <div
        class="menu absolute right-0 mt-2 min-w-[10rem] rounded-2xl shadow p-2 bg-white/95 backdrop-blur"
        role="menu"
      >
        <a class="menu-item block px-3 py-2 rounded-xl hover:bg-black/5" href="/profile" role="menuitem">
          {$i18n['nav.profile']}
        </a>
        <a class="menu-item block px-3 py-2 rounded-xl hover:bg-black/5" href="/logout" role="menuitem">
          {$i18n['nav.logout']}
        </a>
      </div>
    {/if}
  {:else}
    <a class="btn login-btn" href="/login">{$i18n['nav.login']}</a>
  {/if}
</div>

<style>
  .btn {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .5rem .9rem; border: 1px solid #cfd8dc; border-radius: 999px;
    background: white; font-weight: 600;
  }
  .btn:hover { background: #f7fafc; }
</style>
