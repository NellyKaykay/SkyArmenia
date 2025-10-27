<svelte:head>
  <title>Vuelos Barcelona-Yerevan - Buscar y Comparar | SkyArmenia</title>
  <meta name="description" content="Busca y compara vuelos baratos de Barcelona a Yerevan. Encuentra las mejores ofertas de aerolíneas con SkyArmenia, tu agencia de viajes especialista en Armenia.">
  <meta name="keywords" content="vuelos Barcelona Yerevan, vuelos baratos Armenia, BCN EVN, aerolíneas Armenia, vuelos directos">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Vuelos Barcelona-Yerevan - Buscar y Comparar | SkyArmenia">
  <meta property="og:description" content="Busca y compara vuelos baratos de Barcelona a Yerevan. Encuentra las mejores ofertas de aerolíneas con SkyArmenia.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://skyarmenia.com/flights">
  <meta property="og:image" content="https://skyarmenia.com/logo-skyarmenia.png">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Vuelos Barcelona-Yerevan - Buscar y Comparar | SkyArmenia">
  <meta name="twitter:description" content="Busca y compara vuelos baratos de Barcelona a Yerevan con SkyArmenia.">
  <meta name="twitter:image" content="https://skyarmenia.com/logo-skyarmenia.png">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://skyarmenia.com/flights">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "name": "Vuelos Barcelona-Yerevan",
      "description": "Página de búsqueda de vuelos entre Barcelona y Yerevan",
      "mainEntity": {
        "@type": "WebSearchBox",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://skyarmenia.com/flights?origin={origin}&destination={destination}"
        },
        "query-input": "required name=origin,destination"
      }
    }
  </script>
</svelte:head>

<script lang="ts">
  let origin = 'BCN';
  let destination = 'EVN';
  let depart = '';
  let ret = '';
  let adults = 1;

  let loading = false;
  let error = '';
  let results: any[] = [];

  function fmtTime(iso: string){
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }
  function fmtPrice(cents: number, currency='EUR'){
    return new Intl.NumberFormat('es-ES',{style:'currency', currency}).format((cents||0)/100);
  }

  async function search(){
    error=''; loading=true; results=[];
    try{
      // 🔹 MOCK: resultados temporales (luego los cambiaremos por la API)
      const departDate = depart || new Date().toISOString().slice(0,10);
      const mock = [
        {
          provider: 'FLYONE',
          flightNumber: '5F 512',
          origin, destination,
          departTime: `${departDate}T10:20:00`,
          arriveTime: `${departDate}T15:50:00`,
          price: { amount: 18900, currency: 'EUR' },
          deeplink: `https://flyone.eu/?ref=skyarmenia`
        },
        {
          provider: 'Blackstone',
          flightNumber: 'BS 204',
          origin, destination,
          departTime: `${departDate}T17:10:00`,
          arriveTime: `${departDate}T22:40:00`,
          price: { amount: 20500, currency: 'EUR' },
          deeplink: `https://www.blackstone.am/?ref=skyarmenia`
        }
      ].sort((a,b)=>a.price.amount - b.price.amount);
      // simulamos pequeña espera
      await new Promise(r=>setTimeout(r,400));
      results = mock;
    }catch(e:any){
      error = e?.message ?? 'Unknown error';
    }finally{
      loading=false;
    }
  }
</script>

<h1 style="font-weight:900; letter-spacing:.5px;">Busca vuelos</h1>

<form class="search-bar" on:submit|preventDefault={search}>
  <input placeholder="Origen" bind:value={origin} />
  <input placeholder="Destino" bind:value={destination} />
  <input type="date" bind:value={depart} />
  <input type="date" bind:value={ret} />
  <select bind:value={adults}>
    <option value="1">1 adulto</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
  </select>
  <button type="submit">Buscar</button>
</form>

{#if loading}
  <p style="margin-top:12px;">Buscando vuelos…</p>
{:else if error}
  <p style="margin-top:12px; color:#fca5a5;">{error}</p>
{:else if results.length}
  <div class="results">
    {#each results as r}
      <div class="card">
        <div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge">{r.provider}</span>
            <strong>{r.origin} → {r.destination}</strong>
          </div>
          <div style="opacity:.8; font-size:14px; margin-top:4px;">
            {fmtTime(r.departTime)} — {fmtTime(r.arriveTime)} • {r.flightNumber}
          </div>
        </div>
        <div style="text-align:right;">
          <div class="price">{fmtPrice(r.price?.amount, r.price?.currency)}</div>
          <a class="link" href={r.deeplink} target="_blank" rel="nofollow">Continuar</a>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p style="margin-top:12px; opacity:.7;">Introduce la búsqueda y pulsa “Buscar”.</p>
{/if}
