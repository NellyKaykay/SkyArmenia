// src/lib/i18n.ts
import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

/* ---------------------------------------------
   1) Idiomas soportados (tipados)
---------------------------------------------- */
export const languages = ['en', 'es', 'ru', 'hy'] as const;
export type Lang = (typeof languages)[number];

/* ---------------------------------------------
   2) Detección de idioma inicial (client-safe)
---------------------------------------------- */
function pickInitial(): Lang {
  try {
    // 1) localStorage
    const saved = browser
      ? (localStorage.getItem('lang') as Lang | null)
      : null;
    if (saved && languages.includes(saved)) return saved;

    // 2) ?lang=xx en la URL
    if (browser) {
      const urlLang = new URL(window.location.href).searchParams.get('lang') as Lang | null;
      if (urlLang && languages.includes(urlLang)) return urlLang;

      // 3) Idioma del navegador
      const nav = (navigator.language || 'en').slice(0, 2) as Lang;
      if (languages.includes(nav)) return nav;
    }
  } catch {
    // noop
  }
  // 4) Fallback
  return 'es';
}

/* ---------------------------------------------
   3) Store base de idioma + setter
   (✅ Usa setLang(l) para cambiar idioma)
---------------------------------------------- */
const initial = browser ? pickInitial() : 'es';
export const lang = writable<Lang>(initial);

// En cliente, re-sincroniza una vez montado (por si SSR difiere)
if (browser) {
  // Asegura que el valor inicial respete URL/localStorage
  lang.set(pickInitial());

  // Si el usuario navega atrás/adelante y cambia ?lang=, sincroniza
  window.addEventListener('popstate', () => {
    const urlLang = new URL(window.location.href).searchParams.get('lang') as Lang | null;
    if (urlLang && languages.includes(urlLang)) {
      lang.set(urlLang);
    }
  });
}

/** Cambiar idioma (actualiza store, localStorage y ?lang=) */
export function setLang(l: Lang) {
  if (!languages.includes(l)) return;
  lang.set(l);
  if (browser) {
    try {
      localStorage.setItem('lang', l);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', l);
      history.replaceState({}, '', url.toString());
    } catch {
      // noop
    }
  }
}

/* ---------------------------------------------
   4) Diccionarios (puedes ampliar libremente)
---------------------------------------------- */
type Dict = Record<string, string>;

const dict: Record<Lang, Dict> = {
  en: {
    // Nav
    'nav.login': 'Sign in',
    'nav.logout': 'Sign out',
    'nav.signup': 'Sign up',
    'nav.profile': 'Profile',
    'nav.about': 'About Us',
    'nav.events': 'Events',
    'nav.flights': 'Flights',
    'nav.contact': 'Contact',

    // Hero
    'hero.title': 'Find the best flights',
    'hero.subtitle': 'Compare on Skyarmenia (FLYONE & Blackstone) and book in minutes.',

    // Options / form
    'opts.round': 'Round trip',
    'opts.oneway': 'One-way',
    'opts.bags': 'Bags',
    'form.passengers': 'Passengers',
    'form.origin': 'Origin',
    'form.destination': 'Destination',
    'form.depart': 'Departure',
    'form.return': 'Return',
    'form.search': 'Search flights',
    'form.promo': 'Promotion',
    'form.email': 'Email',
    'form.password': 'Password',

    // Offers / misc
    'offers.title': 'Direct flights',
    'status.soon': 'Soon...',
    'unit.hours': 'hours',
    'flight.direct': 'direct',
    'flight.stops': 'with stops',
    'price.from': 'from',

    // Footer
    'footer.about':
      'Flights and trips focused on Armenia and beyond. Compare, plan and book with confidence.',
    'footer.links': 'Links',
    'footer.cities': 'Cities',
    'footer.language': 'Language',
    'footer.rights': 'All rights reserved.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',

    'footer.newsletterTitle': 'Get flight deals',
    'footer.newsletterDesc': 'Weekly best fares, no spam.',
    'footer.subscribe': 'Subscribe',
    'footer.badgeIata': 'IATA-ready*',
    'footer.badgeSecure': 'Secure checkout'
  },

  es: {
    'nav.login': 'Iniciar sesión',
    'nav.logout': 'Cerrar sesión',
    'nav.signup': 'Crear cuenta',
    'nav.profile': 'Perfil',
    'nav.about': 'Sobre nosotros',
    'nav.events': 'Eventos',
    'nav.flights': 'Vuelos',
    'nav.contact': 'Contacto',

    'hero.title': 'Encuentra vuelos al mejor precio',
    'hero.subtitle': 'Compara en Skyarmenia (FLYONE & Blackstone) y reserva en minutos.',

    'opts.round': 'Ida y vuelta',
    'opts.oneway': 'Solo ida',
    'opts.bags': 'Maletas',
    'form.passengers': 'Pasajeros',
    'form.origin': 'Origen',
    'form.destination': 'Destino',
    'form.depart': 'Salida',
    'form.return': 'Regreso',
    'form.search': 'Buscar vuelos',
    'form.promo': 'Promoción',
    'form.email': 'Email',
    'form.password': 'Contraseña',

    'offers.title': 'Vuelos directos',
    'status.soon': 'Pronto...',
    'unit.hours': 'horas',
    'flight.direct': 'directo',
    'flight.stops': 'con escalas',
    'price.from': 'desde',

    'footer.about':
      'Vuelos y viajes con foco en Armenia y más. Compara, planifica y reserva con confianza.',
    'footer.links': 'Enlaces',
    'footer.cities': 'Ciudades',
    'footer.language': 'Idioma',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.cookies': 'Cookies',

    'footer.newsletterTitle': 'Recibe ofertas de vuelos',
    'footer.newsletterDesc': 'Mejores tarifas semanales, sin spam.',
    'footer.subscribe': 'Suscribirme',
    'footer.badgeIata': 'IATA-ready*',
    'footer.badgeSecure': 'Pago seguro'
  },

  ru: {
    'nav.login': 'Войти',
    'nav.logout': 'Выйти',
    'nav.signup': 'Создать аккаунт',
    'nav.profile': 'Профиль',
    'nav.about': 'О нас',
    'nav.events': 'События',
    'nav.flights': 'Рейсы',
    'nav.contact': 'Контакты',

    'hero.title': 'Найдите лучшие авиабилеты',
    'hero.subtitle': 'Сравнивайте на Skyarmenia (FLYONE & Blackstone) и бронируйте за минуты.',

    'opts.round': 'Туда-обратно',
    'opts.oneway': 'В одну сторону',
    'opts.bags': 'Багаж',
    'form.passengers': 'Пассажиры',
    'form.origin': 'Отправление',
    'form.destination': 'Назначение',
    'form.depart': 'Вылет',
    'form.return': 'Обратный рейс',
    'form.search': 'Найти рейсы',
    'form.promo': 'Акции',
    'form.email': 'Email',
    'form.password': 'Пароль',

    'offers.title': 'Прямые рейсы',
    'status.soon': 'Скоро...',
    'unit.hours': 'часов',
    'flight.direct': 'прямой',
    'flight.stops': 'с пересадками',
    'price.from': 'от',

    'footer.about':
      'Рейсы и путешествия с фокусом на Армению и не только. Сравнивайте, планируйте и бронируйте уверенно.',
    'footer.links': 'Ссылки',
    'footer.cities': 'Города',
    'footer.language': 'Язык',
    'footer.rights': 'Все права защищены.',
    'footer.privacy': 'Конфиденциальность',
    'footer.terms': 'Условия',
    'footer.cookies': 'Cookies',

    'footer.newsletterTitle': 'Получать предложения',
    'footer.newsletterDesc': 'Лучшие цены каждую неделю, без спама.',
    'footer.subscribe': 'Подписаться',
    'footer.badgeIata': 'IATA-ready*',
    'footer.badgeSecure': 'Безопасная оплата'
  },

  hy: {
    'nav.login': 'Մուտք գործել',
    'nav.logout': 'Դուրս գալ',
    'nav.signup': 'Գրանցվել',
    'nav.profile': 'Պրոֆիլ',
    'nav.about': 'Մեր մասին',
    'nav.events': 'Իրադարձություններ',
    'nav.flights': 'Թռիչքներ',
    'nav.contact': 'Կապ',

    'hero.title': 'Գտիր լավագույն ավիատոմսերը',
    'hero.subtitle':
      'Համեմատիր Skyarmenia-ում (FLYONE & Blackstone) և ամրագրիր րոպեների ընթացքում։',

    'opts.round': 'Երթա-եկա',
    'opts.oneway': 'Մեկ ուղղություն',
    'opts.bags': 'Ուղեբեռ',
    'form.passengers': 'Ուղևորներ',
    'form.origin': 'Մեկնման քաղաք',
    'form.destination': 'Նպատակակետ',
    'form.depart': 'Մեկնում',
    'form.return': 'Վերադարձ',
    'form.search': 'Փնտրել չվերթներ',
    'form.promo': 'Ակցիա',
    'form.email': 'Email',
    'form.password': 'Գաղտնաբառ',

    'offers.title': 'Ուղիղ չվերթներ',
    'status.soon': 'Շուտով...',
    'unit.hours': 'ժամ',
    'flight.direct': 'ուղիղ',
    'flight.stops': 'փոխանցումով',
    'price.from': 'սկսած',

    'footer.about':
      'Թռիչքներ և ճամփորդություններ՝ կենտրոնացած Հայաստանի և շրջակայքի վրա։ Համեմատեք, պլանավորեք և ամրագրեք վստահությամբ։',
    'footer.links': 'Հղումներ',
    'footer.cities': 'Քաղաքներ',
    'footer.language': 'Լեզու',
    'footer.rights': 'Բոլոր իրավունքները պաշտպանված են։',
    'footer.privacy': 'Գաղտնիություն',
    'footer.terms': 'Պայմաններ',
    'footer.cookies': 'Cookie-ներ',

    'footer.newsletterTitle': 'Ստանալ գաղտնի առաջարկներ',
    'footer.newsletterDesc': 'Լավագույն գները՝ ամեն շաբաթ, առանց սպամի։',
    'footer.subscribe': 'Բաժանորդագրվել',
    'footer.badgeIata': 'IATA-ready*',
    'footer.badgeSecure': 'Անվտանգ վճարում'
  }
};

/* ---------------------------------------------
   5) Fallback seguro (Proxy)
---------------------------------------------- */
function withFallback(d: Dict, fallback: Dict): Dict {
  return new Proxy(d, {
    get(target, prop: string) {
      if (prop in target) return target[prop as keyof Dict];
      if (prop in fallback) return fallback[prop as keyof Dict];
      return prop; // útil para detectar faltantes en UI
    }
  });
}

const baseEN = dict.en;

/* ---------------------------------------------
   6) Store derivado REACTIVO para textos
---------------------------------------------- */
export const i18n: Readable<Dict> = derived(lang, (l) =>
  withFallback(dict[l] ?? baseEN, baseEN)
);
