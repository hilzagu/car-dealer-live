import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) console.warn('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — see .env.example')

export const envMissing = !url || !anon
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anon || 'placeholder-anon-key'
)
export const formatNGN = (kobo) =>
  '₦' + Number(kobo / 100).toLocaleString('en-NG')
