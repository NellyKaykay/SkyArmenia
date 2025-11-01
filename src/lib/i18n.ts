// src/lib/i18n.ts
import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

export const languages = ['en', 'es', 'ru', 'hy'] as const;
export type Lang = (typeof languages)[number];

/* ========= Detectar idioma inicial ========= */
function pickInitial(): Lang {
  try {
    if (browser) {
      // 1) URL ?lang=
      const urlLang = new URL(window.location.href).searchParams.get('lang') as Lang | null;
      if (urlLang && languages.includes(urlLang)) return urlLang;

      // 2) Cookie
      const m = document.cookie.match(/(?:^|;\s*)lang=([a-z]{2})(?:;|$)/i);
      const cookieLang = (m?.[1] as Lang | undefined) ?? null;
      if (cookieLang && languages.includes(cookieLang)) return cookieLang;

      // 3) localStorage
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved && languages.includes(saved)) return saved;

      // 4) Idioma del navegador
      const nav = (navigator.language || 'en').slice(0, 2) as Lang;
      if (languages.includes(nav)) return nav;
    }
  } catch { /* noop */ }
  return 'es';
}

/* ========= Store de idioma ========= */
export const lang = writable<Lang>('es');

export function initLang(initialFromServer?: Lang) {
  if (!browser) return;
  const l =
    initialFromServer && languages.includes(initialFromServer)
      ? initialFromServer
      : pickInitial();
  applyLang(l, { updateUrl: false });
}

export function setLang(l: Lang, opts?: { updateUrl?: boolean }) {
  if (!languages.includes(l)) return;
  applyLang(l, { updateUrl: opts?.updateUrl ?? true });
}

function applyLang(l: Lang, { updateUrl }: { updateUrl: boolean }) {
  lang.set(l);
  if (!browser) return;

  try {
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', l);
      history.replaceState(history.state, '', url);
    }
    document.cookie = `lang=${l}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
    localStorage.setItem('lang', l);
    document.documentElement.setAttribute('lang', l);
  } catch { /* noop */ }
}

/* ========= Diccionarios ========= */
type Dict = Record<string, string>;

const dict: Record<Lang, Dict> = {
  en: {
    'nav.login': 'Sign in',
    'nav.logout': 'Sign out',
    'nav.signup': 'Sign up',
    'nav.profile': 'Profile',
    'nav.about': 'About Us',
    'nav.events': 'Events',
    'nav.flights': 'Flights',
    'nav.contact': 'Contact',

    'hero.title': 'Find the best flights',
    'opts.round': 'Round trip',
    'opts.oneway': 'One-way',

    'form.passengers': 'Passengers',
    'form.origin': 'Origin',
    'form.destination': 'Destination',
    'form.depart': 'Departure',
    'form.return': 'Return',
    'form.search': 'Search flights',
    'form.promo': 'Promotion',
    'form.email': 'Email',
    'form.password': 'Password',

    'offers.title': 'Direct flights',
    'offers.yerevan': 'Yerevan',
    'offers.barcelona': 'Barcelona',

    'status.soon': 'Soon...',
    'status.searching': 'Searching…',
    'status.results': 'Results loaded',
    'status.no_results': 'No results',

    'unit.hours': 'hours',
    'flight.direct': 'direct',
    'flight.stops': 'with stops',
    'price.from': 'from',

    'footer.links': 'Links',
    'footer.cities': 'Cities',
    'footer.language': 'Language',
    'footer.social': 'Follow us',
    'footer.and': 'and',
    'footer.rights': 'All rights reserved.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookies',

    /* Auth */
    'auth.login.title': 'Sign in',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign in',
    'auth.login.forgot': 'Forgot your password?',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.signupLink': 'Sign up',

    'auth.signup.title': 'Create account',
    'auth.signup.name': 'Name',
    'auth.signup.email': 'Email',
    'auth.signup.password': 'Password',
    'auth.signup.submit': 'Sign up',
    'auth.signup.haveAccount': 'Already have an account?',
    'auth.signup.loginLink': 'Sign in',

    'auth.password.show': 'Show password',
    'auth.password.hide': 'Hide password',
    'legal.accept': 'I accept the',
    'legal.terms': 'Terms of Service',
    'legal.privacy': 'Privacy Policy',

    'auth.error.required_email': 'Please enter your email.',
    'auth.error.required_password': 'Please enter your password.',
    'auth.error.required_name': 'Please enter your name.',
    'auth.error.invalid_credentials': 'Invalid email or password.',
    'auth.error.email_not_confirmed': 'Please confirm your email before signing in.',
    'auth.error.too_many_requests': 'Too many attempts. Try again later.',
    'auth.error.generic': 'Something went wrong. Please try again.',

    /* Passengers */
    'passengers.title': 'Passengers',
    'passengers.adults': 'Adults',
    'passengers.adults.hint': 'Adults-from 12 years old',
    'passengers.children': 'Children',
    'passengers.children.hint': 'Childrens-from 2 to 11 years old',
    'passengers.infants': 'Infants',
    'passengers.infants.hint': 'Infants-under 2 years old'
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
    'opts.round': 'Ida y vuelta',
    'opts.oneway': 'Solo ida',
    'opts.bags': 'Maletas',

    'form.passengers': 'Viajeros',
    'form.origin': 'Origen',
    'form.destination': 'Destino',
    'form.depart': 'Ida',
    'form.return': 'Vuelta',
    'form.search': 'Buscar vuelos',
    'form.email': 'Email',
    'form.password': 'Contraseña',

    'offers.title': 'Vuelos directos',
    'offers.yerevan': 'Yereván',
    'offers.barcelona': 'Barcelona',

    'status.soon': 'Pronto...',
    'status.searching': 'Buscando…',
    'status.results': 'Resultados cargados',
    'status.no_results': 'Sin resultados',

    'unit.hours': 'horas',
    'flight.direct': 'directo',
    'flight.stops': 'con escalas',
    'price.from': 'desde',

    'footer.links': 'Enlaces',
    'footer.cities': 'Ciudades',
    'footer.language': 'Idioma',
    'footer.social': 'Síguenos',
    'footer.and': 'y',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.cookies': 'Cookies',

    /* Auth */
    'auth.login.title': 'Iniciar sesión',
    'auth.login.email': 'Correo electrónico',
    'auth.login.password': 'Contraseña',
    'auth.login.submit': 'Entrar',
    'auth.login.forgot': '¿Has olvidado tu contraseña?',
    'auth.login.noAccount': '¿No tienes cuenta?',
    'auth.login.signupLink': 'Regístrate',

    'auth.signup.title': 'Crear cuenta',
    'auth.signup.name': 'Nombre',
    'auth.signup.email': 'Correo electrónico',
    'auth.signup.password': 'Contraseña',
    'auth.signup.submit': 'Registrarse',
    'auth.signup.haveAccount': '¿Ya tienes cuenta?',
    'auth.signup.loginLink': 'Inicia sesión',

    'auth.password.show': 'Mostrar contraseña',
    'auth.password.hide': 'Ocultar contraseña',
    'legal.accept': 'Acepto las',
    'legal.terms': 'Condiciones del servicio',
    'legal.privacy': 'Política de privacidad',

    'auth.error.required_email': 'Por favor, introduce tu email.',
    'auth.error.required_password': 'Por favor, introduce tu contraseña.',
    'auth.error.required_name': 'Por favor, introduce tu nombre.',
    'auth.error.invalid_credentials': 'Email o contraseña incorrectos.',
    'auth.error.email_not_confirmed': 'Debes confirmar tu email antes de iniciar sesión.',
    'auth.error.too_many_requests': 'Demasiados intentos. Inténtalo de nuevo más tarde.',
    'auth.error.generic': 'Ha ocurrido un error. Vuelve a intentarlo.',

    /* Passengers */
    'passengers.title': 'Pasajeros',
    'passengers.adults': 'Adultos',
    'passengers.adults.hint': 'Adultos-desde 12 años',
    'passengers.children': 'Niños',
    'passengers.children.hint': 'Niños-de 2 a 11 años',
    'passengers.infants': 'Bebés',
    'passengers.infants.hint': 'Bebes-menores de 2 años'
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
    'opts.round': 'Туда-обратно',
    'opts.oneway': 'В одну сторону',
    'opts.bags': 'Багаж',

    'form.passengers': 'Пассажиры',
    'form.origin': 'Из',
    'form.destination': 'Куда',
    'form.depart': 'Вылет',
    'form.return': 'Обратный рейс',
    'form.search': 'Найти рейсы',
    'form.email': 'Email',
    'form.password': 'Пароль',

    'offers.title': 'Прямые рейсы',
    'offers.yerevan': 'Ереван',
    'offers.barcelona': 'Барселона',

    'status.soon': 'Скоро...',
    'status.searching': 'Поиск…',
    'status.results': 'Результаты загружены',
    'status.no_results': 'Нет результатов',

    'unit.hours': 'часов',
    'flight.direct': 'прямой',
    'flight.stops': 'с пересадками',
    'price.from': 'от',

    'footer.links': 'Ссылки',
    'footer.cities': 'Города',
    'footer.language': 'Язык',
    'footer.social': 'Подпишитесь',
    'footer.and': 'и',
    'footer.rights': 'Все права защищены.',
    'footer.privacy': 'Конфиденциальность',
    'footer.terms': 'Условия',
    'footer.cookies': 'Cookies',

    /* Auth */
    'auth.login.title': 'Войти',
    'auth.login.email': 'Электронная почта',
    'auth.login.password': 'Пароль',
    'auth.login.submit': 'Войти',
    'auth.login.forgot': 'Забыли пароль?',
    'auth.login.noAccount': 'Нет аккаунта?',
    'auth.login.signupLink': 'Зарегистрироваться',

    'auth.signup.title': 'Создать аккаунт',
    'auth.signup.name': 'Имя',
    'auth.signup.email': 'Электронная почта',
    'auth.signup.password': 'Пароль',
    'auth.signup.submit': 'Зарегистрироваться',
    'auth.signup.haveAccount': 'Уже есть аккаунт?',
    'auth.signup.loginLink': 'Войти',

    'auth.password.show': 'Показать пароль',
    'auth.password.hide': 'Скрыть пароль',
    'legal.accept': 'Я принимаю',
    'legal.terms': 'Условия обслуживания',
    'legal.privacy': 'Политику конфиденциальности',

    'auth.error.required_email': 'Пожалуйста, укажите e-mail.',
    'auth.error.required_password': 'Пожалуйста, укажите пароль.',
    'auth.error.required_name': 'Пожалуйста, укажите имя.',
    'auth.error.invalid_credentials': 'Неверная почта или пароль.',
    'auth.error.email_not_confirmed': 'Подтвердите e-mail перед входом.',
    'auth.error.too_many_requests': 'Слишком много попыток. Повторите позже.',
    'auth.error.generic': 'Произошла ошибка. Попробуйте ещё раз.',

    /* Passengers */
    'passengers.title': 'Пассажиры',
    'passengers.adults': 'Взрослые',
    'passengers.adults.hint': 'от 12 лет',
    'passengers.children': 'Дети',
    'passengers.children.hint': 'от 2 до 11 лет',
    'passengers.infants': 'Младенцы',
    'passengers.infants.hint': 'до 2 лет'
  },

  hy: {
    'nav.login': 'Մուտք',
    'nav.logout': 'Ելք',
    'nav.signup': 'Գրանցվել',
    'nav.profile': 'Հաշիվ',
    'nav.about': 'Մեր մասին',
    'nav.events': 'Իրադարձություններ',
    'nav.flights': 'Թռիչքներ',
    'nav.contact': 'Կապ',

    'hero.title': 'Գտիր լավագույն ավիատոմսերը',
    'opts.round': 'Դարձի հետ',
    'opts.oneway': 'Միակողմանի',
    'opts.bags': 'Ուղեբեռ',

    'form.passengers': 'Ուղևորներ',
    'form.origin': 'Սկիզբ',
    'form.destination': 'Դեպի',
    'form.depart': 'Մեկնում',
    'form.return': 'Ժամանում',
    'form.search': 'Որոնել',
    'form.email': 'Էլ․ փոստ',
    'form.password': 'Գաղտնաբառ',

    'offers.title': 'Ուղիղ չվերթներ',
    'offers.yerevan': 'Երևան',
    'offers.barcelona': 'Բարսելոնա',

    'status.searching': 'Որոնում…',
    'status.results': 'Արդյունքները բեռնվեցին',
    'status.no_results': 'Արդյունքներ չկան',

    'unit.hours': 'ժամ',
    'flight.direct': 'ուղիղ',
    'flight.stops': 'փոխադրումով',
    'price.from': 'սկսած',

    'footer.links': 'Հղումներ',
    'footer.cities': 'Քաղաքներ',
    'footer.language': 'Լեզու',
    'footer.social': 'Հետևեք մեզ',
    'footer.and': 'և',
    'footer.rights': 'Բոլոր իրավունքները պաշտպանված են։',
    'footer.privacy': 'Գաղտնիություն',
    'footer.terms': 'Պայմաններ',
    'footer.cookies': 'Cookie-ներ',

    /* Auth */
    'auth.login.title': 'Մուտք',
    'auth.login.email': 'Էլ. փոստ',
    'auth.login.password': 'Գաղտնաբառ',
    'auth.login.submit': 'Մուտք գործել',
    'auth.login.forgot': 'Մոռացե՞լ եք գաղտնաբառը',
    'auth.login.noAccount': 'Չունե՞ք հաշիվ',
    'auth.login.signupLink': 'Գրանցվել',

    'auth.signup.title': 'Գրանցում',
    'auth.signup.name': 'Անուն',
    'auth.signup.email': 'Էլ. փոստ',
    'auth.signup.password': 'Գաղտնաբառ',
    'auth.signup.submit': 'Գրանցվել',
    'auth.signup.haveAccount': 'Արդեն ունե՞ք հաշիվ',
    'auth.signup.loginLink': 'Մուտք',

    'auth.password.show': 'Ցուցադրել գաղտնաբառը',
    'auth.password.hide': 'Թաքցնել գաղտնաբառը',
    'legal.accept': 'Ընդունում եմ',
    'legal.terms': 'Օգտագործման պայմանները',
    'legal.privacy': 'Գաղտնիության քաղաքականություն',

    'auth.error.required_email': 'Խնդրում ենք մուտքագրել էլ. փոստը',
    'auth.error.required_password': 'Խնդրում ենք մուտքագրել գաղտնաբառը',
    'auth.error.required_name': 'Խնդրում ենք մուտքագրել անունը',
    'auth.error.invalid_credentials': 'Սխալ էլ. փոստ կամ գաղտնաբառ',
    'auth.error.email_not_confirmed': 'Ստուգեք էլ. փոստը նախքան մուտքը',
    'auth.error.too_many_requests': 'Չափազանց շատ փորձեր. կրկնեք ավելի ուշ',
    'auth.error.generic': 'Սխալ տեղի ունեցավ. կրկին փորձեք',

    /* Passengers */
    'passengers.title': 'Ուղևոր',
    'passengers.adults': 'Մեծահասակներ',
    'passengers.adults.hint': 'Մեծահասակներ-սկսած 12 տարեկանից',
    'passengers.children': 'Երեխա',
    'passengers.children.hint': 'Երեխա-2–11 տարեկան',
    'passengers.infants': 'Նորածին',
    'passengers.infants.hint': 'Նորածին-մինչև 2 տարեկան'
  }
};

/* ========= Fallback a EN si falta una key ========= */
function withFallback(d: Dict, fallback: Dict): Dict {
  return new Proxy(d, {
    get(target, prop: string) {
      if (prop in target) return target[prop as keyof Dict];
      if (prop in fallback) return fallback[prop as keyof Dict];
      return prop as string; // devuelve la clave si no existe en ninguno
    }
  });
}

const baseEN = dict.en;

/* Store derivado con fallback automático */
export const i18n: Readable<Dict> = derived(lang, (l) =>
  withFallback(dict[l] ?? baseEN, baseEN)
);
