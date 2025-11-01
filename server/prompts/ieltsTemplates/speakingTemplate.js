/**
 * IELTS Speaking Test Template
 * Official Cambridge IELTS format
 * Time: 11-14 minutes total, 3 parts
 */

const speakingTemplates = {
  A1: {
    structure: {
      parts: 2,
      part1Duration: '4-5 minutes',
      part2Duration: '3-4 minutes',
      totalDuration: '7-9 minutes'
    },
    instruction: `The Speaking test has TWO parts and takes 7-9 minutes.`,
    promptTemplate: `Generate an IELTS Speaking test for BEGINNER level (A1).

PART STRUCTURE:
- Part 1: Introduction and Interview (4-5 minutes)
- Part 2: Long Turn (3-4 minutes) with 1 minute preparation
- Part 3: (SKIPPED for A1)

PART 1 REQUIREMENTS:
- Duration: 4-5 minutes
- Topics: Personal information (name, hometown, family, studies/work, hobbies, daily routine)
- Questions: 8-12 simple questions
- Focus: Basic vocabulary, present tense, simple sentences

TOPIC EXAMPLES:
- Hometown: "Where are you from?" "Do you like your hometown?" "What do you like about it?"
- Family: "Tell me about your family." "Do you live with your family?"
- Work/Study: "Do you work or study?" "What do you do?"
- Hobbies: "What do you do in your free time?" "How often do you do it?"

PART 2 REQUIREMENTS:
- Duration: 3-4 minutes (1 min preparation + 2-3 min speaking)
- Task type: Describe something familiar
- Cue card format
- Focus: Simple description, basic vocabulary

CUE CARD EXAMPLES:
- "Describe your favorite food. You should say: what it is, when you eat it, how it is made, and why you like it."
- "Describe your daily routine. You should say: what time you wake up, what you do in the morning, afternoon, evening, and how you feel about your routine."
- "Describe someone in your family. You should say: who this person is, what they look like, what they do, and why you like them."

OUTPUT FORMAT:
{
  "parts": [
    {
      "id": 1,
      "title": "Part 1: Introduction and Interview",
      "duration": "4-5 minutes",
      "topics": [
        {
          "topic": "Hometown",
          "questions": [
            "Where are you from?",
            "Do you like your hometown?",
            "What's the weather like there?",
            "Would you like to live there in the future?"
          ]
        },
        {
          "topic": "Family",
          "questions": [
            "Tell me about your family.",
            "How many people are in your family?",
            "Do you live with them?"
          ]
        }
      ]
    },
    {
      "id": 2,
      "title": "Part 2: Long Turn",
      "duration": "3-4 minutes (includes 1 min preparation)",
      "task": "Describe your favorite food.",
      "cueCard": "Describe your favorite food. You should say:\n- what it is\n- when you eat it\n- how it is made\n- and why you like it",
      "preparationTime": 1,
      "speakingTime": 2,
      "followUpQuestions": [
        "Do other people in your family like this food?",
        "Do you eat it often?"
      ]
    }
  ],
  "metadata": {
    "level": "A1",
    "bandScore": 3.0-4.0,
    "assessment": {
      "fluency": "Basic communication",
      "lexicalResource": "Simple vocabulary",
      "grammar": "Present tense",
      "pronunciation": "Generally comprehensible"
    }
  }
}`
  },

  A2: {
    structure: {
      parts: 3,
      part1Duration: '4-5 minutes',
      part2Duration: '3-4 minutes',
      part3Duration: '4-5 minutes',
      totalDuration: '11-14 minutes'
    },
    instruction: `The Speaking test has THREE parts and takes 11-14 minutes.`,
    promptTemplate: `Generate an IELTS Speaking test for ELEMENTARY level (A2).

PART STRUCTURE (Official IELTS):
- Part 1: Introduction and Interview (4-5 minutes)
- Part 2: Long Turn (3-4 minutes)
- Part 3: Two-way Discussion (4-5 minutes)

PART 1: Same as A1 but slightly more variety in topics

PART 2: Similar to A1, slightly more complex cue cards

PART 3: Simple discussion questions related to Part 2 topic
- Topic: Development of Part 2 topic at abstract level
- Questions: 4-6 simple discussion questions
- Focus: Give opinions, explain preferences, make comparisons

OUTPUT FORMAT: Same as A1 but add Part 3`
  },

  B1: {
    structure: {
      parts: 3,
      part1Duration: '4-5 minutes',
      part2Duration: '3-4 minutes',
      part3Duration: '4-5 minutes',
      totalDuration: '11-14 minutes'
    },
    instruction: `The Speaking test has THREE parts and takes 11-14 minutes.`,
    promptTemplate: `Generate an IELTS Speaking test for INTERMEDIATE level (B1) - Official IELTS format.

PART STRUCTURE (Official IELTS):
- Part 1: Introduction and Interview (4-5 minutes)
- Part 2: Long Turn (3-4 minutes)
- Part 3: Two-way Discussion (4-5 minutes)
Total: 11-14 minutes

PART 1 REQUIREMENTS:
- Topics: Hometown, work/study, hobbies, travel, food, weather, festivals, technology
- Questions: 10-15 questions across 3-4 topics
- Focus: Comfortable speaking about familiar topics

PART 2 REQUIREMENTS:
- Duration: 3-4 minutes total (1 min prep + 2-3 min speaking)
- Task: Individual long turn with cue card
- Cue card: 3-4 bullet points to cover
- Focus: Organize ideas, speak continuously, use past tenses

CUE CARD SAMPLE:
"Describe a memorable journey you have made.
You should say:
- where you went
- when you went there
- who you went with
- and explain why it was memorable for you."

PART 3 REQUIREMENTS:
- Duration: 4-5 minutes
- Topic: Abstract discussion of Part 2 topic
- Questions: 5-8 questions exploring implications, comparisons, future
- Focus: Express opinions, compare, speculate, discuss abstract ideas

PART 3 SAMPLE QUESTIONS (based on journey topic):
- "Do people travel more nowadays than in the past?"
- "What are the benefits of traveling?"
- "Do you think travel will change in the future?"
- "How does technology affect how we travel?"

OUTPUT FORMAT: Same as above with all 3 parts`
  },

  B2: {
    structure: {
      parts: 3,
      part1Duration: '4-5 minutes',
      part2Duration: '3-4 minutes',
      part3Duration: '4-5 minutes',
      totalDuration: '11-14 minutes'
    },
    instruction: `The Speaking test has THREE parts and takes 11-14 minutes.`,
    promptTemplate: `Generate an IELTS Speaking test for UPPER INTERMEDIATE level (B2) - Official IELTS format.

PART STRUCTURE (Official IELTS):
Same as B1 but with increased complexity

PART 1: Wider range of familiar topics with follow-up questions
PART 2: More abstract topics, requires organization and range of tenses
PART 3: Deeper exploration of abstract issues

INCREASED DIFFICULTY:
- Vocabulary: More precise and varied
- Grammar: Wider range of structures, conditional forms
- Fluency: Natural discourse features
- Pronunciation: Clear with some intonation patterns

SAMPLE B2 TOPICS:
Part 1: Social media, reading habits, public transport, environmental awareness
Part 2: "Describe a significant change in your life", "Describe an achievement you're proud of"
Part 3: Societal trends, education systems, technological impacts, future predictions

OUTPUT FORMAT: Same as B1`
  },

  C1: {
    structure: {
      parts: 3,
      part1Duration: '4-5 minutes',
      part2Duration: '3-4 minutes',
      part3Duration: '4-5 minutes',
      totalDuration: '11-14 minutes'
    },
    instruction: `The Speaking test has THREE parts and takes 11-14 minutes.`,
    promptTemplate: `Generate an IELTS Speaking test for ADVANCED level (C1) - Official IELTS format.

PART STRUCTURE (Official IELTS):
Same as B1 but with advanced complexity

ADVANCED FEATURES:
- Vocabulary: Precise and sophisticated, appropriate register
- Grammar: Complex structures, full range of tenses, appropriate clauses
- Fluency: Natural discourse, minimal hesitation, idiomatic features
- Pronunciation: Clear, natural intonation patterns, stress placement

SAMPLE C1 TOPICS:
Part 1: Cultural differences, personality types, urban vs rural living, media influence
Part 2: "Describe a time you had to make a difficult decision", "Describe a person who has influenced you professionally"
Part 3: Philosophical discussions, ethical considerations, complex societal issues, nuanced perspectives

C1 PART 3 EXAMPLE:
Topic: Education systems
Questions:
- "To what extent should education be standardized across cultures?"
- "How do you see the role of technology reshaping traditional educational paradigms?"
- "What are the implications of international education trends for local cultural values?"

OUTPUT FORMAT: Same as B1`
  },

  C2: {
    structure: {
      parts: 3,
      part1Duration: '4-5 minutes',
      part2Duration: '3-4 minutes',
      part3Duration: '4-5 minutes',
      totalDuration: '11-14 minutes'
    },
    instruction: `The Speaking test has THREE parts and takes 11-14 minutes.`,
    promptTemplate: `Generate an IELTS Speaking test for PROFICIENT level (C2) - Official IELTS format.

PART STRUCTURE (Official IELTS):
Same as B1 but with expert-level proficiency

EXPERT FEATURES:
- Vocabulary: Exceptional range, natural and sophisticated, idiomatic language
- Grammar: Natural, accurate, appropriate to context, subtle nuances
- Fluency: Effortless, natural discourse features, sophisticated connectives
- Pronunciation: Effortlessly intelligible, sophisticated intonation

SAMPLE C2 TOPICS:
Part 1: Philosophical questions, complex preferences, abstract concepts
Part 2: "Describe a complex ethical dilemma you've encountered", "Describe a transformative learning experience"
Part 3: Highly abstract discussions, interdisciplinary perspectives, nuanced cultural debates, theoretical concepts

C2 PART 3 EXAMPLE:
Topic: Artificial intelligence and consciousness
Questions:
- "Does the development of AI challenge our understanding of what constitutes 'intelligence'?"
- "How might the emergence of machine consciousness reshape our ethical frameworks?"
- "In what ways do cross-cultural perspectives on intelligence inform the AI debate?"

CRITICAL: Maintain authentic IELTS Band 8.5-9.0 difficulty.

OUTPUT FORMAT: Same as B1`
  }
};

module.exports = speakingTemplates;
