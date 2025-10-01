<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';

  export let form:
    | { sent?: boolean; error?: string | null; values?: Record<string, any> }
    | undefined;

  let name = (form as any)?.values?.name ?? '';
  let email = (form as any)?.values?.email ?? '';
  let password = (form as any)?.values?.password ?? '';
  let showPassword = false;
  let sent = !!(form as any)?.sent;
  let error = (form as any)?.error ?? null;

  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="carousel-bg">
  <BgCarousel images={HERO_IMAGES} intervalMs={5000} />
</div>

<div class="login-wrap">
  <div class="modal">
    <div class="brand">
      <img src="/logo-skyarmenia.svg" alt="SkyArmenia" class="logo" loading="eager" decoding="async" />
    </div>

    <section class="pane" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
      <Form title="Crear cuenta" method="POST" action="?/signup" error={error ?? null}>
        <label>
          <span class="lbl">Nombre</span>
          <input
            name="name"
            type="text"
            placeholder="Tu nombre"
            bind:value={name}
            required
          />
        </label>

        <label>
          <span class="lbl">Email</span>
          <input
            name="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            bind:value={email}
            required
          />
        </label>

        <label style="position:relative;display:block;">
          <span class="lbl">Contraseña</span>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            minlength="6"
            bind:value={password}
            required
            style="padding-right:40px;height:40px;"
          />
          <button type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            on:click={() => showPassword = !showPassword}
            style="position:absolute;right:8px;top:26px;bottom:0;margin:auto 0;background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;height:36px;width:36px;pointer-events:auto;"
            tabindex="0"
          >
            <EyeIcon size={22} color={showPassword ? '#38b6ff' : '#888'} />
          </button>
        </label>

        <!-- ✅ Bloque aceptar condiciones -->
        <div class="accept-block">
          <input id="accept" name="accept" type="checkbox" required />
          <label for="accept">
            Acepto las <a href="/terms" target="_blank" rel="noopener noreferrer">Condiciones del servicio</a>
            y la <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.
          </label>
        </div>

        <div slot="actions" class="actions-row">
          <Button type="submit" class="btn-signup">Registrarse</Button>
        </div>
      </Form>

      <p class="legal small centertext" style="margin-top:10px">
        ¿Ya tienes cuenta? <a class="link-register" href="/login">Inicia sesión</a>
      </p>
    </section>
  </div>
</div>

<style>
  .carousel-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .login-wrap {
    --text:#1f2937;
    --muted:#6b7280;
    --border:#e6e8ee;
    --accent:#38b6ff;

    position: relative;
    display: grid;
    place-items: center;
    min-height: 100svh;
    padding: 16px;
    background: transparent;
    overflow: hidden;
    z-index: 1;
  }

  /* === Modal compacto === */
  .modal {
    position: relative; z-index: 2;
    width: min(380px, 92vw);
    background: color-mix(in oklab, white 60%, transparent);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    border: 1px solid rgba(0,0,0,.09);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
    padding: 18px 16px;
  }
  @media (min-width: 480px) {
    .modal { width: min(400px, 90vw); padding: 20px 18px; }
  }
  @media (min-width: 1024px) {
    .modal { width: 420px; padding: 22px 20px; }
  }

  /* Marca más compacta */
  .brand { display: grid; place-items: center; margin-bottom: 8px; text-align: center; }
  .logo { height: 120px; width: auto; margin-bottom: 0; }

  .pane { text-align: center; padding: 4px 0 2px; }

  /* === Campos compactos === */
  :global(form) { display: grid; gap: 10px; }

  .lbl { font-size: .82rem; opacity: .9; display: inline-block; margin-bottom: 4px; }

  :global(input[type="text"]),
  :global(input[type="email"]),
  :global(input[type="password"]) {
    height: 40px;
    padding: 8px 12px;
    font-size: .95rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #fff;
  }

  :global(input[name="password"]) {
    height: 40px !important;
    padding-right: 40px;
  }

  .actions-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    margin-top: 6px;
    gap: 8px;
  }

  :global(.btn-signup) {
    display: block;
    height: 42px;
    width: 100%;
    margin: 0;
    border-radius: 12px;
    border: 1px solid var(--accent);
    font-weight: 700;
    font-size: .95rem;
    letter-spacing: .2px;
    color: #000;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,.1);
    transition: transform .08s ease, box-shadow .2s ease, background .2s ease;
  }
  :global(.btn-signup:hover) {
    background: #f7f7f7;
    color: #000;
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,0,0,.15);
  }
  :global(.btn-signup:active) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0,0,0,.18);
  }
  :global(.btn-signup:focus-visible) {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(56,182,255,.35),
      0 0 0 6px rgba(56,182,255,.25);
  }

  .accept-block {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 8px;
    margin: 8px 0 0 0;
    text-align: left;
  }
  .accept-block input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    cursor: pointer;
  }
  .accept-block label {
    font-size: .9rem;
    line-height: 1.3;
    color: var(--text);
    cursor: pointer;
    text-align: left;
  }

  .legal {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: .85rem;
    text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }
  .legal.small { font-size: .82rem; }
  .centertext { text-align: center; }

  @media (max-width: 520px) {
    .logo { height: 110px; }
    .modal { padding: 18px; }
  }
</style>
