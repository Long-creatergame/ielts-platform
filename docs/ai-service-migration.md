# AI Service Migration Documentation

## Overview

This document tracks the migration from multiple AI services to a unified `aiService.js`.

## Migration Date
2024-12-19

## Services Consolidated

1. **aiScoringService.js** → `processAI('writing', ...)` / `processAI('speaking', ...)`
2. **aiFeedbackService.js** → Still used for database operations, but uses unified service for AI calls
3. **aiSummaryService.js** → Remains separate (aggregates feedback history, not direct AI calls)
4. **recommendationService.js** → Still used for analysis, but can use `processAI('recommendation', ...)` for AI-generated recommendations
5. **aiEngine.js route** → Updated to use unified service for reading generation

## Unified Service Structure

### Entry Point
```javascript
const { processAI, isAvailable } = require('../services/aiService.js');
```

### Supported Types
- `'writing'` - Writing feedback assessment
- `'speaking'` - Speaking feedback assessment  
- `'reading'` - Reading question generation
- `'recommendation'` - Personalized recommendations

### Usage Examples

#### Writing Assessment
```javascript
const result = await processAI('writing', {
  essay: 'User essay text...',
  taskType: 'Task 2',
  level: 'B1',
  options: { weights: { coherence: 0.25, lexical: 0.25, grammar: 0.25, taskResponse: 0.25 } }
});
```

#### Speaking Assessment
```javascript
const result = await processAI('speaking', {
  transcript: 'User speaking transcript...',
  taskType: 'Part 2',
  level: 'B1',
  options: { weights: { fluency: 0.25, lexical: 0.25, grammar: 0.25, pronunciation: 0.25 } }
});
```

#### Reading Generation
```javascript
const result = await processAI('reading', {
  topic: 'Technology',
  level: '6.5',
  band: 6.5
});
```

#### Recommendations
```javascript
const result = await processAI('recommendation', {
  weaknessProfile: { weakestSkill: 'grammar', ... },
  userLevel: 'B1',
  currentBand: 6.0,
  targetBand: 7.0
});
```

## Routes Updated

### `/api/ai/score` (POST)
- **Before**: Used `aiScoringService.scoreWriting()` / `aiScoringService.scoreSpeaking()`
- **After**: Uses `processAI('writing', ...)` / `processAI('speaking', ...)`
- **Status**: ✅ Updated

### `/api/ai-engine/generate` (POST)
- **Before**: Direct OpenAI calls for reading generation
- **After**: Uses `processAI('reading', ...)` for reading skill
- **Status**: ✅ Updated

## Backward Compatibility

- Old service files (`aiScoringService.js`, etc.) are **NOT deleted** yet
- Routes can still fall back to old services if needed
- All response formats remain the same
- Frontend should not require any changes

## Environment Variables

- `OPENAI_API_KEY` - Required for AI functionality
- `OPENAI_API_BASE` - Optional, defaults to `https://api.openai.com/v1`
- `OPENAI_MODEL` - Optional, defaults to `gpt-4o-mini`
- `OPENAI_TEMPERATURE` - Optional, defaults to `0.85`
- `AI_FALLBACK_MODE` - Set to `'true'` to force fallback mode

## Fallback Mode

When `AI_FALLBACK_MODE=true` or `OPENAI_API_KEY` is missing:
- Service returns predefined fallback responses
- No OpenAI API calls are made
- Useful for testing or when API is unavailable

## Logging

All AI responses are logged to `logs/ai_responses.log`:
- Type of request
- Timestamp
- Input summary (first 100 chars)
- Output summary (first 200 chars)

## Next Steps

1. ✅ Create unified service
2. ✅ Update routes to use unified service
3. ✅ Add logging utility
4. ⏳ Test all endpoints
5. ⏳ Monitor for issues
6. ⏳ Remove old service files (after validation period)

## Testing Checklist

- [ ] Writing assessment returns valid JSON
- [ ] Speaking assessment returns valid JSON
- [ ] Reading generation returns passage and questions
- [ ] Recommendations return structured data
- [ ] Fallback mode works when API unavailable
- [ ] Logging works correctly
- [ ] All routes maintain backward compatibility

