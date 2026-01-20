const OpenAI = require('openai');

function createClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  });
}

async function callJson({ system, user, schema, model, temperature, seed }) {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('OPENAI_API_KEY not configured');
    err.statusCode = 503;
    err.publicMessage = 'AI scoring is not configured on the server.';
    throw err;
  }

  const openai = createClient();

  const baseReq = {
    model,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: 900,
  };

  // Some OpenAI models support seed. If rejected, we retry without it.
  const withSeed = seed ? { ...baseReq, seed } : baseReq;

  try {
    // Prefer json_schema strict output
    const completion = await openai.chat.completions.create({
      ...withSeed,
      response_format: {
        type: 'json_schema',
        json_schema: schema,
      },
    });
    return completion.choices?.[0]?.message?.content || '';
  } catch (e) {
    const completion = await openai.chat.completions.create(baseReq);
    return completion.choices?.[0]?.message?.content || '';
  }
}

module.exports = { callJson };

