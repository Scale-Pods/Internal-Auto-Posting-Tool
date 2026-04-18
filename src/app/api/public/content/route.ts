import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // CORS configuration allowing any external website to query the API
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing clientId parameter.' },
      { status: 400, headers }
    );
  }

  // Simulated Database Payload (Mocking response mapped from 'Website CMS Feed' Google Sheet populated by Phase 5)
  const websiteContentFeed = [
    {
      id: 'post_101',
      type: 'Educational',
      title: 'Why Quality Standards Matter in Steel Construction',
      content_snippet: 'Discover the rigorous processes behind our structural steel, designed to withstand a century of urban compression exactly when it matters most.',
      image_url: 'https://images.unsplash.com/photo-1541888086925-920a0b12bc12?auto=format&fit=crop&q=80',
      published_date: new Date().toISOString()
    },
    {
      id: 'post_102',
      type: 'Testimonial',
      title: 'Downtown High-Rise Success Story',
      content_snippet: 'We delivered 400 tons of structural steel ahead of schedule, proving our logistical superiority in high-density zones.',
      image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80',
      published_date: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  return NextResponse.json({
    success: true,
    client_id: clientId,
    data: websiteContentFeed
  }, { status: 200, headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
