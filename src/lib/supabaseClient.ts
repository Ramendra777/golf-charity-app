import { createClient } from '@supabase/supabase-js';

/**
 * Lazy Supabase browser client.
 * Using a getter function prevents build-time errors when env vars are absent
 * (Next.js evaluates module-level code during static generation).
 */
const getClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'
  );

// Export a proxy that initializes the client on first property access
export const supabase = new Proxy({} as ReturnType<typeof getClient>, {
  get(_target, prop) {
    return getClient()[prop as keyof ReturnType<typeof getClient>];
  },
});
