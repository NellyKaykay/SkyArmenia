<!-- Layout de autenticación - SkyArmenia -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  // Props del servidor (si las hay)
  interface AuthPageData extends App.PageData {
    // optional authenticated user info from the server (shape may vary)
    user?: Record<string, unknown>;
  }
  export let data: AuthPageData | undefined = undefined;

  // Estado de la aplicación de autenticación
  let isLoading = false;
  let authError = '';

  // Configuración de autenticación
  const AUTH_CONFIG = {
    redirectPaths: {
      afterLogin: '/',
      afterLogout: '/login',
      afterSignup: '/login?message=account_created'
    },
    securityHeaders: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  } as const;

  // Verificar si el usuario ya está autenticado
  $: currentPath = $page.url.pathname;
  $: isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/signup') || currentPath.startsWith('/forgot');

  // Redirección automática si ya está logueado
  onMount(async () => {
    if (browser && data?.user && isAuthPage) {
      await goto(AUTH_CONFIG.redirectPaths.afterLogin);
    }
  });

  // Función para manejar errores de autenticación
  function clearAuthError() {
    authError = '';
  }

  // Limpiar errores cuando cambie la ruta
  $: if (currentPath) {
    clearAuthError();
  }
</script>

<svelte:head>
  <!-- SEO y seguridad -->
  <meta name="robots" content="noindex, nofollow" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  
  <!-- Prevenir clickjacking (X-Frame-Options es un header HTTP; usar meta name para evitar error de tipado) -->
  <meta name="x-frame-options" content="DENY" />
  <meta name="x-content-type-options" content="nosniff" />
  
  <!-- CSP básico para formularios de auth -->
  <meta http-equiv="content-security-policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';" />
  
  <!-- Metadata específica de autenticación -->
  <meta name="theme-color" content="#38b6ff" />
  <meta name="format-detection" content="telephone=no" />
</svelte:head>

<!-- Layout de autenticación -->
<div class="auth-layout" data-page={currentPath.split('/').pop()}>
  <!-- Loading overlay global -->
  {#if isLoading}
    <div class="auth-loading" aria-label="Procesando autenticación">
      <div class="loading-spinner"></div>
      <span class="sr-only">Procesando...</span>
    </div>
  {/if}

  <!-- Error global de autenticación -->
  {#if authError}
    <div class="auth-error" role="alert" aria-live="assertive">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <span class="error-text">{authError}</span>
      <button 
        type="button" 
        class="error-close"
        on:click={clearAuthError}
        aria-label="Cerrar error"
      >
        ✕
      </button>
    </div>
  {/if}

  <!-- Contenido de las páginas de autenticación -->
  <main class="auth-content">
    <slot />
  </main>
</div>

<style>
  /* ================================
     Layout de Autenticación Profesional
     ================================ */

  .auth-layout {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg, #ffffff);
    isolation: isolate;
  }

  /* Contenido principal flexible */
  .auth-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;
  }

  /* ================================
     Loading Overlay Global
     ================================ */

  .auth-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--accent, #38b6ff);
    border-top: 3px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ================================
     Error Global de Autenticación
     ================================ */

  .auth-error {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    max-width: 90vw;
    width: max-content;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 4px solid #ef4444;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    z-index: 1000;
    animation: slideDown 0.3s ease-out;
  }

  .error-icon {
    font-size: 1.1em;
    color: #dc2626;
  }

  .error-text {
    color: #991b1b;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .error-close {
    background: none;
    border: none;
    color: #dc2626;
    font-weight: bold;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s ease;
  }

  .error-close:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-1rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }



  /* ================================
     Responsive Design
     ================================ */

  @media (max-width: 768px) {
    .auth-content {
      padding: 0.75rem;
    }
    
    .auth-error {
      top: 0.5rem;
      left: 0.5rem;
      right: 0.5rem;
      transform: none;
      max-width: none;
    }
  }

  @media (max-width: 480px) {
    /* Responsive styles mantenidos sin footer */
  }

  /* ================================
     Accessibility & Reduced Motion
     ================================ */

  @media (prefers-reduced-motion: reduce) {
    .loading-spinner {
      animation: none;
      border-top-color: var(--accent, #38b6ff);
    }
    
    .auth-error {
      animation: none;
    }
  }

  /* Accesibilidad para lectores de pantalla */
  .sr-only {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  /* ================================
     Variaciones por Página
     ================================ */

  .auth-layout[data-page="login"] {
    background: linear-gradient(135deg, rgba(56, 182, 255, 0.02) 0%, rgba(56, 182, 255, 0.05) 100%);
  }

  .auth-layout[data-page="signup"] {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(16, 185, 129, 0.05) 100%);
  }

  .auth-layout[data-page="forgot"] {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(245, 158, 11, 0.05) 100%);
  }
</style>