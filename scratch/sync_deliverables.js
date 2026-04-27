const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncDeliverables() {
  console.log("Starting sync...");
  
  // 1. Get all approved clients (support both legacy and new status strings)
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .in('status', ['Content Approved', 'Design Approved']);
    
  if (error) {
    console.error("Error fetching clients:", error);
    return;
  }
  
  console.log(`Found ${clients.length} approved clients.`);
  
  for (const client of clients) {
    console.log(`Processing ${client.business_name}...`);
    
    // Check if deliverables already exist
    const { count } = await supabase
      .from('content_deliverables')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);
      
    if (count > 0) {
      console.log(`- Deliverables already exist for ${client.business_name}. Skipping.`);
      continue;
    }
    
    // Create deliverables
    try {
      const content = typeof client.content_json === 'string' 
        ? JSON.parse(client.content_json) 
        : client.content_json;
        
      if (content && typeof content === 'object') {
        const deliverables = [];
        Object.keys(content).forEach((platform) => {
          const posts = content[platform];
          if (Array.isArray(posts)) {
            posts.forEach((post, idx) => {
              deliverables.push({
                client_id: client.id,
                platform: platform,
                platform_target: platform,
                task_name: post.topic || `Post #${idx + 1}`,
                // Map caption to topic since caption column is missing in DB
                topic: post.caption || post.topic || "",
                post_type: post.format || "Post",
                status: "Ready for Publishing",
                media_url: post.slides ? post.slides.map(s => s.visual_description).join(",") : ""
              });
            });
          }
        });
        
        if (deliverables.length > 0) {
          const { error: insertError } = await supabase.from('content_deliverables').insert(deliverables);
          if (insertError) console.error(`- Error inserting for ${client.business_name}:`, insertError);
          else console.log(`- Successfully created ${deliverables.length} deliverables for ${client.business_name}.`);
        }
      }
    } catch (e) {
      console.error(`- Error parsing JSON for ${client.business_name}:`, e);
    }
  }
  
  console.log("Sync complete.");
}

syncDeliverables();
