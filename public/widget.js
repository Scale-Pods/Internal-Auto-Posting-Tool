(function() {
  // 1. Identify the designated DOM container
  const CONTAINER_ID = 'marketing-saas-widget';
  const container = document.getElementById(CONTAINER_ID);

  if (!container) {
    console.error(`[MarketingSaaS] Container with ID '${CONTAINER_ID}' not found.`);
    return;
  }

  const clientId = container.getAttribute('data-client-id');
  if (!clientId) {
    console.error('[MarketingSaaS] Missing data-client-id attribute on the container.');
    return;
  }

  // Determine API Host dynamically based on where the script is loaded from, fallback to localhost for dev
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const hostUrl = scriptTag ? new URL(scriptTag.src).origin : 'http://localhost:3000';

  // 2. Inject Namespaced CSS
  const style = document.createElement('style');
  style.innerHTML = `
    .ms-widget-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .ms-widget-card {
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      overflow: hidden;
      background: #ffffff;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .ms-widget-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .ms-widget-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      background: #f3f4f6;
    }
    .ms-widget-content {
      padding: 1.25rem;
    }
    .ms-widget-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f3f4f6;
      color: #374151;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .ms-widget-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .ms-widget-snippet {
      font-size: 0.875rem;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .ms-widget-footer {
      font-size: 0.75rem;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
      padding-top: 0.75rem;
    }
    .ms-widget-loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-family: sans-serif;
    }
  `;
  document.head.appendChild(style);

  // 3. Render Loading State
  container.innerHTML = '<div class="ms-widget-loading">Loading latest content...</div>';

  // 4. Fetch the Data from SaaS Backend
  fetch(`${hostUrl}/api/public/content?clientId=${clientId}`)
    .then(response => {
      if (!response.ok) throw new Error('API Request Failed');
      return response.json();
    })
    .then(payload => {
      if (!payload.success || !payload.data.length) {
        container.innerHTML = '<div class="ms-widget-loading">No content available.</div>';
        return;
      }

      // 5. Build the UI DOM string securely
      const gridHtml = payload.data.map(item => {
        const dateStr = new Date(item.published_date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        
        return `
          <div class="ms-widget-card">
            <img src="${item.image_url}" alt="${item.title}" class="ms-widget-image" loading="lazy" />
            <div class="ms-widget-content">
              <span class="ms-widget-badge">${item.type}</span>
              <h3 class="ms-widget-title">${item.title}</h3>
              <p class="ms-widget-snippet">${item.content_snippet}</p>
              <div class="ms-widget-footer">
                Published ${dateStr}
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `<div class="ms-widget-grid">${gridHtml}</div>`;
    })
    .catch(error => {
      console.error('[MarketingSaaS] Error fetching content:', error);
      container.innerHTML = '<div class="ms-widget-loading">Unable to load content feed.</div>';
    });
})();
