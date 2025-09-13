// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // `session` la puso hooks.server.ts en locals
  return {
    session: locals.session
  };
};
