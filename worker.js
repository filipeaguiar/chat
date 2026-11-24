export default {
  async fetch(request, env, ctx) {
    // This handles CORS preflight requests. This is needed for security.
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // We only want to accept POST requests from your frontend
    if (request.method !== 'POST') {
      return new Response('Expected POST request', { status: 405 });
    }

    // Get the chat history sent from the frontend
    const { contents } = await request.json();

    // Get the API Key from the Cloudflare secrets (we'll set this up in the dashboard)
    const GEMINI_API_KEY = env.GEMINI_API_KEY;

    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite'
    ];
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const geminiResponse = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contents }),
        });

        if (!geminiResponse.ok) {
          const errText = await geminiResponse.text();
          console.warn(`Model ${model} failed (${geminiResponse.status}):`, errText);
          lastError = new Error(`Status ${geminiResponse.status}: ${errText}`);
          continue;
        }

        const geminiData = await geminiResponse.json();
        return new Response(JSON.stringify(geminiData), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (err) {
        lastError = err;
      }
    }

    return new Response(JSON.stringify({ error: lastError?.message || 'All models failed' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  },
};

// Define the CORS headers to allow your GitHub Pages site to make requests
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://filipeaguiar.github.io', // This allows ONLY your github pages site
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handles the CORS preflight request
function handleOptions(request) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: corsHeaders,
    });
  } else {
    return new Response(null, {
      headers: {
        Allow: 'POST, OPTIONS',
      },
    });
  }
}
