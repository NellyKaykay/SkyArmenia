<script lang="ts">
  import { fade } from 'svelte/transition';
  import Button from '$lib/components/Button.svelte';
  import Form from '$lib/components/Form.svelte';

  let email = '';
  let sent = false;
  let error: string | null = null;

  async function handleSubmit(event: Event) {
    event.preventDefault();
    // Aquí deberías llamar a tu API para enviar el email de recuperación
    // Simulación:
    if (!email.includes('@')) {
      error = 'Introduce un email válido.';
      sent = false;
      return;
    }
    error = null;
    sent = true;
  }
</script>

<svelte:head>
  <title>Recuperar contraseña — SkyArmenia</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="login-wrap">
  <div class="modal">
    <section class="pane" in:fade={{ duration: 180 }} out:fade={{ duration: 120 }}>
      <h2>Recuperar contraseña</h2>
      {#if sent}
        <p class="legal ok centertext">Si el email existe, recibirás instrucciones para restablecer tu contraseña.</p>
      {:else}
        <Form method="POST" on:submit={handleSubmit} error={error}>
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
          <div slot="actions" class="actions-row">
            <Button type="submit">Enviar</Button>
          </div>
        </Form>
      {/if}
      <p class="legal small centertext" style="margin-top:10px">
        <a class="link-register" href="/login">Volver a iniciar sesión</a>
      </p>
    </section>
  </div>
</div>

<style>
  .login-wrap {
    display: grid;
    place-items: center;
    min-height: 100dvh;
    padding: 24px;
    background: transparent;
    overflow: hidden;
  }
  .modal {
    width: 100%; max-width: 420px;
    background: rgba(255,255,255,.60);
    border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    padding: 26px;
  }
  .pane { text-align: center; padding: 6px 0 4px; }
  .legal.ok { color: #065f46; }
  .centertext { text-align: center; }
  .actions-row {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    margin-top: 6px;
  }
  .link-register {
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
  .link-register:hover { text-decoration: none; }
</style>
