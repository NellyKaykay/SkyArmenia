<!-- Registro profesional - SkyArmenia -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  import BgCarousel from '$lib/components/BgCarousel.svelte';
  import Button from '$lib/components/Button.svelte';
  import EyeIcon from '$lib/components/EyeIcon.svelte';
  import { i18n } from '$lib/i18n';

  // Props del servidor
  export let form: ActionData | undefined;

  // Interfaces y tipos
  interface FormState {
    name: string;
    email: string;
    password: string;
    isLoading: boolean;
    isSubmitting: boolean;
    showPassword: boolean;
    acceptTerms: boolean;
    errors: {
      name?: string;
      email?: string;
      password?: string;
      terms?: string;
      general?: string;
    };
    touched: {
      name: boolean;
      email: boolean;
      password: boolean;
      terms: boolean;
    };
  }

  // Estado del formulario
  let formState: FormState = {
    name: (form as any)?.values?.name ?? '',
    email: (form as any)?.values?.email ?? '',
    password: '',
    isLoading: false,
    isSubmitting: false,
    showPassword: false,
    acceptTerms: false,
    errors: {
      general: form?.error ?? ''
    },
    touched: {
      name: false,
      email: false,
      password: false,
      terms: false
    }
  };

  // Configuración
  const CONFIG = {
    heroImages: Array.from({ length: 12 }, (_, i) => `/barcelona${i + 1}.jpg`),
    validation: {
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      minPasswordLength: 6,
      minNameLength: 2
    },
    ui: {
      animationDuration: 300,
      debounceMs: 500
    }
  } as const;

  // Referencias DOM
  let nameInput: HTMLInputElement;
  let emailInput: HTMLInputElement;
  let passwordInput: HTMLInputElement;
  let termsInput: HTMLInputElement;
  let formElement: HTMLFormElement;

  // Funciones de validación
  function validateName(name: string): string | undefined {
    if (!name.trim()) return 'El nombre es requerido';
    if (name.trim().length < CONFIG.validation.minNameLength) return 'Mínimo 2 caracteres';
    return undefined;
  }

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

  function validateTerms(accepted: boolean): string | undefined {
    if (!accepted) return 'Debes aceptar los términos y condiciones';
    return undefined;
  }

  function validateForm(): boolean {
    const nameError = validateName(formState.name);
    const emailError = validateEmail(formState.email);
    const passwordError = validatePassword(formState.password);
    const termsError = validateTerms(formState.acceptTerms);
    
    formState.errors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      terms: termsError,
      general: formState.errors.general
    };

    return !nameError && !emailError && !passwordError && !termsError;
  }

  // Manejadores de eventos
  function handleNameChange() {
    formState.touched.name = true;
    if (formState.touched.name) {
      formState.errors.name = validateName(formState.name);
    }
  }

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

  function handleTermsChange() {
    formState.touched.terms = true;
    if (formState.touched.terms) {
      formState.errors.terms = validateTerms(formState.acceptTerms);
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
      setTimeout(() => nameInput?.focus(), 100);
    }
  });

  // Computed values
  $: isFormValid = !formState.errors.name && 
                   !formState.errors.email && 
                   !formState.errors.password && 
                   !formState.errors.terms &&
                   formState.name && 
                   formState.email && 
                   formState.password && 
                   formState.acceptTerms;
  $: hasErrors = Object.values(formState.errors).some(error => error);
  $: t = (key: string, fallback?: string): string => {
    const value = $i18n[key];
    return value === key ? (fallback ?? key) : value;
  };
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- Fondo carousel -->
<div class="carousel-bg">
  <BgCarousel images={CONFIG.heroImages} intervalMs={5000} />
</div>

<div class="login-wrap">
  <div class="modal">
    <div class="brand">
      <img src="/logo-skyarmenia.svg" alt="SkyArmenia" class="logo" loading="eager" decoding="async" />
    </div>

    <section 
      class="login-pane" 
      in:fly="{{ y: 30, duration: CONFIG.ui.animationDuration, easing: quintOut }}"
      out:fade="{{ duration: CONFIG.ui.animationDuration / 2 }}"
    >
      <!-- Header del formulario -->
      <div class="form-header">
        <h1 class="form-title">
          {t('auth.signup.title', 'Crear Cuenta')}
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
        action="?/signup"
        class="login-form"
        novalidate
        use:enhance={({ formElement, formData, action, cancel, submitter }) => {
          // Validaciones del lado del cliente
          if (!formState.name || formState.errors.name) {
            formState.errors.name = formState.errors.name || 'Nombre es requerido';
            cancel();
            return;
          }
          
          if (!formState.email || formState.errors.email) {
            formState.errors.email = formState.errors.email || 'Email es requerido';
            cancel();
            return;
          }
          
          if (!formState.password || formState.errors.password) {
            formState.errors.password = formState.errors.password || 'Password es requerido';
            cancel();
            return;
          }
          
          if (!formState.acceptTerms) {
            formState.errors.terms = 'Debes aceptar los términos y condiciones';
            cancel();
            return;
          }
          
          formState.isSubmitting = true;

          return async ({ result, update }) => {
            formState.isSubmitting = false;
            
            if (result.type === 'failure') {
              const maybeError = (result as any).data?.error;
              formState.errors.general = typeof maybeError === 'string' ? maybeError : 'Error al crear la cuenta';
            }
            
            await update();
          };
        }}
      >
        <!-- Campo Nombre -->
        <div class="field-group">
          <label for="name" class="field-label">
            <span class="label-text">{t('auth.signup.name', 'Nombre completo')}</span>
            {#if formState.errors.name}
              <span class="label-error" role="alert" aria-live="polite">
                {formState.errors.name}
              </span>
            {/if}
          </label>
          <div class="input-wrapper" class:has-error={formState.errors.name}>
            <input
              id="name"
              bind:this={nameInput}
              name="name"
              type="text"
              placeholder={t('auth.signup.name', 'Nombre completo')}
              bind:value={formState.name}
              on:input={handleNameChange}
              on:blur={handleNameChange}
              on:focus={() => clearError('name')}
              required
              autocomplete="name"
              aria-describedby={formState.errors.name ? 'name-error' : undefined}
              aria-invalid={!!formState.errors.name}
              disabled={formState.isSubmitting}
              class="form-input"
            />
            <div class="input-icon name-icon" aria-hidden="true">
              👤
            </div>
          </div>
        </div>

        <!-- Campo Email -->
        <div class="field-group">
          <label for="email" class="field-label">
            <span class="label-text">{t('auth.signup.email', 'Email')}</span>
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
              placeholder={t('auth.signup.email', 'Email')}
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
            <span class="label-text">{t('auth.signup.password', 'Contraseña')}</span>
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
              placeholder={t('auth.signup.password', 'Contraseña')}
              bind:value={formState.password}
              on:input={handlePasswordChange}
              on:blur={handlePasswordChange}
              on:focus={() => clearError('password')}
              minlength="6"
              required
              autocomplete="new-password"
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

        <!-- Términos y condiciones -->
        <div class="field-group">
          <div class="terms-wrapper" class:has-error={formState.errors.terms}>
            <div class="terms-content">
              <input
                id="accept"
                bind:this={termsInput}
                name="accept"
                type="checkbox"
                bind:checked={formState.acceptTerms}
                on:change={handleTermsChange}
                on:focus={() => clearError('terms')}
                required
                disabled={formState.isSubmitting}
                class="terms-checkbox"
                aria-describedby={formState.errors.terms ? 'terms-error' : undefined}
                aria-invalid={!!formState.errors.terms}
              />
              <label for="accept" class="terms-label">
                {t('legal.accept', 'Acepto los')}
                <a href="/terms" target="_blank" rel="noopener noreferrer" class="terms-link">
                  {t('legal.terms', 'Términos y Condiciones')}
                </a>
                {t('footer.and', 'y')} la
                <a href="/privacy" target="_blank" rel="noopener noreferrer" class="terms-link">
                  {t('legal.privacy', 'Política de Privacidad')}
                </a>
              </label>
            </div>
            {#if formState.errors.terms}
              <span class="terms-error" role="alert" aria-live="polite">
                {formState.errors.terms}
              </span>
            {/if}
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="submit-section">
          <button 
            type="submit" 
            class="signup-btn"
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
              max-width: 400px; 
              margin: 0 auto; 
              cursor: pointer; 
              font-family: inherit;
              box-shadow: 0 2px 6px rgba(0,0,0,.08);
              transition: all 0.2s ease;
            "
          >
            {#if formState.isSubmitting}
              Creando cuenta...
            {:else}
              {t('auth.signup.submit', 'Crear Cuenta')}
            {/if}
          </button>
        </div>
      </form>

      <!-- Footer del formulario -->
      <div class="form-footer">
        <p class="login-prompt">
          {t('auth.signup.haveAccount', '¿Ya tienes una cuenta?')}
          <a href="/login" class="login-link">
            {t('auth.signup.loginLink', 'Inicia sesión')}
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
    max-width: 320px;            /* Tamaño más corto */
    margin-inline: auto;
    place-self: center;

    background: rgba(255,255,255,.60);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,.7);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: clamp(14px, 3vw, 20px);

    /* Variables que hereda <Form>, IDÉNTICAS a login */
    --form-max: 100%;
    --form-gap: clamp(10px, 2.2vw, 16px);
    --form-field-h: clamp(42px, 5.2vw, 46px);
    --form-radius: 12px;
    --form-fz-base: clamp(13px, 1.7vw, 15px);
    --form-fz-title: clamp(20px, 3.4vw, 24px);
  }

  .brand { display: grid; place-items: center; text-align: center; }
  .logo  { height: clamp(86px, 16vw, 140px); width: auto; margin-bottom: 0; }



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
    margin-bottom: var(--spacing-md);
  }

  .form-title {
    font-size: clamp(1.25rem, 3.5vw, 1.75rem);
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-sm);
    line-height: 1.2;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  /* Campos de Formulario */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
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

  /* Términos y condiciones - estilos específicos para signup */
  .terms-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .terms-content {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .terms-checkbox {
    width: 1.125rem;
    height: 1.125rem;
    margin-top: 0.125rem;
    cursor: pointer;
    accent-color: var(--primary);
    flex-shrink: 0;
  }

  .terms-label {
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--text-primary);
    cursor: pointer;
  }

  .terms-link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .terms-link:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }

  .terms-error {
    color: var(--error);
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: 1.875rem;
  }

  .terms-wrapper.has-error .terms-checkbox {
    accent-color: var(--error);
  }

  /* Alertas y Estados */
  .alert {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: var(--spacing-md);
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

  .submit-section {
    margin-top: var(--spacing-md);
  }

  .form-footer {
    text-align: center;
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-light);
  }

  .login-prompt {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .login-link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: var(--spacing-xs);
    transition: all 0.2s ease;
  }

  .login-link:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }

  /* Responsive Design Profesional */

  /* Large Desktop */
  @media (min-width: 1200px) {
    .modal {
      max-width: 350px;
      padding: var(--spacing-xl);
    }
  }

  /* Desktop */
  @media (max-width: 1024px) {
    .modal {
      max-width: 320px;
    }
  }

  /* Tablets */
  @media (max-width: 768px) {
    .login-wrap {
      padding: var(--spacing-md) var(--spacing-sm);
    }
    
    .modal {
      max-width: 100%;
      margin: var(--spacing-sm);
    }

    .form-input {
      height: 2.75rem;
      font-size: 0.95rem;
    }
  }

  /* Mobile Large */
  @media (max-width: 640px) {
    .modal {
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
    }

    .form-title {
      font-size: 1.5rem;
    }
  }

  /* Mobile Standard */
  @media (max-width: 480px) {
    .login-wrap {
      padding: var(--spacing-sm);
    }

    .modal {
      padding: var(--spacing-sm);
      margin: 0;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 28px rgba(0,0,0,.14);
    }

    .form-input {
      height: 2.5rem;
      padding: 0 0.875rem;
      padding-right: 2.75rem;
      font-size: 0.9rem;
    }

    .login-form {
      gap: var(--spacing-md);
    }

    .field-group {
      gap: calc(var(--spacing-sm) * 0.75);
    }

    .terms-content {
      gap: 0.5rem;
    }

    .terms-checkbox {
      width: 1rem;
      height: 1rem;
    }

    .terms-error {
      margin-left: 1.5rem;
    }
  }

  /* Mobile Small */
  @media (max-width: 360px) {
    .modal {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .form-input {
      height: 2.25rem;
      font-size: 0.875rem;
    }

    .terms-label {
      font-size: 0.85rem;
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

    .terms-checkbox {
      border-width: 2px;
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
