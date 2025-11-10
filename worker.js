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

    // The Gemini API URL.
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

    // Get the API Key from the Cloudflare secrets (we'll set this up in the dashboard)
    const GEMINI_API_KEY = env.GEMINI_API_KEY;

    // Construct the request to the actual Gemini API
    const geminiRequest = {
      contents: contents,
    };

    // Make the secure call to the Gemini API
    const geminiResponse = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequest),
    });

    // Get the response from Gemini and send it back to your frontend
    const geminiData = await geminiResponse.json();

    return new Response(JSON.stringify(geminiData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders, // Add CORS headers to the response
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
