import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function seedClient() {
  const { data, error } = await supabase
    .from('clients')
    .insert([
      { 
        business_name: 'Scalepods', 
        industry_type: 'AI Automation Agency',
        business_description: 'Building autonomous AI workflows and n8n-powered automation for scale-ups.',
        target_audience: 'Founders, operations leaders, and scaling tech companies.',
        platforms: 'LinkedIn, Website, Twitter',
        primary_goal: 'Lead Generation',
        brand_tone: 'Innovative & Efficient',
        status: 'active'
      }
    ])
    .select();

  if (error) {
    console.error('Error seeding client:', error);
  } else {
    console.log('Successfully seeded client:', data);
  }
}

seedClient();
