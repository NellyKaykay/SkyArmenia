<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { ActionData } from './$types';
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  export let form: ActionData | undefined;

  let email = (form as any)?.values?.email ?? '';
  let sent = !!form?.sent;
  let error = form?.error ?? '';

  // Imágenes del carousel (ajusta las rutas si es necesario)
  const HERO_IMAGES = Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`);

  async function onSubmit(e: Event) {
    e.preventDefault();
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
      <section class="pane" in:fade={{duration:180}} out:fade={{duration:120}}>
        <h2 class="pane-title">¡Revisa tu correo!</h2>
        <p class="legal">Te hemos enviado un enlace para acceder.<br />Abre tu email y haz clic en el enlace para continuar.</p>
      </section>
    {:else}
      <section class="pane" in:fade={{duration:180}} out:fade={{duration:120}}>
        <h2 class="pane-title">Iniciar sesión</h2>
        {#if error}
          <div class="alert">{error}</div>
        {/if}
        <form class="form center" method="POST" action="?/magic" on:submit={onSubmit}>
          <label>
            <span class="lbl">Email</span>
            <input name="email" type="email" placeholder="tucorreo@ejemplo.com" bind:value={email} required />
          </label>
          <button class="btn-login wide" type="submit">Entrar</button>
        </form>

        <p class="legal small centertext">
          ¿No tienes cuenta? <a class="link-register" href="/login">Regístrate</a>
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
  .login-wrap{
    --text:#1f2937;
    --muted:#6b7280;
    --border:#e6e8ee;
    --accent:#38b6ff;

    position: relative;
    display:grid;
    place-items:center;
    min-height: 100dvh;
    padding: 24px;
    background: transparent;
    overflow: hidden;
    z-index: 1;
  }
  .modal{
    position: relative; z-index: 2;
    width: 100%; max-width: 520px;
    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: 26px;
  }
  .brand{ display:grid; place-items:center; margin-bottom: 10px; text-align:center; }
  .logo{ height:100px; width:auto; margin-bottom: 0; }
  .form.center{
    display: grid; gap: 22px;
    justify-items: center; text-align: center;
    width: 100%; max-width: 400px; margin: 0 auto;
  }
  .form.center label{ width:100%; max-width: 400px; text-align: left; }
  .form.center .lbl{ display:block; margin-bottom:8px; color: var(--text); font-weight:600; text-shadow: 0 1px 0 rgba(255,255,255,.3); }
  .pane { text-align: center; padding: 6px 0 4px; }
  .pane-title{ margin: 8px 0 16px; font-size: 1.28rem; font-weight: 700; color: var(--text); text-shadow: 0 1px 0 rgba(255,255,255,.35); }
  input{
    width:100%; height:46px; border-radius:12px;
    border: 1px solid var(--border); background: rgba(255,255,255,.86); padding:0 14px;
    font-size: .98rem; outline:none;
  }
  input:focus{ border-color: var(--accent); box-shadow: 0 0 0 3px rgba(56,182,255,.18); }
  .btn-login{
    padding: 6px 12px;
    border: 1px solid var(--accent);
    border-radius: 8px;
    font-weight: 600;
    color: #000;
    background: #fff;
    text-decoration: none;
    min-height: 40px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .btn-login:hover { background: #f7f7f7; }
  .wide{ width: 100%; max-width: 400px; margin: 0 auto; }
  .legal{
    margin: 10px 0 0; color: var(--muted); font-size:.92rem; text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
  }
  .legal.small{ font-size:.86rem; }
  .centertext { text-align: center; }
  .link-register{
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
  .link-register:hover{ text-decoration: none; }
  .alert{
    border:1px solid #fecaca; background: rgba(254,226,226,.85); color:#991b1b;
    padding:10px 12px; border-radius:12px; font-size:.92rem;
    max-width: 400px; margin: 0 auto 10px;
  }
  @media (max-width: 520px){
    .logo { height: 120px; }
    .modal { padding: 22px; }
    .form.center { gap: 20px; max-width: 100%; }
    .wide, .form.center label { max-width: 100%; }
  }
</style>