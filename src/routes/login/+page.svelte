<script lang="ts">  
  import { fade } from 'svelte/transition';
  import type { ActionData } from './$types';
  import BgCarousel from '$lib/components/BgCarousel.svelte'; // (solo importado, sin usar)
  export let form: ActionData | undefined;

  let email = (form as any)?.values?.email ?? '';
  let sent = !!form?.sent;
  let error = form?.error ?? '';

  async function onSubmit(e: Event) {
    e.preventDefault();
  }
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="login-wrap">
  <!-- Fondo: carrusel en esta página -->
  <div class="bg-carousel" aria-hidden="true">
    <i style="--i:0;  --img:url('/barcelona1.jpg')"></i>
    <i style="--i:1;  --img:url('/barcelona2.jpg')"></i>
    <i style="--i:2;  --img:url('/barcelona3.jpg')"></i>
    <i style="--i:3;  --img:url('/barcelona4.jpg')"></i>
    <i style="--i:4;  --img:url('/barcelona5.jpg')"></i>
    <i style="--i:5;  --img:url('/barcelona6.jpg')"></i>
    <i style="--i:6;  --img:url('/barcelona7.jpg')"></i>
    <i style="--i:7;  --img:url('/barcelona8.jpg')"></i>
    <i style="--i:8;  --img:url('/barcelona9.jpg')"></i>
    <i style="--i:9;  --img:url('/barcelona10.jpg')"></i>
    <i style="--i:10; --img:url('/barcelona11.jpg')"></i>
    <i style="--i:11; --img:url('/barcelona12.jpg')"></i>
    <b class="bg-overlay"></b>
  </div>

  <div class="modal">
    <div class="brand">
      <!-- ✅ Usar el SVG actualizado -->
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
          <!-- Botón estilo “Iniciar sesión” del header -->
          <button class="btn-login wide" type="submit">Entrar</button>
        </form>

        <!-- Nuevo enlace de registro -->
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
  }

  /* Carrusel de fondo */
  .bg-carousel { position: absolute; inset: 0; z-index: 0; }
  .bg-carousel i{
    position: absolute; inset: 0;
    background-image: var(--img);
    background-size: cover; background-position: center; background-repeat: no-repeat;
    opacity: 0;
    animation: bgFade 72s infinite ease-in-out;
    animation-delay: calc(var(--i) * 6s);
    transform: scale(1.02);
  }
  .bg-overlay{
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,.28));
    pointer-events: none;
  }
  @keyframes bgFade{
    0%{opacity:0} 4%{opacity:1} 12%{opacity:1} 16%{opacity:0} 100%{opacity:0}
  }

  .modal{
    position: relative; z-index: 1;
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

  /* Botón igual al del header */
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
