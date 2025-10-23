<script lang="ts">
  import { onMount } from 'svelte';
  import { i18n } from '$lib/i18n';
  import Button from './Button.svelte';

  // Recibe el usuario desde +layout.svelte (data.user)
  export let user:
    | { email?: string; user_metadata?: { name?: string } }
    | null = null;

  let open = false;
  let menuEl: HTMLElement | null = null;
  let buttonEl: HTMLButtonElement | null = null;

  // Nombre visible: metadata.name → email completo → fallback "Cuenta"
  $: displayName =
    (user?.user_metadata?.name?.trim?.()) ||
    (user?.email || 'Cuenta');

  // Toggle con animación suave
  function toggleMenu() {
    open = !open;
  }

  // Cerrar menú
  function closeMenu() {
    open = false;
  }

  // Cerrar al hacer click fuera o Escape
  onMount(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuEl || !buttonEl) return;
      if (!menuEl.contains(target) && !buttonEl.contains(target)) {
        closeMenu();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        buttonEl?.focus();
      }
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div class="user-menu">
  {#if user}
    <!-- Botón de usuario con avatar -->
    <button
      bind:this={buttonEl}
      class="user-btn"
      on:click={toggleMenu}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label="Menú de usuario"
    >
      <div class="avatar">
        <span class="avatar-text">{displayName.charAt(0).toUpperCase()}</span>
      </div>
      <span class="user-name">{displayName}</span>
      <svg 
        class="chevron" 
        class:rotated={open}
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        aria-hidden="true"
      >
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </button>

    <!-- Menú desplegable con animación -->
    {#if open}
      <div
        bind:this={menuEl}
        class="dropdown-menu"
        role="menu"
        aria-labelledby="user-menu-button"
      >
        <div class="menu-header">
          <div class="user-info">
            <div class="avatar-large">
              <span class="avatar-text-large">{displayName.charAt(0).toUpperCase()}</span>
            </div>
            <div class="user-details">
              <div class="user-name-large">{displayName}</div>
              <div class="user-email">{user.email}</div>
            </div>
          </div>
        </div>
        
        <div class="menu-divider"></div>
        
        <div class="menu-items">
          <form method="POST" action="/logout" class="logout-form">
            <button type="submit" class="menu-item logout-item" role="menuitem">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {$i18n['nav.logout'] || 'Cerrar sesión'}
            </button>
          </form>
        </div>
      </div>
    {/if}
  {:else}
    <!-- Usuario no logueado: mostrar botón de login -->
    <Button href="/login">
      <svg class="login-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span class="login-text">{$i18n['nav.login'] || 'Iniciar sesión'}</span>
    </Button>
  {/if}
</div>

<style>
  /* Variables CSS profesionales */
  .user-menu {
    --menu-bg: #ffffff;
    --menu-border: rgba(0, 0, 0, 0.08);
    --menu-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
    --menu-radius: 16px;
    --menu-text: #1f2937;
    --menu-text-secondary: #6b7280;
    --menu-hover: #f8fafc;
    --menu-accent: #2563eb;
    --menu-danger: #dc2626;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Contenedor principal */
  .user-menu {
    position: relative;
    display: inline-block;
  }

  /* Botón de usuario */
  .user-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px 8px 8px;
    background: var(--menu-bg);
    border: 1px solid var(--menu-border);
    border-radius: 50px;
    color: var(--menu-text);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .user-btn:hover {
    background: var(--menu-hover);
    border-color: var(--menu-accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  .user-btn:focus-visible {
    outline: 2px solid var(--menu-accent);
    outline-offset: 2px;
  }

  /* Avatar pequeño */
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--menu-accent), #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-text {
    color: white;
    font-weight: 600;
    font-size: 14px;
  }

  /* Nombre del usuario */
  .user-name {
    font-size: 14px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Chevron con animación */
  .chevron {
    color: var(--menu-text-secondary);
    transition: var(--transition);
    flex-shrink: 0;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  /* Menú desplegable */
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 280px;
    background: var(--menu-bg);
    border: 1px solid var(--menu-border);
    border-radius: var(--menu-radius);
    box-shadow: var(--menu-shadow);
    z-index: 1000;
    overflow: hidden;
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: saturate(180%) blur(12px);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Header del menú */
  .menu-header {
    padding: 16px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar-large {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--menu-accent), #3b82f6);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-text-large {
    color: white;
    font-weight: 700;
    font-size: 20px;
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name-large {
    font-weight: 600;
    font-size: 16px;
    color: var(--menu-text);
    margin-bottom: 2px;
  }

  .user-email {
    font-size: 13px;
    color: var(--menu-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Divisor */
  .menu-divider {
    height: 1px;
    background: var(--menu-border);
    margin: 0;
  }

  /* Items del menú */
  .menu-items {
    padding: 8px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: 12px;
    color: var(--menu-text);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
  }

  .menu-item:hover {
    background: var(--menu-hover);
    color: var(--menu-accent);
    transform: translateX(2px);
  }

  .menu-item:focus-visible {
    outline: 2px solid var(--menu-accent);
    outline-offset: -2px;
  }

  /* Icono del menú */
  .menu-icon {
    flex-shrink: 0;
    color: var(--menu-text-secondary);
    transition: var(--transition);
  }

  .menu-item:hover .menu-icon {
    color: var(--menu-accent);
  }

  /* Item de logout especial */
  .logout-item {
    color: var(--menu-danger);
  }

  .logout-item:hover {
    background: rgba(220, 38, 38, 0.08);
    color: var(--menu-danger);
  }

  .logout-item .menu-icon {
    color: var(--menu-danger);
  }

  .logout-form {
    margin: 0;
  }

  /* Estilos para el ícono de login dentro del Button */
  .login-icon {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .dropdown-menu {
      min-width: 260px;
      right: -8px;
    }
    
    /* Ocultar texto del usuario y chevron en responsive */
    .user-name {
      display: none;
    }
    
    .chevron {
      display: none;
    }
    
    /* Ajustar el botón para mostrar solo el avatar */
    .user-btn {
      padding: 6px;
      min-width: auto;
      gap: 0;
    }
    
    .avatar {
      margin: 0;
    }
    
    /* Botón de login solo ícono en responsive - sin bordes */
    :global(.user-menu .btn) {
      padding: 6px;
      min-width: auto;
      min-height: 32px;
      border: none !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    
    .login-text {
      display: none;
    }
    
    .login-icon {
      width: 18px;
      height: 18px;
      margin: 0;
      color: #2563eb;
      stroke-width: 2.5;
    }
  }

  /* Animaciones para accesibilidad */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .dropdown-menu {
      animation: none;
    }
  }

  /* Modo oscuro */
  @media (prefers-color-scheme: dark) {
    .user-menu {
      --menu-bg: #1f2937;
      --menu-border: rgba(255, 255, 255, 0.1);
      --menu-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      --menu-text: #f9fafb;
      --menu-text-secondary: #9ca3af;
      --menu-hover: rgba(255, 255, 255, 0.05);
    }
    
    .menu-header {
      background: linear-gradient(135deg, #374151, #4b5563);
    }
  }
</style>
