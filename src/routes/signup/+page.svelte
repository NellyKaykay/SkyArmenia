<script lang="ts">
  import { fade } from 'svelte/transition';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';
  import { i18n } from '$lib/i18n';

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
        title={$i18n['auth.signup.title']}
        method="POST"
        action="?/signup"
        error={error ?? null}
      >
        <label>
          <span class="lbl">{$i18n['auth.signup.name']}</span>
          <input
            name="name"
            type="text"
            placeholder={$i18n['auth.signup.name']}
            bind:value={name}
            required
          />
        </label>

        <label>
          <span class="lbl">{$i18n['auth.signup.email']}</span>
          <input
            name="email"
            type="email"
            placeholder={$i18n['auth.signup.email']}
            bind:value={email}
            required
          />
        </label>

        <label class="pwd">
          <span class="lbl">{$i18n['auth.signup.password']}</span>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={$i18n['auth.signup.password']}
            minlength="6"
            required
            bind:value={password}
          />
          <button
            type="button"
            aria-label={showPassword ? $i18n['auth.password.hide'] : $i18n['auth.password.show']}
            on:click={() => (showPassword = !showPassword)}
            class="eye"
            tabindex="0"
          >
            <EyeIcon size={22} color={showPassword ? '#38b6ff' : '#888'} />
          </button>
        </label>

        <!-- Aceptar términos (traducido con i18n) -->
        <div class="accept-block">
          <input id="accept" name="accept" type="checkbox" required />
          <label for="accept">
            {$i18n['legal.accept']}
            <a href="/terms" target="_blank" rel="noopener noreferrer">{$i18n['legal.terms']}</a>
            &nbsp;{$i18n['footer.and'] ?? 'y'}&nbsp;
            <a href="/privacy" target="_blank" rel="noopener noreferrer">{$i18n['legal.privacy']}</a>.
          </label>
        </div>

        <Button slot="actions" type="submit" size="md" full aria-label={$i18n['auth.signup.submit']}>
          {$i18n['auth.signup.submit']}
        </Button>
      </Form>

      <p class="legal small centertext">
        {$i18n['auth.signup.haveAccount']} <a class="link-register" href="/login">{$i18n['auth.signup.loginLink']}</a>
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
    pointer-events: none; /* igual que login */
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

    /* centra el contenido del grid igual que login */
    place-items: center;
    place-content: center;
  }

  .modal {
    position: relative; z-index: 2;
    width: 100%;
    max-width: 420px;            /* mismo ancho que login */
    margin-inline: auto;
    place-self: center;

    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: clamp(16px, 4vw, 26px);

    /* Variables que hereda el <Form>, idénticas a login */
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

  /* Campo contraseña con icono — calcado de login */
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

  /* Bloque de aceptación, sin afectar el ancho del modal */
  .accept-block {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 6px;
    text-align: left;
  }
  .accept-block input[type="checkbox"] {
    width: 16px; height: 16px; margin-top: 2px; cursor: pointer;
  }
  .accept-block label {
    font-size: .92rem; line-height: 1.35; color: var(--text); cursor: pointer;
  }

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
    margin-bottom: clamp(8px, 1.2vw, 12px);
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
