# AI Flow Overview

## Assessment Flow

### Writing Assessment

1. User submits writing response
2. `aiScoringService.scoreWriting()` called
3. Creates prompt with level-appropriate instructions
4. Calls OpenAI GPT-4o-mini
5. Parses JSON response
6. Applies weights (Task Response, Coherence, Lexical, Grammar)
7. Saves to `AI_Feedback` model
8. Returns structured feedback to frontend

### Speaking Assessment

1. User submits audio transcript
2. `aiScoringService.scoreSpeaking()` called
3. Creates prompt with speaking criteria
4. Calls OpenAI GPT-4o-mini
5. Parses JSON response
6. Applies weights (Fluency, Lexical, Grammar, Pronunciation)
7. Saves to `AI_Feedback` model
8. Returns structured feedback to frontend

## Feedback Generation

### Level-Based Calibration

- **B1/B2**: Simple language, basic examples, encouraging tone
- **C1/C2**: Advanced terminology, sophisticated feedback

### Feedback Structure

```javascript
{
  overall: 7.0,
  taskResponse: 7,
  coherence: 7,
  lexical: 6.5,
  grammar: 7,
  feedback: "Detailed feedback text...",
  strengths: ["Strength 1", "Strength 2"],
  improvements: ["Improvement 1", "Improvement 2"],
  bandLevel: "7.0"
}
```

## Summary Generation

1. Fetch recent feedback from `AI_Feedback`
2. Calculate averages per skill
3. Identify weakest/strongest skills
4. Generate personalized summary message
5. Create recommendations for improvement

## Recommendation Engine

1. Analyze `WeaknessProfile` for user
2. Identify primary weakness
3. Generate action items (3-5 steps)
4. Suggest resources and timeframe
5. Estimate expected improvement

## Error Handling

- Fallback scores if OpenAI unavailable
- Graceful degradation to basic feedback
- Logging for debugging
- User-friendly error messages

