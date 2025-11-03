/**
 * AI Prompt Templates
 * Structured prompts for IELTS Writing and Speaking feedback generation
 */

exports.writingPrompt = (text, level = 'B1', mode = 'academic') => {
  const modeContext = mode === 'academic' 
    ? 'This is IELTS Academic Writing. Expect formal register, academic vocabulary, and structured arguments.'
    : 'This is IELTS General Training Writing. Expect natural, communicative tone suitable for daily contexts.';

  return `
Analyze the following IELTS Writing text and provide detailed feedback in JSON format.

Analyze for:
1. Band breakdown: Grammar, Vocabulary, Coherence, Task Response (0-9 scale)
2. Up to 10 specific errors with corrections

For each error, identify:
- The specific error
- A suggested correction
- A brief, supportive reason
- Error type: "grammar", "vocab", "coherence", or "task"

Text to analyze:
"${text}"

Level: ${level}
Mode: ${mode}
${modeContext}

Return ONLY valid JSON in this exact format:
{
  "bandBreakdown": {
    "Grammar": <number>,
    "Vocabulary": <number>,
    "Coherence": <number>,
    "Task": <number>
  },
  "feedback": [
    {
      "error": "incorrect phrase",
      "suggestion": "better alternative",
      "reason": "supportive explanation",
      "type": "grammar",
      "wordIndex": <optional>,
      "wordIndices": [<optional>]
    }
  ]
}

Feedback tone: ${mode === 'academic' ? 'Emphasize academic precision, formal coherence, and lexical sophistication.' : 'Emphasize clear communication, natural expression, and practical clarity.'}
Use a supportive Cambridge IELTS tutor tone. Focus on actionable improvements.
`;
};

exports.speakingPrompt = (transcript, level = 'B1') => `
Analyze the following IELTS Speaking transcript and provide detailed feedback in JSON format.

Analyze for:
1. Band breakdown: Fluency, Pronunciation, Grammar, Vocabulary (0-9 scale)
2. Up to 10 specific issues with suggestions

For each issue, identify:
- The specific issue or error
- A helpful suggestion
- A brief, encouraging reason
- Issue type: "fluency", "pronunciation", "grammar", or "vocab"

Transcript to analyze:
"${transcript}"

Level: ${level}

Return ONLY valid JSON in this exact format:
{
  "bandBreakdown": {
    "Fluency": <number>,
    "Pronunciation": <number>,
    "Grammar": <number>,
    "Vocabulary": <number>
  },
  "feedback": [
    {
      "error": "area for improvement",
      "suggestion": "better approach",
      "reason": "encouraging explanation",
      "type": "fluency",
      "wordIndex": <optional>,
      "wordIndices": [<optional>]
    }
  ]
}

Use a supportive, encouraging tone. Help the student improve naturally.
`;

