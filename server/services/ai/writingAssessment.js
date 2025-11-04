const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

let rubric = null;
try {
  const rubricPath = path.join(process.cwd(), 'server', 'data', 'rubric', 'ieltsRubric.json');
  rubric = JSON.parse(fs.readFileSync(rubricPath, 'utf8'));
} catch (_) {
  rubric = { writing: { taskResponse: 0.25, coherence: 0.25, lexical: 0.25, grammar: 0.25 } };
}

async function assessWriting(text, taskType = 'Task 2') {
  if (!openai) {
    return {
      band_overall: 6.0,
      task_achievement: 6.0,
      coherence: 6.0,
      lexical: 6.0,
      grammar: 6.0,
      comments: 'AI assessment unavailable. Please retry later.'
    };
  }

  try {
    const systemPrompt = `You are a Cambridge IELTS examiner. Assess WRITING according to official IELTS rubric.

Rubric weights:
- Task Achievement/Response (TA): ${rubric.writing.taskResponse * 100}%
- Coherence and Cohesion (CC): ${rubric.writing.coherence * 100}%
- Lexical Resource (LR): ${rubric.writing.lexical * 100}%
- Grammatical Range and Accuracy (GRA): ${rubric.writing.grammar * 100}%

Return JSON only:
{
  "band_overall": number (1-9),
  "task_achievement": number (1-9),
  "coherence": number (1-9),
  "lexical": number (1-9),
  "grammar": number (1-9),
  "comments": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${taskType} Response:\n\n${text}` }
      ]
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return {
      band_overall: parsed.band_overall || 6.0,
      task_achievement: parsed.task_achievement || parsed.ta || 6.0,
      coherence: parsed.coherence || parsed.cc || 6.0,
      lexical: parsed.lexical || parsed.lr || 6.0,
      grammar: parsed.grammar || parsed.gra || 6.0,
      comments: parsed.comments || 'Writing assessment completed.'
    };
  } catch (err) {
    console.error('[WritingAssessment] Error:', err.message);
    return {
      band_overall: 6.0,
      task_achievement: 6.0,
      coherence: 6.0,
      lexical: 6.0,
      grammar: 6.0,
      comments: 'Assessment error. Please retry.'
    };
  }
}

module.exports = { assessWriting };

