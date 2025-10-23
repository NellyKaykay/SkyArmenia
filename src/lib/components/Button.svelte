<script lang="ts">
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let href: string | null = null;
  export let disabled: boolean = false;
  export let label: string | null = null;

  // Tamaño: controla padding y altura
  export let size: 'sm' | 'md' | 'lg' = 'md';

  // Ancho completo opcional (100%)
  export let full: boolean = false;
</script>

{#if href}
  <a
    class={`btn ${size} ${full ? 'full' : ''}`}
    href={href}
    aria-label={label ?? undefined}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <button
    class={`btn ${size} ${full ? 'full' : ''}`}
    type={type}
    disabled={disabled}
    aria-label={label ?? undefined}
    {...$$restProps}
  >
    <slot />
  </button>
{/if}

<style>
  .btn {
    border: 1px solid #2563eb;
    border-radius: 8px;
    font-weight: 600;
    color: #000;
    background: #fff;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background .2s ease, box-shadow .2s ease;
    font-family: inherit;
    box-shadow: 0 2px 6px rgba(0,0,0,.08);
  }
  .btn:hover {
    background: #f7f9fc;
    box-shadow: 0 4px 10px rgba(0,0,0,.12);
  }
  .btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0,0,0,.18);
  }

  /* Tamaños */
  .btn.sm {
    padding: 4px 10px;
    min-height: 32px;
    font-size: .92rem;
  }
  .btn.md {
    padding: 6px 12px;
    min-height: 40px;
    font-size: 1rem;
  }
  .btn.lg {
    padding: 10px 16px;
    min-height: 46px;
    font-size: 1.05rem;
  }

  /* Ancho completo */
  .btn.full {
    display: block;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
</style>
