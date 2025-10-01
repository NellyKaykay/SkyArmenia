<!-- src/lib/components/Form.svelte -->
<script lang="ts">
  export let title: string | null = null;
  export let method: 'POST' | 'GET' = 'POST';
  export let action: string | null = null;

  // Mensajes opcionales
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

  <slot />

  <div class="form-actions">
    <slot name="actions" />
  </div>
</form>

<style>
  /* ===============================
     Variables controlables desde el padre (+page.svelte / .modal)
     (valores por defecto seguros)
     =============================== */
  .form {
    /* Tipografías */
    --fz-title: var(--form-fz-title, 1.28rem);      /* ej: clamp(20px, 3.2vw, 24px) */
    --fz-base:  var(--form-fz-base,  .98rem);       /* ej: clamp(13px, 1.5vw, 15px) */
    --fz-sec:   var(--form-fz-sec,   .92rem);       /* textos secundarios/legales */

    /* Layout y medidas */
    --form-gap: var(--form-gap, 22px);              /* ej: clamp(12px, 2.2vw, 16px) */
    --form-max: var(--form-max, 400px);             /* ej: clamp(320px, 92vw, 400px) */
    --field-h:  var(--form-field-h, 46px);          /* ej: clamp(40px, 4.8vw, 44px) */
    --radius:   var(--form-radius, 12px);           /* ej: clamp(10px, 1.6vw, 12px) */

    /* Márgenes del título (nuevo) */
    --title-mt: var(--form-title-mt, 8px);          /* ej: 0 para pegarlo al logo */
    --title-mb: var(--form-title-mb, 16px);         /* ej: clamp(6px,1vw,10px) */

    /* Padding interno de campos */
    --px: var(--form-input-px, 14px);
    --py: var(--form-input-py, 0);

    /* Focus */
    --focus-ring: var(--form-focus-ring, 0 0 0 3px rgba(56,182,255,.18));
  }

  .form {
    display: grid;
    gap: var(--form-gap);
    width: 100%;
  }

  .center {
    justify-items: center;
    text-align: center;
    width: 100%;
    max-width: var(--form-max);
    margin: 0 auto;
  }

  .pane-title {
    margin: var(--title-mt) 0 var(--title-mb); /* ← ahora controlable desde fuera */
    font-size: var(--fz-title);
    font-weight: 700;
    color: var(--text);
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
    text-align: center;
  }

  .form :global(label) {
    width: 100%;
    max-width: var(--form-max);
    text-align: left;
  }

  .form :global(.lbl) {
    display: block;
    margin-bottom: 8px;
    color: var(--text);
    font-weight: 600;
    font-size: var(--fz-base);
    text-shadow: 0 1px 0 rgba(255,255,255,.3);
  }

  .form :global(input),
  .form :global(select),
  .form :global(textarea) {
    width: 100%;
    height: var(--field-h);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: rgba(255,255,255,.86);
    padding: var(--py) var(--px);
    font-size: var(--fz-base);
    outline: none;
    font-family: inherit;
  }

  .form :global(textarea) {
    height: auto;
    min-height: 100px;
    padding: 12px var(--px);
    resize: vertical;
  }

  .form :global(input:focus),
  .form :global(select:focus),
  .form :global(textarea:focus) {
    border-color: var(--accent);
    box-shadow: var(--focus-ring);
  }

  .alert {
    border: 1px solid #fecaca;
    background: rgba(254,226,226,.85);
    color: #991b1b;
    padding: 10px 12px;
    border-radius: var(--radius);
    font-size: var(--fz-sec);
    max-width: var(--form-max);
    margin: 0 auto;
  }

  .legal {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: var(--fz-sec);
    text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }
  .legal.ok { color: #065f46; }
  .centertext { text-align: center; }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: var(--form-max);
  }

  @media (max-width: 520px) {
    .center { max-width: 100%; }
    .form :global(label) { max-width: 100%; }
    .form-actions { max-width: 100%; }
  }
</style>
