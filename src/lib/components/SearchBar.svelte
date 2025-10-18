<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { i18n } from '$lib/i18n';

  /* Props (solo como valores iniciales) */
  export let trip: 'oneway' | 'round' = 'round';
  export let origin = 'BCN';
  export let destination = 'EVN';
  export let depart = '';
  export let ret = '';
  export let adults: number = 1; // solo inicial
  export let bags: number = 0;

  /* Estado interno que SÍ modificamos (para que los +/− funcionen siempre) */
  let adultsC = adults ?? 1;
  let childrenC = 0;
  let infantsC = 0;

  export let endpoint = '/api/search';
  export let debug = true;
  export let updateUrl = true;

  export let loading = false;
  export let errorText = '';
  export let data: any = null;

  const dispatch = createEventDispatcher();
  $: t = (k: string, fb?: string) => {
    const v = $i18n[k];
    return v === k ? (fb ?? k) : v;
  };

  function buildQuery() {
    const q = new URLSearchParams({
      origin, destination, depart, trip,
      adults: String(adultsC),
      children: String(childrenC),
      infants: String(infantsC),
      bags: String(bags)
    });
    if (trip === 'round' && ret) q.set('return', ret);
    return q.toString();
  }

  async function doSearch() {
    loading = true; errorText = ''; data = null; dispatch('searchstart');
    try {
      const qs = buildQuery();
      if (updateUrl) history.replaceState(null, '', `/?${qs}`);
      const url = `${endpoint}?${qs}${debug ? '&debug=1' : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.ok) { errorText = json.error || 'Error en la búsqueda'; dispatch('error', errorText); }
      else { data = json; dispatch('results', data); }
    } catch (e: any) {
      errorText = e?.message || 'Fallo de red'; dispatch('error', errorText);
    } finally { loading = false; }
  }
  function onSubmit(e: Event) { e.preventDefault(); doSearch(); }

  /* ===== Calendario: Flatpickr ===== */
  import flatpickr from 'flatpickr';
  import 'flatpickr/dist/flatpickr.css';
  import { Spanish } from 'flatpickr/dist/l10n/es.js';

  let departEl: HTMLInputElement;
  let retEl: HTMLInputElement;
  let fpDepart: flatpickr.Instance | null = null;
  let fpRet: flatpickr.Instance | null = null;

  function ymdLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  function isMonOrFri(d: Date) {
    const wd = d.getDay();
    return wd === 1 || wd === 5;
  }

  function initPickers() {
    fpDepart?.destroy?.(); fpRet?.destroy?.();
    const baseOpts: flatpickr.Options.Options = {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd-m-Y',
      allowInput: false,
      disableMobile: true,
      locale: { ...Spanish, firstDayOfWeek: 1 },
      minDate: 'today',
      position: 'auto center',
      appendTo: document.body,
      onDayCreate(_dObj, _dStr, _fp, dayElem: any) {
        dayElem.classList.add('pos-rel');
        const d = dayElem.dateObj as Date;
        if (isMonOrFri(d)) dayElem.classList.add('monfri');
      }
    };

    fpDepart = flatpickr(departEl, {
      ...baseOpts,
      defaultDate: depart || undefined,
      onChange: (sel: Date[]) => {
        if (sel[0]) {
          depart = ymdLocal(sel[0]);
          if (fpRet) fpRet.set('minDate', depart);
          if (trip === 'round' && ret) {
            const r = new Date(ret);
            if (sel[0] > r) ret = '';
          }
        }
      }
    });

    fpRet = flatpickr(retEl, {
      ...baseOpts,
      defaultDate: ret || undefined,
      minDate: depart || 'today',
      clickOpens: trip !== 'oneway',
      onOpen: () => { if (trip === 'oneway') fpRet?.close(); },
      onChange: (sel: Date[]) => { if (sel[0]) ret = ymdLocal(sel[0]); }
    });
  }
  onMount(initPickers);
  $: if (fpRet) { fpRet.set('clickOpens', trip !== 'oneway'); fpRet.set('minDate', depart || 'today'); }

  /* ===== Pasajeros ===== */
  let paxOpen = false;
  $: totalPax = adultsC + childrenC + infantsC;

  function inc(k: 'adults'|'children'|'infants', e?: MouseEvent) {
    e?.stopPropagation();
    if (k==='adults')  adultsC  = Math.min(9, adultsC + 1);
    if (k==='children') childrenC = Math.min(9, childrenC + 1);
    if (k==='infants') infantsC = Math.min(adultsC, infantsC + 1);
  }
  function dec(k: 'adults'|'children'|'infants', e?: MouseEvent) {
    e?.stopPropagation();
    if (k==='adults')  adultsC  = Math.max(1, adultsC - 1);
    if (k==='children') childrenC = Math.max(0, childrenC - 1);
    if (k==='infants') infantsC = Math.max(0, infantsC - 1);
    if (infantsC > adultsC) infantsC = adultsC;
  }

  // Action para cerrar al clicar fuera
  function outside(node: HTMLElement, cb: () => void) {
    const onDoc = (e: MouseEvent) => { if (!node.contains(e.target as Node)) cb(); };
    document.addEventListener('mousedown', onDoc);
    return { destroy() { document.removeEventListener('mousedown', onDoc); } };
  }

  // accesibilidad: cerrar con Esc
  function onDialogKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { paxOpen = false; e.stopPropagation(); }
  }
</script>

<!-- ===== Rail Ida/Vuelta — más pequeño y en línea ===== -->
<div class="trip-rail" aria-label="Tipo de viaje">
  <button type="button"
    class="rail-btn" aria-pressed={trip==='round'}
    on:click={() => trip='round'}
    on:keydown={(e)=> (e.key==='Enter'||e.key===' ') && (e.preventDefault(), trip='round')}>
    <span class="dot" data-active={trip==='round'}></span>
    <span class="rail-text">{t('opts.round','Ida y vuelta')}</span>
  </button>

  <button type="button"
    class="rail-btn" aria-pressed={trip==='oneway'}
    on:click={() => trip='oneway'}
    on:keydown={(e)=> (e.key==='Enter'||e.key===' ') && (e.preventDefault(), trip='oneway')}>
    <span class="dot" data-active={trip==='oneway'}></span>
    <span class="rail-text">{t('opts.oneway','Solo ida')}</span>
  </button>
</div>

<!-- ===== Barra de búsqueda ===== -->
<form class="search-bar" on:submit={onSubmit}>
  <div>
    <label class="label" for="origin">{t('form.origin','Origen')}</label>
    <select id="origin" bind:value={origin}>
      <option value="EVN"></option>
      <option value="BCN">Barcelona (BCN)</option>
      <option value="EVN">Yerevan (EVN)</option>
    </select>
  </div>

  <div>
    <label class="label" for="destination">{t('form.destination','Destino')}</label>
    <select id="destination" bind:value={destination}>
      <option value="EVN"></option>
      <option value="EVN">Yerevan (EVN)</option>
      <option value="BCN">Barcelona (BCN)</option>
    </select>
  </div>

  <div>
    <label class="label" for="depart">{t('form.depart','Salida')}</label>
    <input id="depart" type="text" bind:this={departEl} bind:value={depart} />
  </div>

  <div>
    <label class="label" for="return">{t('form.return','Regreso')}</label>
    <input id="return" type="text" bind:this={retEl} bind:value={ret} disabled={trip==='oneway'} />
  </div>

  <!-- ===== Pasajeros ===== -->
  <div class="pax-field" use:outside={() => (paxOpen = false)}>
     <label class="label" for="pax">{t('form.passengers','Pasajeros')}</label>
     <button type="button" class="picker pax-trigger" aria-haspopup="dialog" aria-expanded={paxOpen} aria-labelledby="pax-label"
       on:click={() => (paxOpen = !paxOpen)}>
       <span class="pax-trigger-right">{totalPax}</span>
     </button>

    {#if paxOpen}
      <!-- dialog accesible -->
      <div class="pax-pop" role="dialog" aria-modal="true" aria-labelledby="pax-label"
           tabindex="-1" on:keydown={onDialogKeydown}
           on:click|stopPropagation>
        <div class="pax-head">
          <div class="pax-head-title">{t('passengers.title','Pasajeros')}</div>
          <div class="pax-head-count">{totalPax} {t('pax.passengers','PASAJEROS')}</div>
        </div>

        <!-- Adults -->
        <div class="row">
          <div class="left">
            <div class="title">{t('passengers.adults','Adultos')}</div>
            <div class="sub">{t('passengers.adults.hint','desde 12 años')}</div>
          </div>
          <div class="right">
            <button type="button" class="square" on:click={(e)=>dec('adults',e)} aria-label="Quitar adulto">−</button>
            <div class="count" aria-live="polite">{adultsC}</div>
            <button type="button" class="square" on:click={(e)=>inc('adults',e)} aria-label="Añadir adulto">+</button>
          </div>
        </div>

        <!-- Children -->
        <div class="row">
          <div class="left">
            <div class="title">{t('passengers.children','Niños')}</div>
            <div class="sub">{t('passengers.children.hint','de 2 a 11 años')}</div>
          </div>
          <div class="right">
            <button type="button" class="square" on:click={(e)=>dec('children',e)} aria-label="Quitar niño">−</button>
            <div class="count" aria-live="polite">{childrenC}</div>
            <button type="button" class="square" on:click={(e)=>inc('children',e)} aria-label="Añadir niño">+</button>
          </div>
        </div>

        <!-- Infants -->
        <div class="row">
          <div class="left">
            <div class="title">{t('passengers.infants','Bebés')}</div>
            <div class="sub">{t('passengers.infants.hint','menores de 2 años')}</div>
          </div>
          <div class="right">
            <button type="button" class="square" on:click={(e)=>dec('infants',e)} aria-label="Quitar bebé">−</button>
            <div class="count" aria-live="polite">{infantsC}</div>
            <button type="button" class="square" on:click={(e)=>inc('infants',e)} aria-label="Añadir bebé">+</button>
          </div>
        </div>

        <div class="pax-actions">
          <button type="button" class="pax-ok" on:click={() => (paxOpen = false)}>OK</button>
        </div>
      </div>
    {/if}
  </div>

  <button type="submit" class="search-icon-btn" aria-label={t('form.search','Buscar')}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ico" aria-hidden="true">
      <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <button type="submit" class="search-text-btn">{t('form.search','Buscar')}</button>

</form>

<style>
  /* ===== Rail Ida/Vuelta — pequeño & en línea ===== */
.trip-rail { display: inline-flex; gap: 14px; margin: 6px 0 12px; }
.rail-btn {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: transparent; border: 0; cursor: pointer; border-radius: 999px;
}
.rail-btn:focus-visible { outline: 2px solid var(--accent, #2740ff); outline-offset: 2px; }
.dot {
  width: 16px; height: 16px; border-radius: 999px;
  border: 2px solid var(--accent, #2740ff); background: #fff;
}
.dot[data-active="true"] { background: var(--accent, #2740ff); }
.rail-text { color: #fff; font-weight: 700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,.35); }

 /* ===== Form ===== */
.label { font-size: 12px; color: var(--muted); display: block; margin-bottom: 4px; }
.search-bar {
  display: grid; gap: 28px; align-items: end; background: #ffffff;
  padding: 16px; border-radius: 8px; 
  box-shadow: 0 6px 12px rgba(39,6,160,.15), 0 0 0 1px rgba(39,6,160,.08);
  border: 1px solid rgba(39,6,160,.12);
  grid-template-columns: repeat(5, minmax(150px,1fr)) auto;
}
.picker, select, input {
  width: 100%; height: 44px; border: 1px solid var(--border); border-radius: 6px; padding: 0 12px; background: #fff;
}
.search-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 6px; border: 1px solid var(--border);
  color: #000; cursor: pointer; background: #fff;
}
.search-icon-btn .ico { width: 20px; height: 20px; }

/* Flatpickr: puntito azul lunes/viernes */
:global(.flatpickr-day.pos-rel) { position: relative; }
:global(.flatpickr-day.monfri::after) {
  content: ""; position: absolute; left: 50%; transform: translateX(-50%);
  bottom: 4px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
}

/* Flatpickr responsive: centrar calendario */
@media (max-width: 640px) {
  :global(.flatpickr-calendar) {
    left: 50% !important;
    transform: translateX(-50%) !important;
    max-width: 90vw !important;
    margin: 0 auto !important;
  }
}

/* ===== Pasajeros ===== */
.pax-field { position: relative; }
.pax-trigger {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; height: 44px; padding: 0 12px;
  border: 1px solid var(--border); border-radius: 6px; background: #fff; color: var(--ink,#0b1220);
  font-weight: 500;
}
.pax-trigger-right { font-weight: 800; }

/* ----- Popup (mismo estilo en desktop y móvil) ----- */
.pax-pop {
  position: absolute; top: calc(100% + 8px); right: 0;
  width: 260px; max-width: min(260px, 82vw);
  background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 12px;
  box-shadow: 0 12px 48px rgba(3, 22, 117, 0.12); padding: 10px; z-index: 1000;
}
.pax-head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 8px; }
.pax-head-title { font-weight: 800; }
.pax-head-count { font-size: 12px; font-weight: 800; opacity: .7; }

.row { display: flex; align-items: center; justify-content: space-between; padding: 10px 2px; border-bottom: 1px solid rgba(0,0,0,.06); }
.row:last-child { border-bottom: none; }
.left .title { font-weight: 700; }
.left .sub { font-size: 12px; color: #6b7280; }

.right { display: flex; align-items: center; gap: 12px; }
.square {
  width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
  background: #fff; color: var(--accent, #2740ff); border: 1px solid var(--accent, #2740ff); font-weight: 900; cursor: pointer;
}
.square:active { transform: translateY(1px); }
.count { width: 24px; text-align: center; font-weight: 900; }

.pax-actions { display: flex; justify-content: flex-end; margin-top: 10px; }
.pax-ok { 
  height: 38px; 
  padding: 0 18px; 
  border-radius: 10px; 
  border: 1px solid var(--accent);
  background: #ffffff;
  color: #000;
  font-weight: 600; 
  cursor: pointer; 
  font-family: inherit;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .search-bar {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
    box-shadow: 
      0 25px 50px -12px rgba(39,6,160,.25),
      0 0 0 1px rgba(255,255,255,.1),
      inset 0 1px 0 rgba(255,255,255,.2);
  }

  /* Popover igual que desktop: NO bottom-sheet */
  .pax-pop {
    right: 0;
    left: auto;
    width: 360px;
    max-width: min(360px, 92vw);
    border-radius: 12px;
    box-shadow: 0 12px 28px rgba(0,0,0,.12);
    padding: 10px;
    animation: none;
  }
   .pax-field { overflow: visible; }        
  .pax-pop {
    left: 50%;   
    width: clamp(90px, 82vw, 200px);       
    max-width: 82vw;
    border-radius: 12px;
    box-shadow: 0 16px 38px rgba(0,0,0,.12);    
    padding: 10px;
    z-index: 1000;
  }

  /* asegúrate de que el texto tenga espacio y no se colapse */
  .row { gap: 8px; }
  .left { flex: 1; min-width: 0; }
  .right { flex-shrink: 0; }
}


/* ===== Botón "Buscar" solo para responsive ===== */
.search-text-btn { display: none; }

/* Solo visible en móviles */
@media (max-width: 640px) {
  .search-icon-btn { display: none !important; }
  .search-text-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    border-radius: 8px;
    border: 1px solid var(--accent);
    background: #ffffff;
    color: #000;
    font-weight: 600;
    font-family: inherit;
    font-size: 16px;
    cursor: pointer;
    grid-column: 1 / -1;
    box-shadow: 0 2px 6px rgba(0,0,0,.08);
    transition: all 0.2s ease;
  }
  .search-text-btn:hover {
    background: #f7f9ff;
    transform: translateY(-1px);
  }
  .search-text-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
}
</style>
