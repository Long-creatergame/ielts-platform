/**
 * IELTS Listening Test Template
 * Official Cambridge IELTS format
 * Time: 30 minutes + 10 minutes transfer, 40 questions, 4 sections
 */

const listeningTemplates = {
  A1: {
    structure: {
      sections: 2,
      questionsPerSection: 10,
      totalQuestions: 20,
      timeLimit: 15,
      audioLength: '8-10 minutes'
    },
    instruction: `You will hear TWO recordings. Listen carefully and answer 20 questions. Each recording will be played once.`,
    promptTemplate: `Generate an IELTS Listening test for BEGINNER level (A1).

SECTION STRUCTURE:
- Section 1: Conversation (everyday context) - 10 questions
- Section 2: Monologue (information) - 10 questions
Total: 20 questions

SECTION 1 REQUIREMENTS:
- Context: Phone conversation, booking appointment, ordering food, asking directions
- Speakers: 2 people
- Topic: Daily life, simple transactions
- Question types: 5 fill-blank, 3 multiple choice, 2 true/false

SECTION 2 REQUIREMENTS:
- Context: Information talk, announcement, introduction
- Speaker: 1 person (clear, slow pace)
- Topic: Public information, basic instructions
- Question types: 4 fill-blank, 4 multiple choice, 2 matching

OUTPUT FORMAT:
{
  "sections": [
    {
      "id": 1,
      "title": "Section 1: [Topic]",
      "audioUrl": "audio_url_placeholder",
      "questions": [10 questions],
      "transcript": "Full conversation transcript"
    },
    {
      "id": 2,
      "title": "Section 2: [Topic]",
      "audioUrl": "audio_url_placeholder",
      "questions": [10 questions],
      "transcript": "Full monologue transcript"
    }
  ],
  "metadata": {
    "totalAudioLength": "8-10 minutes",
    "speakerAccent": "British English (clear and slow)"
  }
}`
  },

  A2: {
    structure: {
      sections: 3,
      questionsPerSection: [10, 10, 10],
      totalQuestions: 30,
      timeLimit: 20,
      audioLength: '12-15 minutes'
    },
    instruction: `You will hear THREE recordings. Listen carefully and answer 30 questions. Each recording will be played once.`,
    promptTemplate: `Generate an IELTS Listening test for ELEMENTARY level (A2).

SECTION STRUCTURE:
- Section 1: Social conversation - 10 questions
- Section 2: Information talk - 10 questions
- Section 3: Brief discussion - 10 questions
Total: 30 questions

SECTION 1: Social conversation (booking, request, inquiry)
SECTION 2: Public information (guided tour, event, service)
SECTION 3: Academic discussion (simple topic with 2 speakers)

Question types: Fill-blank, multiple choice, matching, true/false`

  },

  B1: {
    structure: {
      sections: 4,
      questionsPerSection: [10, 10, 10, 10],
      totalQuestions: 40,
      timeLimit: 30,
      audioLength: '28-30 minutes',
      transferTime: 10
    },
    instruction: `You will hear FOUR recordings. Listen carefully and answer 40 questions. Each recording will be played once. You have 30 minutes to listen plus 10 minutes to transfer your answers.`,
    promptTemplate: `Generate an IELTS Listening test for INTERMEDIATE level (B1) - Official format.

SECTION STRUCTURE:
- Section 1: Social conversation (everyday context) - 10 questions
- Section 2: Monologue (social context) - 10 questions
- Section 3: Educational/training conversation (2-4 speakers) - 10 questions
- Section 4: Academic lecture (monologue) - 10 questions
Total: 40 questions

SECTION 1: Daily social context (booking, inquiry, complaint)
- Topic: Hotel booking, course enrollment, library membership
- Speakers: 2 people
- Question types: 5 fill-blank, 3 multiple choice, 2 matching

SECTION 2: Social context monologue
- Topic: Tour guide, event organizer, museum guide
- Speaker: 1 person
- Question types: 4 fill-blank, 3 multiple choice, 3 matching/selection

SECTION 3: Educational context
- Topic: Course discussion, assignment briefing, project planning
- Speakers: 2-4 people
- Question types: 3 fill-blank, 4 multiple choice, 3 matching

SECTION 4: Academic lecture
- Topic: General interest lecture (history, science, culture)
- Speaker: 1 academic speaker
- Question types: 4 fill-blank, 4 multiple choice, 2 summary completion

OUTPUT FORMAT:
{
  "sections": [
    {
      "id": 1,
      "title": "Section 1",
      "description": "Social conversation about...",
      "audioUrl": "audio_url",
      "questions": [10 questions with correct answers],
      "transcript": "Full transcript"
    }
    // ... sections 2, 3, 4
  ],
  "instructions": "You will hear a recording...",
  "totalAudioLength": "28-30 minutes"
}`
  },

  B2: {
    structure: {
      sections: 4,
      questionsPerSection: [10, 10, 10, 10],
      totalQuestions: 40,
      timeLimit: 30,
      audioLength: '28-30 minutes',
      transferTime: 10
    },
    instruction: `You will hear FOUR recordings. Listen carefully and answer 40 questions. Each recording will be played once. You have 30 minutes to listen plus 10 minutes to transfer your answers.`,
    promptTemplate: `Generate an IELTS Listening test for UPPER INTERMEDIATE level (B2) - Official IELTS format.

SECTION STRUCTURE (Official IELTS):
- Section 1: Social conversation (everyday context) - 10 questions
- Section 2: Monologue (social context) - 10 questions
- Section 3: Educational/training conversation - 10 questions
- Section 4: Academic lecture - 10 questions
Total: 40 questions

DIFFICULTY: Intermediate to upper intermediate
ACCENTS: Mix of British and Australian accents
PACE: Natural speaking speed

Detailed structure follows B1 but with more complex:
- Vocabulary: 4000-6000 words
- Sentence structures: More complex
- Topics: More abstract concepts
- Distractors: More challenging
`
  },

  C1: {
    structure: {
      sections: 4,
      questionsPerSection: [10, 10, 10, 10],
      totalQuestions: 40,
      timeLimit: 30,
      audioLength: '28-30 minutes',
      transferTime: 10
    },
    instruction: `You will hear FOUR recordings. Listen carefully and answer 40 questions. Each recording will be played once. You have 30 minutes to listen plus 10 minutes to transfer your answers.`,
    promptTemplate: `Generate an IELTS Listening test for ADVANCED level (C1) - Official IELTS Academic format.

SECTION STRUCTURE (Official IELTS):
- Section 1: Social conversation - 10 questions
- Section 2: Monologue - 10 questions  
- Section 3: Academic discussion - 10 questions
- Section 4: Academic lecture - 10 questions
Total: 40 questions

DIFFICULTY: Advanced level
ACCENTS: Mix of British, Australian, American, Canadian
PACE: Natural academic speaking speed

COMPLEXITY:
- Vocabulary: 6000-8000 words
- Academic language and terminology
- Abstract and theoretical concepts
- Multiple speakers with different perspectives
- Complex sentence structures
- Subtle distractors
`
  },

  C2: {
    structure: {
      sections: 4,
      questionsPerSection: [10, 10, 10, 10],
      totalQuestions: 40,
      timeLimit: 30,
      audioLength: '28-30 minutes',
      transferTime: 10
    },
    instruction: `You will hear FOUR recordings. Listen carefully and answer 40 questions. Each recording will be played once. You have 30 minutes to listen plus 10 minutes to transfer your answers.`,
    promptTemplate: `Generate an IELTS Listening test for PROFICIENT level (C2) - Official IELTS Academic format.

SECTION STRUCTURE (Official IELTS):
- Section 1: Social conversation - 10 questions
- Section 2: Monologue - 10 questions
- Section 3: Academic discussion - 10 questions  
- Section 4: Academic lecture - 10 questions
Total: 40 questions

DIFFICULTY: Proficient/expert level
ACCENTS: Full range of international accents (British, Australian, American, Canadian, Irish, New Zealand)
PACE: Fast natural academic speaking speed

COMPLEXITY:
- Vocabulary: 8000+ words
- Highly sophisticated academic language
- Specialized terminology
- Complex theoretical discussions
- Multiple overlapping perspectives
- Nuanced arguments
- Subtle and sophisticated distractors

CRITICAL: Maintain authentic difficulty for Band 8.5-9.0 candidates.
`
  }
};

module.exports = listeningTemplates;
