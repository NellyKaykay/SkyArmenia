<script lang="ts">
  export let title: string | null = null;
  export let method: 'POST' | 'GET' = 'POST';
  export let action: string | null = null;

  // Mensajes opcionales (para reusar en otros forms)
  export let error: string | null = null;
  export let success: string | null = null;

  // Centrado (igual a tu `.form.center`)
  export let center: boolean = true;

  // Props de accesibilidad opcionales
  export let ariaDescribedby: string | null = null;
  export let ariaLabel: string | null = null;
</script>

<form
  class={`form ${center ? 'center' : ''}`}
  method={method}
  action={action ?? undefined}
  aria-describedby={ariaDescribedby ?? undefined}
  aria-label={ariaLabel ?? undefined}
  {...$$restProps}
>
  {#if title}
    <h2 class="pane-title">{title}</h2>
  {/if}

  {#if error}
    <div class="alert">{error}</div>
  {/if}

  {#if success}
    <p class="legal ok centertext">{success}</p>
  {/if}

  <!-- Contenido del formulario (labels, inputs, etc.) -->
  <slot />

  <!-- Zona de acciones (botones) -->
  <div class="form-actions">
    <slot name="actions" />
  </div>
</form>

<style>
  /* ====== estilos heredados de tu login ====== */

  .form {
    display: grid; gap: 22px;
    width: 100%;
  }

  .center {
    justify-items: center; text-align: center;
    width: 100%; max-width: 400px; margin: 0 auto;
  }

  .pane-title {
    margin: 8px 0 16px; font-size: 1.28rem; font-weight: 700;
    color: var(--text); text-shadow: 0 1px 0 rgba(255,255,255,.35);
    text-align: center;
  }

  .form :global(label) { width: 100%; max-width: 400px; text-align: left; }
  .form :global(.lbl)  { display: block; margin-bottom: 8px; color: var(--text); font-weight: 600; text-shadow: 0 1px 0 rgba(255,255,255,.3); }

  .form :global(input),
  .form :global(select),
  .form :global(textarea) {
    width: 100%;
    height: 46px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.86);
    padding: 0 14px;
    font-size: .98rem;
    outline: none;
    font-family: inherit;
  }

  .form :global(textarea) {
    height: auto; min-height: 100px; padding: 12px 14px; resize: vertical;
  }

  .form :global(input:focus),
  .form :global(select:focus),
  .form :global(textarea:focus) {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(56,182,255,.18);
  }

  .alert {
    border: 1px solid #fecaca; background: rgba(254,226,226,.85); color: #991b1b;
    padding: 10px 12px; border-radius: 12px; font-size: .92rem;
    max-width: 400px; margin: 0 auto;
  }

  .legal {
    margin: 10px 0 0; color: var(--muted); font-size: .92rem; text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }
  .legal.ok { color: #065f46; } /* opcional para mensajes de éxito */
  .centertext { text-align: center; }

  .form-actions {
    display: flex; gap: 12px; justify-content: center; align-items: center;
    width: 100%;
  }

  @media (max-width: 520px) {
    .center { max-width: 100%; }
    .form :global(label) { max-width: 100%; }
  }
</style>
