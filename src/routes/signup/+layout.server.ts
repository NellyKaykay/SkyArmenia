import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Verificar si hay una sesión activa
  const { data: { session }, error } = await locals.supabase.auth.getSession();
  
  return {
    user: session?.user ?? null,
    isSignupPage: true,
    currentPath: url.pathname,
    // Si hay usuario logueado, podemos redirigir desde el layout
    shouldRedirect: !!session?.user
  };
};