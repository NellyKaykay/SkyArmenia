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
      <Form title="Iniciar sesión" method="POST" action="?/login" error={error ?? null}>
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
            style="padding-right:40px;height:46px;"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            on:click={() => (showPassword = !showPassword)}
            style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;height:36px;width:36px;pointer-events:auto;"
            tabindex="0"
          >
            <EyeIcon size={22} color={showPassword ? '#38b6ff' : '#888'} />
          </button>

          <!-- Enlace olvidaste contraseña: mismo tamaño que 'Regístrate' y alineado a la derecha -->
          <div style="text-align:right;margin-top:8px;">
            <a href="/forgot" class="link-forgot">¿Has olvidado tu contraseña?</a>
          </div>
        </label>

        <!-- ⬇️ contenedor de acciones que estira el botón -->
        <div slot="actions" class="actions-row">
          <Button type="submit" class="btn-login">Entrar</Button>
        </div>
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

  /* Textos auxiliares (heredados) */
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
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.92rem; /* referencia de tamaño */
  }
  .link-register:hover { text-decoration: none; }

  /* Olvidaste contraseña: igual tamaño que 'Regístrate' */
  .link-forgot {
    font-size: 0.92rem;
    font-weight: 400;
    text-decoration: underline;
    color: var(--text);
  }
  .link-forgot:hover {
    text-decoration: none;
  }

  /* ⬇️ hace que el slot de acciones estire su contenido */
  .actions-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    margin-top: 6px;
  }

  /* === ESTILO SOLO PARA EL BOTÓN "Entrar" EN ESTA PÁGINA === */
  :global(.btn-login) {
    display: block;
    height: 45px;
    width: 100%;
    margin: 0;                          /* alineado con labels */
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
  :global(.btn-login:hover) {
    background: #f7f7f7;
    color: #000;
    border-color: var(--accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0,0,0,.15);
  }
  :global(.btn-login:active) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0,0,0,.18);
  }
  :global(.btn-login:focus-visible) {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(56,182,255,.35),
      0 0 0 6px rgba(56,182,255,.25);
  }

  /* móvil → ancho completo */
  @media (max-width: 520px) {
    .logo { height: 120px; }
    .modal { padding: 22px; }
  }
</style>
