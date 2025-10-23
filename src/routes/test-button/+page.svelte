<script>
  import Button from '$lib/components/Button.svelte';
  let loading = false;
  
  function handleClick() {
    loading = true;
    setTimeout(() => {
      loading = false;
      alert('Botón funcionando!');
    }, 2000);
  }
</script>

<div style="padding: 2rem;">
  <h1>Test del Button</h1>
  
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 300px;">
    <!-- Botón básico -->
    <Button variant="primary" on:click={handleClick}>
      Botón básico
    </Button>
    
    <!-- Botón con loading -->
    <Button variant="primary" {loading} on:click={handleClick}>
      Botón con loading
    </Button>
    
    <!-- Botón submit -->
    <form on:submit|preventDefault={handleClick}>
      <Button type="submit" variant="primary" full>
        Botón Submit
      </Button>
    </form>
    
    <!-- Botón con traducción -->
    <Button variant="primary" translationKey="auth.login.submit" label="Fallback text" />
  </div>
</div>