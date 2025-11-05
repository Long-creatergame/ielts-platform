# Reading Generator Template

## Prompt Structure

Generate an IELTS Academic Reading passage and questions.

**Level:** {{level}} (Band 5.0-9.0)
**Topic:** {{topic}} (optional)

## Requirements

1. **Passage** (700-900 words):
   - Academic style
   - 3 paragraphs
   - Appropriate difficulty for target band

2. **Questions** (13-14 questions):
   - True/False/Not Given (5-6)
   - Multiple Choice (4-5)
   - Matching Headings (4-5)
   - Fill in the Blanks (optional)

3. **Answer Key** with explanations

## Response Format

```json
{
  "passage": "...",
  "questions": [
    {
      "type": "true_false_not_given",
      "question": "...",
      "answer": "True",
      "explanation": "..."
    }
  ],
  "timeLimit": 60,
  "difficulty": "6.5"
}
```

