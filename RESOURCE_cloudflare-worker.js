export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Or specify your frontend origin
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Get OpenAI API key from environment variable
    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    let userInput;
    try {
      userInput = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON input" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate messages array
    if (!userInput || !Array.isArray(userInput.messages)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid messages array" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Prepare the payload for OpenAI API
    const requestBody = {
      model: "gpt-4o",
      messages: userInput.messages,
      max_tokens: 400,
      temperature: 1,
    };

    // Send the request to OpenAI
    const openaiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await openaiResponse.json();

    return new Response(JSON.stringify(data), {
      status: openaiResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
};

