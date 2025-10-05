<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { ActionData } from './$types';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';
  import { i18n } from '$lib/i18n';

  export let form: ActionData | undefined;

  let email = (form as any)?.values?.email ?? '';
  let error = form?.error ?? '';
  let showPassword = false;
  let password = '';

  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);
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

    <section class="pane" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
      <Form
        title={$i18n['auth.login.title']}
        method="POST"
        action="?/login"
        error={error ?? null}
      >
        <label>
          <span class="lbl">{$i18n['auth.login.email']}</span>
          <input
            name="email"
            type="email"
            placeholder={$i18n['auth.login.email']}
            bind:value={email}
            required
            autocomplete="email"
            inputmode="email"
          />
        </label>

        <label class="pwd">
          <span class="lbl">{$i18n['auth.login.password']}</span>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={$i18n['auth.login.password']}
            minlength="6"
            required
            bind:value={password}
            autocomplete="current-password"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            on:click={() => (showPassword = !showPassword)}
            class="eye"
            tabindex="0"
          >
            <EyeIcon size={22} color={showPassword ? '#38b6ff' : '#888'} />
          </button>
        </label>

        <div class="aux">
          <a href="/forgot" class="link-forgot">{$i18n['auth.login.forgot']}</a>
        </div>

        <Button slot="actions" type="submit" size="md" full aria-label={$i18n['auth.login.submit']}>
          {$i18n['auth.login.submit']}
        </Button>
      </Form>

      <p class="legal small centertext">
        {$i18n['auth.login.noAccount']} <a class="link-register" href="/signup">{$i18n['auth.login.signupLink']}</a>
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
    pointer-events: none; /* igual que signup */
  }

  .login-wrap {
    --text:#1f2937;
    --muted:#6b7280;
    --border:#e6e8ee;
    --accent:#38b6ff;

    position: relative;
    display: grid;
    min-height: 100dvh;
    padding: clamp(12px, 4vw, 24px);
    padding-bottom: max(16px, env(safe-area-inset-bottom));
    background: transparent;
    overflow: hidden;
    z-index: 1;

    /* centra el contenido del grid igual que signup */
    place-items: center;
    place-content: center;
  }

  .modal {
    position: relative; z-index: 2;
    width: 100%;
    max-width: 420px;            /* MISMO ancho que signup */
    margin-inline: auto;
    place-self: center;

    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: clamp(16px, 4vw, 26px);

    /* Variables que hereda <Form>, IDÉNTICAS a signup */
    --form-max: 100%;
    --form-gap: clamp(10px, 2.2vw, 16px);
    --form-field-h: clamp(42px, 5.2vw, 46px);
    --form-radius: 12px;
    --form-fz-base: clamp(13px, 1.7vw, 15px);
    --form-fz-title: clamp(20px, 3.4vw, 24px);
  }

  .brand { display: grid; place-items: center; text-align: center; }
  .logo  { height: clamp(86px, 16vw, 140px); width: auto; margin-bottom: 0; }

  .pane { text-align: center; padding: 6px 0 4px; }

  .lbl { font-size: .92rem; display: inline-block; margin-bottom: 4px; }

  /* Campo contraseña con icono — EXACTO al de signup */
  .pwd { position: relative; display: block; }
  .pwd input { padding-right: 44px; }
  .eye {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-10px);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    height: 40px; width: 40px;
  }

  /* Enlace “olvidado…” alineado a la derecha y pegado al campo */
  .aux { text-align: right; margin-top: 6px; }
  .link-forgot { font-size: .92rem; text-decoration: underline; color: var(--text); }
  .link-forgot:hover { text-decoration: none; }

  .legal {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: .92rem;
    text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }
  .legal.small { font-size: .86rem; }
  .centertext { text-align: center; }

  .link-register {
    font-size: .92rem;
    text-decoration: underline;
    color: var(--text);
  }
  .link-register:hover { text-decoration: none; }

  :global(.modal .pane-title) {
    margin-top: clamp(2px, 0.5vw, 2px);
    margin-bottom: clamp(8px, 1.2vw, 12px); /* igual que signup */
  }

  /* Afinado responsive específico móvil estrecho */
  @media (max-width: 480px) {
    .modal {
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 10px 28px rgba(0,0,0,.14);
    }
  }
</style>
