<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { i18n, lang } from '$lib/i18n';
  /* Props (solo como valores iniciales) */
  export let trip: 'oneway' | 'round' = 'round';

  export let origin = 'BCN';
  export let destination = 'EVN';
  export let depart = '';
  export let ret = '';
  export let adults: number = 1; // solo inicial

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
      infants: String(infantsC)
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
  import { Russian } from 'flatpickr/dist/l10n/ru.js';

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

  // Configuraciones de idioma
  const locales = {
    es: {
      ...Spanish,
      firstDayOfWeek: 1,
      months: {
        shorthand: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] as const,
        longhand: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const
      },
      weekdays: {
        shorthand: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"] as [string, string, string, string, string, string, string],
        longhand: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as [string, string, string, string, string, string, string]
      }
    },
    ru: {
      ...Russian,
      firstDayOfWeek: 1,
      months: {
        shorthand: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"] as const,
        longhand: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"] as const
      },
      weekdays: {
        shorthand: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as [string, string, string, string, string, string, string],
        longhand: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"] as [string, string, string, string, string, string, string]
      }
    },
    hy: {
      firstDayOfWeek: 1,
      months: {
        shorthand: ["Հուն", "Փետ", "Մար", "Ապր", "Մայ", "Հուն", "Հուլ", "Օգս", "Սեպ", "Հոկ", "Նոյ", "Դեկ"] as const,
        longhand: ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"] as const
      },
      weekdays: {
        shorthand: ["Կր", "Եր", "Եք", "Չո", "Հի", "Ու", "Շա"] as [string, string, string, string, string, string, string],
        longhand: ["Կիրակի", "Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ"] as [string, string, string, string, string, string, string]
      }
    }
  };

  // Función para obtener el idioma actual del calendario conectado con i18n
  function getCurrentLocale() {
    // Obtener idioma actual del store i18n usando get()
    const currentLang = $lang || 'es';
    
    // Mapear idiomas disponibles
    const langMap: { [key: string]: keyof typeof locales } = {
      'es': 'es',
      'ru': 'ru', 
      'hy': 'hy',
      'en': 'es' // inglés usa español para el calendario
    };
    
    const selectedLocale = langMap[currentLang] || 'es';
    console.log('Idioma actual:', currentLang, 'Locale calendario:', selectedLocale);
    return locales[selectedLocale];
  }

  function initPickers() {
    fpDepart?.destroy?.(); fpRet?.destroy?.();
    
    const currentLocale = getCurrentLocale();
    console.log('Inicializando calendario con locale:', currentLocale);
    
    const baseOpts: flatpickr.Options.Options = {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd-m-Y',
      allowInput: false,
      disableMobile: true,
      locale: currentLocale as any,
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
  
  // Reactividad: reinicializar calendarios cuando cambie el idioma
  $: if ($lang && fpDepart && fpRet) {
    initPickers();
  }

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


<!-- ===== Rail Ida/Vuelta — desplegable ===== -->

<!-- ===== Barra de búsqueda ===== -->
<form class="search-bar" on:submit={onSubmit}>
  <div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <label class="label" for="origin">{t('form.origin','Origen')}</label>
      <select id="trip-select" bind:value={trip} class="trip-select trip-inline">
        <option value="round">{t('opts.round','Ida y vuelta')}</option>
        <option value="oneway">{t('opts.oneway','Solo ida')}</option>
      </select>
    </div>
    <select id="origin" bind:value={origin}>
      <option value="BCN">Barcelona (BCN)</option>
      <option value="EVN">Yerevan (EVN)</option>
    </select>
  <!-- cierre correcto del bloque ciudad+selector -->
  </div>

  <div>
    <label class="label" for="destination">{t('form.destination','Destino')}</label>
    <select id="destination" bind:value={destination}>
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
     
     <!-- Campos ocultos para el formulario -->
     <input type="hidden" name="adults" bind:value={adultsC} />
     <input type="hidden" name="children" bind:value={childrenC} />
     <input type="hidden" name="infants" bind:value={infantsC} />
     
     <button type="button" class="picker pax-trigger" aria-haspopup="dialog" aria-expanded={paxOpen} aria-labelledby="pax-label"
       on:click={() => (paxOpen = !paxOpen)}>
       <span class="pax-trigger-left">
         {#if totalPax === 1 && childrenC === 0 && infantsC === 0}
           {t('passengers.single','1 Adulto')}
         {:else}
           {adultsC > 0 ? `${adultsC}A` : ''}{childrenC > 0 ? ` ${childrenC}N` : ''}{infantsC > 0 ? ` ${infantsC}B` : ''}
         {/if}
       </span>
       <span class="pax-trigger-right">
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <polyline points="6,9 12,15 18,9"></polyline>
         </svg>
       </span>
     </button>

     {#if paxOpen}
      <!-- Backdrop solo para responsive -->
      <button type="button" class="pax-backdrop-mobile" aria-label={t('common.close','Cerrar')} on:click={() => (paxOpen = false)}></button>
      <div class="pax-pop" role="dialog" aria-modal="true" aria-labelledby="pax-label"
           tabindex="-1" on:keydown={onDialogKeydown}
           on:click|stopPropagation>
        <!-- Adults -->
        <div class="row">
          <div class="left">
            <div class="title">{t('passengers.adults','Adultos')}</div>
            <div class="sub">{t('passengers.adults.hint','desde 12 años')}</div>
          </div>
          <div class="right">
            <button type="button" class="square" disabled={adultsC <= 1} on:click={(e)=>dec('adults',e)} aria-label="Quitar adulto">−</button>
            <div class="count" aria-live="polite">{adultsC}</div>
            <button type="button" class="square" disabled={adultsC >= 9} on:click={(e)=>inc('adults',e)} aria-label="Añadir adulto">+</button>
          </div>
        </div>

        <!-- Children -->
        <div class="row">
          <div class="left">
            <div class="title">{t('passengers.children','Niños')}</div>
            <div class="sub">{t('passengers.children.hint','de 2 a 11 años')}</div>
          </div>
          <div class="right">
            <button type="button" class="square" disabled={childrenC <= 0} on:click={(e)=>dec('children',e)} aria-label="Quitar niño">−</button>
            <div class="count" aria-live="polite">{childrenC}</div>
            <button type="button" class="square" disabled={childrenC >= 9} on:click={(e)=>inc('children',e)} aria-label="Añadir niño">+</button>
          </div>
        </div>

        <!-- Infants -->
        <div class="row">
          <div class="left">
            <div class="title">{t('passengers.infants','Bebés')}</div>
            <div class="sub">{t('passengers.infants.hint','menores de 2 años')}</div>
          </div>
          <div class="right">
            <button type="button" class="square" disabled={infantsC <= 0} on:click={(e)=>dec('infants',e)} aria-label="Quitar bebé">−</button>
            <div class="count" aria-live="polite">{infantsC}</div>
            <button type="button" class="square" disabled={infantsC >= adultsC || infantsC >= 9} on:click={(e)=>inc('infants',e)} aria-label="Añadir bebé">+</button>
          </div>
        </div>

        <div class="pax-actions">
          <button type="button" class="pax-ok" on:click={() => (paxOpen = false)}>{t('common.ok','OK')}</button>
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
  /* ===== Variables CSS ===== */
  :root {
    --accent: #2563eb;
    --border: #e5e7eb;
    --muted: #6b7280;
    --ink: #0b1220;
  }

/* ===== Rail Ida/Vuelta — pequeño & en línea ===== */

 /* ===== Form Base ===== */
.label { 
  font-size: 12px; 
  color: var(--muted); 
  display: block; 
  margin-bottom: 4px; 
  font-weight: 500;
}


.trip-select {
  border: 1.5px solid var(--border, #e5e7eb);
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #222;
  background: #fff;
  outline: none;
  transition: border 0.15s;
  cursor: pointer;
  min-width: 90px;
  height: 32px;
}

.trip-select:focus,
.trip-select:active {
  border-color: var(--border, #e5e7eb);
  box-shadow: none;
}

.search-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1.2fr auto;
  gap: 16px;
  align-items: end;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 16px 20px 12px 20px;
  border: 1.5px solid var(--border, #e5e7eb);
  margin-bottom: 12px;
}

.search-icon-btn:hover {
  border-color: var(--accent);
  background: #f8fafc;
}

.search-icon-btn .ico { width: 20px; height: 20px; }

/* Flatpickr: puntito azul lunes/viernes */
:global(.flatpickr-day.pos-rel) { position: relative; }
:global(.flatpickr-day.monfri::after) {
  content: ""; position: absolute; left: 50%; transform: translateX(-50%);
  bottom: 4px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
}

/* Flatpickr: mejores estilos y posicionamiento */
:global(.flatpickr-calendar) {
  z-index: 1200 !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 12px !important;
}

:global(.flatpickr-months) {
  border-radius: 12px 12px 0 0 !important;
}

/* Flatpickr: mes, año y días de la semana en bold */
:global(.flatpickr-current-month) {
  font-weight: 700 !important;
}

:global(.flatpickr-current-month .flatpickr-monthDropdown-months) {
  font-weight: 700 !important;
}

:global(.flatpickr-current-month .numInputWrapper) {
  font-weight: 700 !important;
}

:global(.flatpickr-current-month .cur-year) {
  font-weight: 700 !important;
}

:global(.flatpickr-weekdays) {
  font-weight: 700 !important;
}

:global(.flatpickr-weekday) {
  font-weight: 700 !important;
  color: #374151 !important;
}

/* Flatpickr responsive: centrar calendario */
@media (max-width: 640px) {
  :global(.flatpickr-calendar) {
    left: 50% !important;
    transform: translateX(-50%) !important;
    max-width: 90vw !important;
    margin: 0 auto !important;
    z-index: 1200 !important;
  }
}

/* ===== Pasajeros CSS Profesional ===== */
.pax-field { 
  position: relative; 
  z-index: 10;
}

.pax-trigger {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  width: 100%; 
  height: 44px; 
  padding: 0 12px;
  border: 1px solid var(--border, #e5e7eb); 
  border-radius: 6px; 
  background: #fff; 
  color: var(--ink, #0b1220);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.pax-trigger:hover {
  border-color: var(--accent, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.pax-trigger-left { 
  font-weight: 600; 
  color: var(--ink, #0b1220);
  flex: 1;
  text-align: left;
}

.pax-trigger-right { 
  color: var(--muted, #6b7280);
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.pax-trigger[aria-expanded="true"] .pax-trigger-right {
  transform: rotate(180deg);
}

/* ----- Popup arriba del SearchBar (como calendario) ----- */
.pax-pop {
  position: absolute; 
  bottom: calc(100% + 8px); 
  right: 0;
  width: 280px; 
  max-width: min(280px, 85vw);
  background: #ffffff; 
  border: 1px solid rgba(0, 0, 0, 0.08); 
  border-radius: 12px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 1350;
  animation: slideInUp 0.2s ease-out;
  transform-origin: bottom center;
}




@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}



/* ----- Filas de Pasajeros Compactas ----- */
.row { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 10px 0; 
  border-bottom: 1px solid #f8fafc;
  gap: 12px;
}

.row:last-child { 
  border-bottom: none; 
  padding-bottom: 8px;
}

.left { 
  flex: 1;
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
}

.left .title { 
  font-weight: 700; 
  font-size: 14px; 
  line-height: 1.2; 
  color: #1e293b;
  font-family: inherit;
}

.left .sub { 
  font-size: 12px; 
  color: #64748b; 
  line-height: 1.2;
  font-weight: 400;
  font-family: inherit;
}

.right { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  flex-shrink: 0;
}

.square {
  width: 30px; 
  height: 30px; 
  border-radius: 6px; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center;
  background: #ffffff; 
  color: var(--accent); 
  border: 1.5px solid var(--accent); 
  font-weight: 700; 
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.square:hover {
  background: var(--accent);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.square:active { 
  transform: translateY(0); 
}

.square:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.count { 
  min-width: 24px; 
  text-align: center; 
  font-weight: 700; 
  font-size: 16px;
  color: #1e293b;
}

.pax-actions { 
  display: flex; 
  justify-content: flex-end; 
  margin-top: 12px; 
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.pax-ok { 
  height: 36px; 
  padding: 0 20px; 
  border-radius: 8px; 
  border: 1.5px solid var(--accent);
  background: var(--accent);
  color: white;
  font-weight: 600; 
  font-size: 14px;
  cursor: pointer; 
  font-family: inherit;
  transition: all 0.2s ease;
}

.pax-ok:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* Backdrop móvil oculto por defecto */
.pax-backdrop-mobile {
  display: none;
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  appearance: none;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .search-bar {
    grid-template-columns: 1fr 1fr;
  }
  .trip-select {
    min-width: 80px;
    font-size: 0.92rem;
    padding: 3px 6px;
    height: 28px;
  }
  /* Backdrop para responsive */
  .pax-backdrop-mobile {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    border: 0;
    padding: 0;
    margin: 0;
    appearance: none;
  }
  /* En móvil: popup centrado en pantalla */
  .pax-pop {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
    width: 260px;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 40px);
    padding: 10px !important;
    overflow-y: auto;
    animation: slideInUp 0.2s ease-out !important;
    z-index: 9999;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.3),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .left .title { font-size: 12px; }
  .left .sub { font-size: 10px; }
  .square { width: 24px; height: 24px; font-size: 13px; }
  .count { font-size: 13px; min-width: 18px; }
  .right { gap: 6px; }
  .row { padding: 6px 0; gap: 8px; }
  .pax-actions { margin-top: 8px; padding-top: 8px; }
  .pax-ok { height: 28px; padding: 0 10px; font-size: 12px; }
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

