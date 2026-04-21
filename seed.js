const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function seed() {
  console.log('🚀 Starting data seed (fixed schema)...');

  // 1. Create Sample Clients
  const clientsToInsert = [
    {
      business_name: "Urban Grind Coffee",
      industry_type: "Specialty Roastery & Cafe",
      business_description: "A premium coffee brand focusing on ethically sourced beans and artisan brewing methods for urban professionals.",
      target_audience: "Urban professionals, coffee enthusiasts, and remote workers aged 25-45.",
      platforms: "Instagram, LinkedIn",
      primary_goal: "Brand Awareness",
      brand_tone: "Premium",
      status: "active"
    },
    {
      business_name: "Luxe Living Real Estate",
      industry_type: "Luxury Property Agency",
      business_description: "High-end real estate agency specializing in luxury villas and penthouses in Dubai and Abu Dhabi.",
      target_audience: "High-net-worth individuals, international investors, and executives.",
      platforms: "Instagram, Facebook",
      primary_goal: "Sales",
      brand_tone: "Sophisticated",
      status: "active"
    },
    {
      business_name: "TechWave Solutions",
      industry_type: "SaaS Platform",
      business_description: "An all-in-one project management tool for creative agencies and distributed teams.",
      target_audience: "Agency founders, project managers, and lead designers.",
      platforms: "LinkedIn, Twitter",
      primary_goal: "Lead Generation",
      brand_tone: "Innovative",
      status: "active"
    }
  ];

  const { data: insertedClients, error: clientError } = await supabase.from('clients').insert(clientsToInsert).select();

  if (clientError) {
    console.error('❌ Error inserting clients:', clientError);
    return;
  }
  console.log(`✅ Inserted ${insertedClients.length} clients.`);

  // 2. Create Sample Content Deliverables
  const deliverablesToInsert = [];

  // Urban Grind Coffee Deliverables
  const urbanGrind = insertedClients.find(c => c.business_name === "Urban Grind Coffee");
  if (urbanGrind) {
    deliverablesToInsert.push(
      {
        client_id: urbanGrind.id,
        task_name: "Artisan Brewing Process",
        topic: "Showcasing the precision and care in our pour-over methods.",
        media_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
        status: "Ready for Publishing",
        platform_target: "Instagram"
      },
      {
        client_id: urbanGrind.id,
        task_name: "Community Spotlight",
        topic: "Highlighting our loyal customers and the morning rush atmosphere.",
        media_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
        status: "Published",
        platform_target: "Instagram"
      }
    );
  }

  // Luxe Living Deliverables
  const luxeLiving = insertedClients.find(c => c.business_name === "Luxe Living Real Estate");
  if (luxeLiving) {
    deliverablesToInsert.push(
      {
        client_id: luxeLiving.id,
        task_name: "Breathtaking Penthouse Tour",
        topic: "A cinematic walkthrough of our latest listing in Downtown Dubai.",
        media_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
        status: "Awaiting Review",
        platform_target: "Instagram"
      },
      {
        client_id: luxeLiving.id,
        task_name: "Market Insights Q3",
        topic: "A deep dive into the luxury property market trends this quarter.",
        media_url: "https://images.unsplash.com/photo-1460472178825-e5240623abe5?auto=format&fit=crop&q=80&w=800",
        status: "Ready for Publishing",
        platform_target: "website"
      }
    );
  }

  // TechWave Deliverables
  const techWave = insertedClients.find(c => c.business_name === "TechWave Solutions");
  if (techWave) {
    deliverablesToInsert.push(
      {
        client_id: techWave.id,
        task_name: "Productivity Hacks for Agencies",
        topic: "How distributed teams can stay aligned using TechWave.",
        media_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
        status: "Strategy Approved",
        platform_target: "LinkedIn"
      }
    );
  }

  const { data: insertedDeliverables, error: deliverableError } = await supabase.from('content_deliverables').insert(deliverablesToInsert).select();

  if (deliverableError) {
    console.error('❌ Error inserting deliverables:', deliverableError);
    return;
  }
  console.log(`✅ Inserted ${insertedDeliverables.length} content deliverables.`);
  console.log('🎉 Seeding complete!');
}

seed();
