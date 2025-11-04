const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

let rubric = null;
try {
  const rubricPath = path.join(process.cwd(), 'server', 'data', 'rubric', 'ieltsRubric.json');
  rubric = JSON.parse(fs.readFileSync(rubricPath, 'utf8'));
} catch (_) {
  rubric = { speaking: { fluency: 0.25, pronunciation: 0.25, lexical: 0.25, grammar: 0.25 } };
}

async function assessSpeaking(transcript) {
  if (!openai) {
    return {
      band_overall: 6.0,
      fluency: 6.0,
      pronunciation: 6.0,
      lexical: 6.0,
      grammar: 6.0,
      comments: 'AI assessment unavailable. Please retry later.'
    };
  }

  try {
    const systemPrompt = `You are a Cambridge IELTS examiner. Assess SPEAKING from transcript according to official IELTS rubric.

Rubric weights:
- Fluency and Coherence (FC): 25%
- Pronunciation (P): 25%
- Lexical Resource (LR): 25%
- Grammatical Range and Accuracy (GRA): 25%

Return JSON only:
{
  "band_overall": number (1-9),
  "fluency": number (1-9),
  "pronunciation": number (1-9),
  "lexical": number (1-9),
  "grammar": number (1-9),
  "comments": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Speaking Transcript:\n\n${transcript}` }
      ]
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return {
      band_overall: parsed.band_overall || 6.0,
      fluency: parsed.fluency || parsed.fc || 6.0,
      pronunciation: parsed.pronunciation || parsed.p || 6.0,
      lexical: parsed.lexical || parsed.lr || 6.0,
      grammar: parsed.grammar || parsed.gra || 6.0,
      comments: parsed.comments || 'Speaking assessment completed.'
    };
  } catch (err) {
    console.error('[SpeakingAssessor] Error:', err.message);
    return {
      band_overall: 6.0,
      fluency: 6.0,
      pronunciation: 6.0,
      lexical: 6.0,
      grammar: 6.0,
      comments: 'Assessment error. Please retry.'
    };
  }
}

module.exports = { assessSpeaking };

