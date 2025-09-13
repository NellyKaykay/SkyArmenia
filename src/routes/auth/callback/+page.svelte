<script lang="ts">
  import { onMount } from 'svelte';
  import { supabaseBrowser } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  onMount(async () => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

    if (error) {
      console.error('Auth callback error:', error.message);
      goto('/login?error=callback');
      return;
    }
    // Redirige a donde prefieras tras iniciar sesión
    goto('/');
  });
</script>

<p>Procesando acceso…</p>
