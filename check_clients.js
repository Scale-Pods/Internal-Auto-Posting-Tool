import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(3);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

check();
