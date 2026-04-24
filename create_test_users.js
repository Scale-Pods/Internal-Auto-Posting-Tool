const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
  { email: 'admin@scalepods.co', password: 'Password123!', role: 'Admin', name: 'Admin User' },
  { email: 'client@scalepods.co', password: 'Password123!', role: 'Client', name: 'Client User' },
  { email: 'designer@scalepods.co', password: 'Password123!', role: 'Designer', name: 'Designer User' }
];

async function createUsers() {
  console.log('Creating test users...');
  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.name,
          role: user.role,
        }
      }
    });

    if (error) {
      console.error(`Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`Successfully created ${user.email}`);
    }
  }
  console.log('Done.');
}

createUsers();
