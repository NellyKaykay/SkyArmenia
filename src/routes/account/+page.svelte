<script lang="ts">
  import type { Session } from '@supabase/supabase-js';
  export let data: { session: Session | null; user: any };

  const user = data.user;
</script>

<svelte:head>
  <title>Mi cuenta — SkyArmenia</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
  <div class="card">
    <h1>Mi cuenta</h1>

    <div class="info">
      <div><strong>Email:</strong> {user?.email}</div>
      <div><strong>ID:</strong> <code>{user?.id}</code></div>
      {#if user?.created_at}
        <div><strong>Creado:</strong> {new Date(user.created_at).toLocaleString()}</div>
      {/if}
    </div>

    <form method="post" action="/auth/logout" class="actions">
      <button type="submit" class="danger">Cerrar sesión</button>
    </form>

    <div class="links">
      <a href="/">← Volver al inicio</a>
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 70vh;
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
  }
  .card {
    width: 100%;
    max-width: 640px;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 20px rgba(0,0,0,.05);
    background: #fff;
  }
  h1 {
    font-size: 1.6rem;
    margin: 0 0 1rem 0;
  }
  .info {
    display: grid;
    gap: .5rem;
    margin-bottom: 1rem;
    font-size: .95rem;
  }
  code {
    user-select: all;
    background: #f3f4f6;
    padding: .1rem .35rem;
    border-radius: .35rem;
  }
  .actions {
    margin-top: .5rem;
  }
  .danger {
    height: 44px;
    border: none;
    border-radius: .75rem;
    background: #ef4444;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    padding: 0 1rem;
  }
  .links {
    margin-top: 1rem;
  }
  .links a { text-decoration: underline; }
</style>
