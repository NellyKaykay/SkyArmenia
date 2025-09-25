<script lang="ts">
  export let size: number = 24;
  export let color: string = 'currentColor';
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" stroke={color} stroke-width="2" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="3"/>
  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
</svg>
