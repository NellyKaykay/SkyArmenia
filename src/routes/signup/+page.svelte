<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';

  export let form:
    | { sent?: boolean; error?: string | null; values?: Record<string, any> }
    | undefined;

  let name = (form as any)?.values?.name ?? '';
  let email = (form as any)?.values?.email ?? '';
  let password = ''; // por seguridad no repintamos contraseña
  let sent = !!(form as any)?.sent;
  let error = (form as any)?.error ?? null;

  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);

  // --- NUEVO: chequeo de email en tiempo real
  let emailTaken: boolean | null = null; // null = desconocido, false = libre, true = ya existe
  let checking = false;
  let debounceId: any;

  async function doCheckEmail(current: string) {
    if (!current || !current.includes('@')) {
      emailTaken = null;
      return;
    }
    checking = true;
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(current)}`, {
        headers: { 'cache-control': 'no-cache' }
      });
      const j = await res.json();
      emailTaken = !!j.exists;
    } catch (_) {
      // si falla la red, no bloqueamos el submit, solo ocultamos el aviso
      emailTaken = null;
    } finally {
      checking = false;
    }
  }

  function onEmailInput(e: Event) {
    email = (e.target as HTMLInputElement).value.trim();
    emailTaken = null; // resetea el estado mientras escribe
    clearTimeout(debounceId);
    debounceId = setTimeout(() => doCheckEmail(email), 350); // debounce suave
  }

  function onEmailBlur() {
    // chequeo inmediato al salir del campo
    doCheckEmail(email);
  }
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- Fondo carousel -->
<div class="carousel-bg">
  <BgCarousel images={HERO_IMAGES} intervalMs={5000} />
</div>

<div class="login-wrap">
  <div class="modal">
    <div class="brand">
      <img src="/logo-skyarmenia.svg" alt="SkyArmenia" class="logo" loading="eager" decoding="async" />
    </div>

    {#if sent}
      <section class="pane" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
        <h2 class="pane-title">¡Revisa tu correo!</h2>
        <p class="legal">
          Te hemos enviado un enlace para confirmar tu cuenta
          {#if email}&nbsp;a <strong>{email}</strong>{/if}.<br />
          Abre tu email y sigue las instrucciones para completar el registro.
        </p>
        <p class="legal small centertext" style="margin-top:12px">
          ¿No te llegó? Mira en <em>Spam/Promociones</em> o intenta de nuevo con otro correo.
        </p>
      </section>
    {:else}
      <section class="pane" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
        <Form title="Crear cuenta" method="POST" action="?/signup" error={error}>
          <label for="name">
            <span class="lbl">Nombre</span>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              bind:value={name}
              autocomplete="name"
              required
            />
          </label>

          <label for="email">
            <span class="lbl">Email</span>
            <input
              id="email"
              name="email"
              type="email"
              inputmode="email"
              spellcheck="false"
              placeholder="tucorreo@ejemplo.com"
              bind:value={email}
              on:input={onEmailInput}
              on:blur={onEmailBlur}
              autocomplete="email"
              required
              aria-invalid={emailTaken === true}
              aria-describedby="email-help"
            />
            <p id="email-help" class="hint">
              {#if checking}
                Comprobando email…
              {:else if emailTaken === true}
                <span class="err">Este email ya está registrado. <a href="/login">Inicia sesión</a> o usa <a href="/login">“¿Olvidaste tu contraseña?”</a>.</span>
              {:else if emailTaken === false}
                <span class="ok">Este email está disponible.</span>
              {/if}
            </p>
          </label>

          <label for="password">
            <span class="lbl">Contraseña</span>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              bind:value={password}
              minlength="6"
              autocomplete="new-password"
              required
            />
          </label>

          <div slot="actions">
            <Button type="submit" class="btn-signup" disabled={emailTaken === true}>
              {#if emailTaken === true}No puedes continuar{:else}Crear cuenta{/if}
            </Button>
          </div>
        </Form>

        <p class="legal small centertext">
          ¿Ya tienes cuenta? <a class="link-register" href="/login">Inicia sesión</a>
        </p>

        <p class="legal small centertext">
          Al continuar, aceptas nuestras <a href="/terms">Condiciones del servicio</a> y nuestra
          <a href="/privacy">Política de privacidad</a>.
        </p>
      </section>
    {/if}
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
    min-height: 100dvh;
    padding: 24px;
    background: transparent;
    overflow: hidden;
    z-index: 1;
  }
  .modal {
    position: relative; z-index: 2;
    width: 100%; max-width: 520px;
    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: 26px;
  }
  .brand { display: grid; place-items: center; margin-bottom: 10px; text-align: center; }
  .logo { height: 100px; width: auto; margin-bottom: 0; }
  .pane { text-align: center; padding: 6px 0 4px; }

  .pane-title {
    margin: 8px 0 16px;
    font-size: 1.28rem;
    font-weight: 700;
    color: var(--text);
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }

  .legal { margin: 10px 0 0; color: var(--muted); font-size: .92rem; text-align: center; text-shadow: 0 1px 0 rgba(255,255,255,.35); }
  .legal.small { font-size: .86rem; }
  .centertext { text-align: center; }
  .link-register { font-weight: 600; text-decoration: underline; cursor: pointer; }
  .link-register:hover { text-decoration: none; }

  :global(.btn-signup) {
    display: block;
    height: 45px;
    width: 200px;
    margin: 6px auto 0;
    border-radius: 12px;
    border: 1px solid var(--accent);
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: .2px;
    color: #000;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,.1);
    transition: transform .08s ease, box-shadow .2s ease, background .2s ease;
  }
  :global(.btn-signup[disabled]) { opacity: .6; cursor: not-allowed; }

  .hint { margin: 6px 0 0; font-size: .85rem; min-height: 1.2em; }
  .hint .err { color: #b91c1c; font-weight: 600; }
  .hint .ok { color: #047857; font-weight: 600; }

  @media (max-width: 520px) {
    .logo { height: 120px; }
    .modal { padding: 22px; }
    :global(.btn-signup) { width: 100%; }
  }
</style>
