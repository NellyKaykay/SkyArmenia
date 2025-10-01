<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { ActionData } from './$types';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';

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
        title="Iniciar sesión"
        method="POST"
        action="?/login"
        error={error ?? null}
      >
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
            required
            bind:value={password}
            style="padding-right:40px;"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            on:click={() => (showPassword = !showPassword)}
            style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;height:40px;width:40px;"
            tabindex="0"
          >
            <EyeIcon size={22} color={showPassword ? '#38b6ff' : '#888'} />
          </button>

          <div style="text-align:right;margin-top:8px;">
            <a href="/forgot" class="link-forgot">¿Has olvidado tu contraseña?</a>
          </div>
        </label>

        <Button slot="actions" type="submit" size="md" full aria-label="Entrar">Entrar</Button>
      </Form>

      <p class="legal small centertext" style="margin-top:10px">
        ¿No tienes cuenta? <a class="link-register" href="/signup">Regístrate</a>
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
    min-height: 100dvh;
    padding: 24px;
    background: transparent;
    overflow: hidden;
    z-index: 1;
  }

  .modal {
    position: relative; z-index: 2;
    width: clamp(320px, 92vw, 420px);
    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: clamp(12px, 2.2vw, 16px);
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: clamp(18px, 4vw, 28px);
    

    /* Variables que hereda el Form (compacto y consistente) */
    --form-max: clamp(320px, 92vw, 400px);
    --form-gap: clamp(12px, 2.2vw, 16px);
    --form-field-h: clamp(40px, 4.8vw, 44px);
    --form-radius: clamp(10px, 1.6vw, 12px);
    --form-fz-base: clamp(13px, 1.5vw, 15px);
    --form-fz-title: clamp(20px, 3.2vw, 24px);
  }
  

  /* LOGO y BRAND más compactos */
  .brand {
    display: grid;
    place-items: center;
    text-align: center;
  }
  .logo {
    height: clamp(80px, 14vw, 140px);
    width: auto;
    margin-bottom: 0;
  }

  .pane { text-align: center; padding: 6px 0 4px; }

  /* Enlaces auxiliares (tamaños coherentes) */
  .legal {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: .92rem;
    text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }
  .legal.small { font-size: .86rem; }
  .centertext { text-align: center; }

  .link-register,
  .link-forgot {
    font-size: .92rem;
    text-decoration: underline;
    color: var(--text);
  }
  .link-register:hover,
  .link-forgot:hover {
    text-decoration: none;
  }
  :global(.modal .pane-title) {
  margin-top: clamp(2px, 0.5vw, 0.5px);
  margin-bottom: clamp(8px, 1.2vw, 12px);
}

</style>
