<script lang="ts">
  import type { ActionData } from './$types';
  export let form: ActionData | undefined;

  let showPw = false;
  let showPw2 = false;
  let emailPrefill = (form as any)?.values?.email ?? '';
</script>

<svelte:head>
  <title>Crear cuenta — SkyArmenia</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
  <div class="card">
    <h1>Crear cuenta</h1>

    {#if form?.error}
      <div class="alert" role="alert">{form.error}</div>
    {/if}

    <form method="post" class="form" autocomplete="on">
      <label>
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={emailPrefill}
          required
          autocomplete="email"
        />
      </label>

      <label class="pw">
        <span>Contraseña</span>
        <div class="pw-row">
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            required
            autocomplete="new-password"
            minlength="6"
          />
          <button type="button" class="ghost" on:click={() => (showPw = !showPw)}>
            {showPw ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </label>

      <label class="pw">
        <span>Repite contraseña</span>
        <div class="pw-row">
          <input
            name="confirm"
            type={showPw2 ? 'text' : 'password'}
            placeholder="Repite tu contraseña"
            required
            autocomplete="new-password"
            minlength="6"
          />
          <button type="button" class="ghost" on:click={() => (showPw2 = !showPw2)}>
            {showPw2 ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      </label>

      <button type="submit" class="primary">Crear cuenta</button>
    </form>

    <div class="links">
      <a href="/auth/login">¿Ya tienes cuenta? Inicia sesión</a>
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
    max-width: 420px;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 20px rgba(0,0,0,.05);
    background: #fff;
  }
  h1 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
  }
  .alert {
    background: #fee2e2;
    border: 1px solid #fecaca;
    padding: .75rem;
    border-radius: .75rem;
    margin-bottom: 1rem;
    font-size: .95rem;
  }
  .form {
    display: grid;
    gap: .9rem;
  }
  label {
    display: grid;
    gap: .4rem;
    font-size: .9rem;
  }
  input {
    width: 100%;
    height: 42px;
    border: 1px solid #d1d5db;
    border-radius: .65rem;
    padding: 0 .9rem;
    outline: none;
  }
  input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96,165,250,.25);
  }
  .pw-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: .5rem;
    align-items: center;
  }
  .ghost {
    height: 42px;
    border: 1px solid #d1d5db;
    background: transparent;
    border-radius: .65rem;
    padding: 0 .9rem;
    cursor: pointer;
  }
  .primary {
    height: 44px;
    border: none;
    border-radius: .75rem;
    background: var(--accent, #38b6ff);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  .links {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    font-size: .9rem;
  }
  .links a { text-decoration: underline; }
</style>
