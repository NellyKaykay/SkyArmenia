// src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

/** 🔤 Diccionario mínimo de errores para login */
const T = {
  es: {
    required_both: 'Por favor, introduce tu email y contraseña.',
    invalid_credentials: 'Email o contraseña incorrectos.',
    email_not_confirmed: 'Tu email no está verificado. Revisa tu bandeja y confirma tu cuenta.',
    rate_limited: 'Demasiados intentos. Prueba en unos minutos.',
    generic: 'No se pudo iniciar sesión. Inténtalo de nuevo.'
  },
  en: {
    required_both: 'Please enter your email and password.',
    invalid_credentials: 'Invalid email or password.',
    email_not_confirmed: 'Your email is not verified. Check your inbox and confirm your account.',
    rate_limited: 'Too many attempts. Try again in a few minutes.',
    generic: 'Could not sign in. Please try again.'
  },
  ru: {
    required_both: 'Пожалуйста, укажите e-mail и пароль.',
    invalid_credentials: 'Неверный e-mail или пароль.',
    email_not_confirmed: 'Ваш e-mail не подтверждён. Проверьте почту и подтвердите аккаунт.',
    rate_limited: 'Слишком много попыток. Повторите через несколько минут.',
    generic: 'Не удалось войти. Попробуйте ещё раз.'
  },
  hy: {
    required_both: 'Խնդրում ենք մուտքագրել էլ. փոստն ու գաղտնաբառը։',
    invalid_credentials: 'Սխալ էլ. փոստ կամ գաղտնաբառ։',
    email_not_confirmed: 'Ձեր էլ. փոստը չի հաստատվել․ ստուգեք փոստարկղը և հաստատեք հաշվը։',
    rate_limited: 'Չափազանց շատ փորձեր։ Կրկնեք մի քանի րոպե անց։',
    generic: 'Չհաջողվեց մուտք գործել։ Խնդրում ենք կրկին փորձել։'
  }
} as const;

type LangKey = keyof typeof T;

/** Obtiene el lang desde ?lang=, cookie "lang" o 'es' por defecto */
function getLangFrom(request: Request, cookies: import('@sveltejs/kit').Cookies, url: URL): LangKey {
  const q = (url.searchParams.get('lang') || '').toLowerCase();
  if (q && (q in T)) return q as LangKey;
  const c = (cookies.get('lang') || '').toLowerCase();
  if (c && (c in T)) return c as LangKey;
  return 'es';
}

export const actions: Actions = {
  // ÚNICA acción: debe coincidir con action="?/login" en el <form>
  login: async ({ request, locals, cookies, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const lang = getLangFrom(request, cookies, url);
    const t = T[lang];

    if (!email || !password) {
      return fail(400, { error: t.required_both, values: { email } });
    }

    const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = (error.message || '').toLowerCase();

      if (/invalid login credentials|invalid email or password|credentials/.test(msg)) {
        return fail(400, { error: t.invalid_credentials, values: { email } });
      }
      if (/email not confirmed|confirm your email|not verified/.test(msg)) {
        return fail(400, { error: t.email_not_confirmed, values: { email } });
      }
      if (/rate|too many/.test(msg)) {
        return fail(429, { error: t.rate_limited, values: { email } });
      }

      return fail(400, { error: t.generic, values: { email } });
    }

    // Éxito
    if (data?.session) {
      throw redirect(303, '/');
    }

    // Caso raro: sin error y sin sesión
    return fail(400, { error: t.generic, values: { email } });
  }
};
