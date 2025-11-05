# Recommendation Template

## Prompt Structure

Generate personalized learning recommendations based on user's WeaknessProfile.

**User Level:** {{level}}
**Weakest Skill:** {{weakestSkill}}
**Current Band:** {{currentBand}}
**Target Band:** {{targetBand}}

## Recommendation Structure

1. **Focus Area**: Specific skill to improve
2. **Action Items**: 3-5 concrete steps
3. **Timeframe**: Expected duration
4. **Resources**: Suggested materials
5. **Expected Improvement**: Band score improvement estimate

## Response Format

```json
{
  "focusArea": "Writing Task 2 Structure",
  "actions": [
    "Practice writing 3 essays per week with proper introduction-body-conclusion structure",
    "Study model essays and analyze their paragraph organization",
    "Focus on using linking words appropriately"
  ],
  "timeframe": "3 weeks",
  "resources": ["Essay Templates", "Linking Words Guide"],
  "expectedImprovement": "0.5-1.0 band",
  "difficulty": "intermediate"
}
```

