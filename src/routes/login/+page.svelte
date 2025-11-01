<svelte:head>
  <title>Iniciar Sesión - SkyArmenia | Vuelos Barcelona-Yerevan</title>
  <meta name="description" content="Inicia sesión en SkyArmenia para acceder a tu cuenta y gestionar tus reservas de vuelos Barcelona-Yerevan. Acceso seguro a tu área personal.">
  <meta name="robots" content="noindex, nofollow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Iniciar Sesión - SkyArmenia">
  <meta property="og:description" content="Accede a tu cuenta SkyArmenia para gestionar tus vuelos Barcelona-Yerevan.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://skyarmenia.com/login">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://skyarmenia.com/login">
</svelte:head>

<!-- Login profesional - SkyArmenia -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';
  import { i18n } from '$lib/i18n';

  // Props del servidor
  export let form: ActionData | undefined;

  // Interfaces y tipos
  interface FormState {
    email: string;
    password: string;
    isLoading: boolean;
    isSubmitting: boolean;
    showPassword: boolean;
    errors: {
      email?: string;
      password?: string;
      general?: string;
    };
    touched: {
      email: boolean;
      password: boolean;
    };
  }

  // Estado del formulario
  let formState: FormState = {
    email: (form as any)?.values?.email ?? '',
    password: '',
    isLoading: false,
    isSubmitting: false,
    showPassword: false,
    errors: {
      general: form?.error ?? ''
    },
    touched: {
      email: false,
      password: false
    }
  };

  // Configuración
  const CONFIG = {
    heroImages: Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`),
    validation: {
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      minPasswordLength: 6
    },
    ui: {
      animationDuration: 300,
      debounceMs: 500
    }
  } as const;

  // Referencias DOM
  let emailInput: HTMLInputElement;
  let passwordInput: HTMLInputElement;
  let formElement: HTMLFormElement;

  // Funciones de utilidad
  function validateEmail(email: string): string | undefined {
    if (!email.trim()) return 'El email es requerido';
    if (!CONFIG.validation.emailPattern.test(email)) return 'Formato de email inválido';
    return undefined;
  }

  function validatePassword(password: string): string | undefined {
    if (!password.trim()) return 'La contraseña es requerida';
    if (password.length < CONFIG.validation.minPasswordLength) return `Mínimo ${CONFIG.validation.minPasswordLength} caracteres`;
    return undefined;
  }

  function validateForm(): boolean {
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    
    formState.errors = {
      email: emailError,
      password: passwordError,
      general: formState.errors.general
    };

    return !emailError && !passwordError;
  }

  // Manejadores de eventos
  function handleEmailChange() {
    formState.touched.email = true;
    if (formState.touched.email) {
      formState.errors.email = validateEmail(formState.email);
    }
  }

  function handlePasswordChange() {
    formState.touched.password = true;
    if (formState.touched.password) {
      formState.errors.password = validatePassword(formState.password);
    }
  }

  function togglePasswordVisibility() {
    formState.showPassword = !formState.showPassword;
    // Mantener focus en el input
    if (passwordInput) {
      passwordInput.focus();
    }
  }

  function clearError(field?: keyof FormState['errors']) {
    if (field) {
      formState.errors[field] = undefined;
    } else {
      formState.errors.general = undefined;
    }
  }

  // Auto-focus en el primer campo con error
  onMount(() => {
    if (browser && formState.errors.general) {
      setTimeout(() => emailInput?.focus(), 100);
    }
  });

  // Computed values
  $: isFormValid = !formState.errors.email && !formState.errors.password && formState.email && formState.password;
  $: hasErrors = Object.values(formState.errors).some(error => error);
  $: t = (key: string, fallback?: string): string => {
    const value = $i18n[key];
    return value === key ? (fallback ?? key) : value;
  };
</script>

<!-- Fondo carousel -->
<div class="carousel-bg">
  <BgCarousel images={CONFIG.heroImages} intervalMs={5000} />
</div>

<div class="login-wrap">
  <div class="modal">
    <section 
      class="login-pane" 
      in:fly="{{ y: 30, duration: CONFIG.ui.animationDuration, easing: quintOut }}"
      out:fade="{{ duration: CONFIG.ui.animationDuration / 2 }}"
    >
      <!-- Header del formulario -->
      <div class="form-header">
        <h1 class="form-title">
          {t('auth.login.title', 'Iniciar Sesión')}
        </h1>
      </div>

      <!-- Error global -->
      {#if formState.errors.general}
        <div 
          class="alert alert-error"
          role="alert"
          aria-live="assertive"
          in:scale="{{ duration: 200, easing: quintOut }}"
        >
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">{formState.errors.general}</span>
          <button 
            type="button" 
            class="alert-close"
            on:click={() => clearError('general')}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      {/if}

      <!-- Formulario con progressive enhancement -->
      <form
        bind:this={formElement}
        method="POST"
        action="?/login"
        class="login-form"
        novalidate
        use:enhance={({ formElement, formData, action, cancel, submitter }) => {
          formState.isSubmitting = true;
          
          // Validación cliente
          if (!validateForm()) {
            cancel();
            formState.isSubmitting = false;
            return;
          }

          return async ({ result, update }) => {
            formState.isSubmitting = false;
            
            if (result.type === 'failure') {
              const maybeError = (result as any).data?.error;
              formState.errors.general = typeof maybeError === 'string' ? maybeError : 'Error al iniciar sesión';
            }
            
            await update();
          };
        }}
      >
        <!-- Campo Email -->
        <div class="field-group">
          <label for="email" class="field-label">
            <span class="label-text">{t('auth.login.email', 'Email')}</span>
            {#if formState.errors.email}
              <span class="label-error" role="alert" aria-live="polite">
                {formState.errors.email}
              </span>
            {/if}
          </label>
          <div class="input-wrapper" class:has-error={formState.errors.email}>
            <input
              id="email"
              bind:this={emailInput}
              name="email"
              type="email"
              placeholder={t('auth.login.email', 'Email')}
              bind:value={formState.email}
              on:input={handleEmailChange}
              on:blur={handleEmailChange}
              on:focus={() => clearError('email')}
              required
              autocomplete="email"
              inputmode="email"
              aria-describedby={formState.errors.email ? 'email-error' : undefined}
              aria-invalid={!!formState.errors.email}
              disabled={formState.isSubmitting}
              class="form-input"
            />
            <div class="input-icon email-icon" aria-hidden="true">
              📧
            </div>
          </div>
        </div>

        <!-- Campo Password -->
        <div class="field-group">
          <label for="password" class="field-label">
            <span class="label-text">{t('auth.login.password', 'Contraseña')}</span>
            {#if formState.errors.password}
              <span class="label-error" role="alert" aria-live="polite">
                {formState.errors.password}
              </span>
            {/if}
          </label>
          <div class="input-wrapper" class:has-error={formState.errors.password}>
            <input
              id="password"
              bind:this={passwordInput}
              name="password"
              type={formState.showPassword ? 'text' : 'password'}
              placeholder={t('auth.login.password', 'Contraseña')}
              bind:value={formState.password}
              on:input={handlePasswordChange}
              on:blur={handlePasswordChange}
              on:focus={() => clearError('password')}
              minlength="6"
              required
              autocomplete="current-password"
              aria-describedby={formState.errors.password ? 'password-error' : undefined}
              aria-invalid={!!formState.errors.password}
              disabled={formState.isSubmitting}
              class="form-input password-input"
            />
            <button
              type="button"
              class="toggle-password"
              on:click={togglePasswordVisibility}
              aria-label={formState.showPassword ? t('auth.hide_password', 'Ocultar contraseña') : t('auth.show_password', 'Mostrar contraseña')}
              tabindex="0"
              disabled={formState.isSubmitting}
            >
              <EyeIcon 
                size={20} 
                color={formState.showPassword ? 'var(--accent)' : '#6b7280'} 
              />
            </button>
          </div>
        </div>

        <!-- Opciones de formulario -->
        <div class="form-options">
          <a href="/forgot" class="forgot-link">
            {t('auth.login.forgot', '¿Olvidaste tu contraseña?')}
          </a>
        </div>

        <!-- Botón de envío -->
        <div class="submit-section">
          <button 
            type="submit" 
            class="login-btn"
            disabled={!isFormValid || formState.isSubmitting}
            style="
              border: 1px solid #2563eb; 
              border-radius: 8px; 
              font-weight: 600; 
              color: #000; 
              background: #fff; 
              padding: 10px 20px; 
              min-height: 46px; 
              font-size: 1rem; 
              display: block; 
              width: 100%; 
              max-width: 450px; 
              margin: 0 auto; 
              cursor: pointer; 
              font-family: inherit;
              box-shadow: 0 2px 6px rgba(0,0,0,.08);
              transition: all 0.2s ease;
            "
          >
            {#if formState.isSubmitting}
              Iniciando sesión...
            {:else}
              {t('auth.login.submit', 'Iniciar Sesión')}
            {/if}
          </button>
        </div>
      </form>

      <!-- Footer del formulario -->
      <div class="form-footer">
        <p class="signup-prompt">
          {t('auth.login.noAccount', '¿No tienes una cuenta?')}
          <a href="/signup" class="signup-link">
            {t('auth.login.signupLink', 'Regístrate')}
          </a>
        </p>
      </div>
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
    max-width: 450px;            /* Ampliado a 450px para mayor consistencia */
    min-width: 320px;            /* Ancho mínimo para consistencia */
    margin-inline: auto;
    place-self: center;

    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: clamp(16px, 3vw, 24px);

    /* Variables que hereda <Form>, IDÉNTICAS a signup */
    --form-max: 100%;
    --form-gap: clamp(10px, 2.2vw, 16px);
    --form-field-h: clamp(42px, 5.2vw, 46px);
    --form-radius: 12px;
    --form-fz-base: clamp(13px, 1.7vw, 15px);
    --form-fz-title: clamp(20px, 3.4vw, 24px);
  }



  /* ================================

  /* .pane removed: unused selector — styles consolidated elsewhere */


  /* Campo contraseña con icono — styles consolidated to .input-wrapper and .toggle-password */
  /* Removed unused .pwd and .eye selectors; .input-wrapper (position: relative) and
     .toggle-password (absolute positioned) provide the necessary layout and spacing. */

  /* Enlace “olvidado…” alineado a la derecha y pegado al campo */
  .forgot-link { font-size: .92rem; text-decoration: underline; color: var(--text); }
  .forgot-link:hover { text-decoration: none; }

  /* removed unused .legal and .centertext selectors to avoid unused CSS warnings */

  /* .link-register removed because it's unused; use .signup-link instead */

  :global(.modal .pane-title) {
    margin-top: clamp(2px, 0.5vw, 2px);
    margin-bottom: clamp(8px, 1.2vw, 12px); /* igual que signup */
  }

  /* ================================
     ESTILOS PROFESIONALES NUEVOS
     ================================ */

  /* Variables de Diseño Mejoradas */
  .login-wrap {
    --primary: #38b6ff;
    --primary-dark: #2563eb;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --text-muted: #9ca3af;
    --border-light: #e5e7eb;
    --border-focus: var(--primary);
    --error: #ef4444;
    --error-bg: #fef2f2;
    --error-border: #fecaca;
    --background: rgba(255, 255, 255, 0.95);
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
  }

  /* Formulario Profesional */
  .login-pane {
    width: 100%;
  }

  .form-header {
    text-align: center;
    margin-bottom: 0.75rem;    /* Reducido de var(--spacing-md) */
  }

  .form-title {
    font-size: clamp(1.25rem, 3.5vw, 1.75rem);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.25rem;       /* Reducido de var(--spacing-sm) */
    line-height: 1.2;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;              /* Reducido de var(--spacing-md) a 0.75rem */
  }

  /* Campos de Formulario */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;             /* Reducido de var(--spacing-sm) a 0.375rem */
  }

  .field-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .label-text {
    font-weight: 600;
  }

  .label-error {
    color: var(--error);
    font-size: 0.8rem;
    font-weight: 500;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .form-input {
    width: 100%;
    height: 3rem;
    padding: 0 1rem;
    padding-right: 3rem;
    font-size: 1rem;
    color: var(--text-primary);
    background: #fff;
    border: 2px solid var(--border-light);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    outline: none;
  }

  .form-input:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(56, 182, 255, 0.1);
  }

  .form-input:disabled {
    background: #f9fafb;
    color: var(--text-muted);
    cursor: not-allowed;
  }

  .input-wrapper.has-error .form-input {
    border-color: var(--error);
    background: var(--error-bg);
  }

  .input-icon {
    position: absolute;
    right: 0.75rem;
    font-size: 1.1rem;
    color: var(--text-muted);
    pointer-events: none;
  }

  .toggle-password {
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-password:hover {
    background: rgba(56, 182, 255, 0.1);
    color: var(--primary);
  }

  .toggle-password:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Alertas y Estados */
  .alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .alert-error {
    background: var(--error-bg);
    border: 1px solid var(--error-border);
    color: #991b1b;
  }

  .alert-icon {
    font-size: 1.1em;
  }

  .alert-text {
    flex: 1;
  }

  .alert-close {
    background: none;
    border: none;
    color: currentColor;
    font-weight: bold;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    transition: background-color 0.2s ease;
  }

  .alert-close:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  /* Opciones y Enlaces */
  .form-options {
    text-align: right;
    margin-top: -0.25rem;      /* Reducido espacio negativo */
  }

  .forgot-link {
    color: var(--primary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .forgot-link:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }

  .submit-section {
    margin-top: 0.75rem;       /* Reducido de var(--spacing-md) */
  }

  .form-footer {
    text-align: center;
    margin-top: 1rem;          /* Reducido de var(--spacing-lg) */
    padding-top: 0.75rem;      /* Reducido de var(--spacing-md) */
    border-top: 1px solid var(--border-light);
  }

  .signup-prompt {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .signup-link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: 0.25rem;
    transition: all 0.2s ease;
  }

  .signup-link:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }

  /* Responsive Design Profesional */

  /* Large Desktop */
  @media (min-width: 1200px) {
    .modal {
      max-width: 480px;        /* Ampliado a 480px */
      min-width: 480px;        /* Forzar ancho fijo */
      padding: 1.5rem;         /* Reducido de var(--spacing-xl) */
    }
  }

  /* Desktop */
  @media (max-width: 1024px) {
    .modal {
      max-width: 450px;        /* Ampliado a 450px */
      min-width: 400px;        /* Forzar ancho consistente */
    }
  }

  /* Tablets */
  @media (max-width: 768px) {
    .login-wrap {
      padding: 1rem 0.5rem;
    }
    
    .modal {
      max-width: 100%;
      min-width: 300px;        /* Ancho mínimo para tablets */
      margin: 0.5rem;
    }

    .form-input {
      height: 2.75rem;
      font-size: 0.95rem;
    }
  }

  /* Mobile Large */
  @media (max-width: 640px) {
    .modal {
      min-width: 280px;        /* Ancho mínimo para móviles grandes */
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
    }

    .form-title {
      font-size: 1.25rem;      /* Reducido de 1.5rem */
    }

    .login-form {
      gap: 0.5rem;             /* Reducido espacios entre campos */
    }

    .field-group {
      gap: 0.25rem;            /* Reducido espacios internos */
    }

    .field-label {
      font-size: 0.8rem;       /* Etiquetas más pequeñas */
    }

    .forgot-link {
      font-size: 0.8rem;       /* Texto olvidado más pequeño */
    }

    .submit-section {
      margin-top: 0.25rem;     /* Muy poco espacio antes del botón */
      margin-bottom: 0.25rem;  /* Poco espacio después del botón */
    }

    .login-btn {
      font-size: 0.9rem !important;   /* Texto botón más pequeño */
      min-height: 2.25rem !important; /* Botón más compacto */
      padding: 0.5rem 1rem !important;
    }

    .form-footer {
      margin-top: 0.5rem !important;  /* Reducido espacio después */
      padding-top: 0.5rem !important;
    }
  }

  /* Mobile Standard */
  @media (max-width: 480px) {
    .login-wrap {
      padding: 0.5rem;
    }

    .modal {
      min-width: 260px;        /* Ancho mínimo para móviles estándar */
      padding: 0.5rem;
      margin: 0;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 28px rgba(0,0,0,.14);
    }

    .form-input {
      height: 2.25rem;         /* Reducido de 2.5rem */
      padding: 0 0.75rem;      /* Reducido padding */
      padding-right: 2.5rem;   /* Ajustado para icono */
      font-size: 0.85rem;      /* Reducido de 0.9rem */
    }

    .login-form {
      gap: 0.5rem;             /* Reducido de 1rem */
    }

    .field-group {
      gap: 0.25rem;            /* Reducido de 0.375rem */
    }

    .field-label {
      font-size: 0.75rem;      /* Etiquetas más pequeñas */
    }

    .form-title {
      font-size: 1.125rem;     /* Título más pequeño */
    }

    .forgot-link {
      font-size: 0.75rem;      /* Texto olvidado más pequeño */
    }

    .submit-section {
      margin-top: 0.2rem;      /* Espacio mínimo antes */
      margin-bottom: 0.2rem;   /* Espacio mínimo después */
    }

    .login-btn {
      font-size: 0.85rem !important;  /* Texto más pequeño */
      min-height: 2rem !important;    /* Botón más compacto */
      padding: 0.375rem 0.75rem !important;
    }

    .form-footer {
      margin-top: 0.375rem !important; /* Reducido espacio después */
      padding-top: 0.375rem !important;
    }
  }

  /* Mobile Small */
  @media (max-width: 360px) {
    .modal {
      min-width: 240px;        /* Ancho mínimo para móviles pequeños */
      padding: 0.375rem 0.75rem; /* Padding más compacto */
    }

    .form-input {
      height: 2rem;            /* Más compacto */
      font-size: 0.8rem;       /* Texto más pequeño */
      padding: 0 0.625rem;
      padding-right: 2.25rem;
    }

    .login-form {
      gap: 0.375rem;           /* Espacios muy reducidos */
    }

    .field-group {
      gap: 0.2rem;             /* Espacios mínimos */
    }

    .field-label {
      font-size: 0.7rem;       /* Etiquetas muy pequeñas */
    }

    .form-title {
      font-size: 1rem;         /* Título muy pequeño */
    }

    .forgot-link {
      font-size: 0.7rem;       /* Texto olvidado muy pequeño */
    }

    .submit-section {
      margin-top: 0.125rem;    /* Espacio ultra mínimo antes */
      margin-bottom: 0.125rem; /* Espacio ultra mínimo después */
    }

    .login-btn {
      font-size: 0.8rem !important;   /* Texto muy pequeño */
      min-height: 1.875rem !important; /* Botón muy compacto */
      padding: 0.25rem 0.5rem !important;
    }

    .form-footer {
      margin-top: 0.25rem !important;  /* Espacio muy reducido después */
      padding-top: 0.25rem !important;
    }
  }

  /* Accessibility & Preferences */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  @media (prefers-contrast: high) {
    .form-input {
      border-width: 3px;
    }
    
    .modal {
      border-width: 2px;
      border-color: var(--text-primary);
    }
  }

  /* Dark mode preparation */
  @media (prefers-color-scheme: dark) {
    .login-wrap {
      --background: rgba(17, 24, 39, 0.95);
      --text-primary: #f9fafb;
      --text-secondary: #d1d5db;
      --text-muted: #9ca3af;
      --border-light: #374151;
    }
  }
</style>
