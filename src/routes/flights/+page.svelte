<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // /flights is deprecated — redirect to home page search
  onMount(() => {
    goto('/', { replaceState: true });
  });
</script>

<p>Redirecting...</p>
