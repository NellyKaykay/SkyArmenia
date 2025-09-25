<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';

  // Valores que puede traer form (cuando usemos +page.server.ts)
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
            style="padding-right:40px;height:46px;"
          />
          <!-- El botón del ojo está centrado respecto al input de contraseña. Si cambias el height del input, ajusta top:26px. -->
          <button type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            on:click={() => showPassword = !showPassword}
            style="position:absolute;right:8px;top:26px;bottom:0;margin:auto 0;background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;height:36px;width:36px;pointer-events:auto;"
            tabindex="0"
          >
            <EyeIcon size={22} color={showPassword ? '#38b6ff' : '#888'} />
          </button>
        </label>

        <!-- ⬇️ contenedor de acciones -->
        <div slot="actions" class="actions-row">
          <Button type="submit" class="btn-signup">Registrarse</Button>
        </div>
      </Form>

      <p class="legal small centertext" style="margin-top:10px">
        ¿Ya tienes cuenta? <a class="link-register" href="/login">Inicia sesión</a>
      </p>

      <p class="legal small centertext">
        Al continuar, aceptas nuestras <a href="/terms">Condiciones del servicio</a> y nuestra
        <a href="/privacy">Política de privacidad</a>.
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

  /* Textos auxiliares */
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
  }
  .link-register:hover { text-decoration: none; }

  /* ⬇️ estira el botón en el slot */
  .actions-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    margin-top: 6px;
  }

  /* === ESTILO SOLO PARA EL BOTÓN "Registrarse" EN ESTA PÁGINA === */
  :global(.btn-signup) {
    display: block;
    height: 45px;
    width: 100%;
    margin: 0;
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

  /* móvil → ancho completo */
  @media (max-width: 520px) {
    .logo { height: 120px; }
    .modal { padding: 22px; }
  }
</style>
