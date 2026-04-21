const n8nUrl = "https://n8n.srv1010832.hstgr.cloud/webhook/saas-ai-caption";
const body = {
  topic: "Breathtaking Penthouse Tour",
  platform: "Instagram",
  client_name: "Luxe Living Real Estate"
};

async function test() {
  try {
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
