/**
 * IELTS Reading Test Template
 * Official Cambridge IELTS format
 * Time: 60 minutes, 40 questions, 3 passages
 */

const readingTemplates = {
  A1: {
    structure: {
      passages: 1,
      questionsPerPassage: 13,
      totalQuestions: 13,
      timeLimit: 20,
      wordCount: 800,
      questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer']
    },
    instruction: `You will read ONE passage with 13 questions. Answer all questions based on the passage.`,
    promptTemplate: `Generate an IELTS Reading test for BEGINNER level (A1).

PASSAGE REQUIREMENTS:
- Length: ~800 words
- Topic: Daily life, family, food, hobbies, weather
- Vocabulary: 1000-1500 most common words
- Sentence structure: Simple sentences, present tense

QUESTION TYPES:
- 5 Multiple choice questions
- 4 True/False/Not Given questions
- 2 Fill-in-the-blank questions
- 2 Short answer questions
Total: 13 questions

OUTPUT FORMAT:
{
  "passage": "Full passage text here...",
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ],
  "metadata": {
    "wordCount": 800,
    "readingTime": 8
  }
}`,
    difficultyKeywords: ['basic', 'simple', 'beginner', 'everyday', 'familiar topics']
  },

  A2: {
    structure: {
      passages: 2,
      questionsPerPassage: 13,
      totalQuestions: 26,
      timeLimit: 30,
      wordCount: 1200,
      questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'short_answer']
    },
    instruction: `You will read TWO passages with 26 questions total. Answer all questions based on the passages.`,
    promptTemplate: `Generate an IELTS Reading test for ELEMENTARY level (A2).

PASSAGE REQUIREMENTS:
- Length: ~600 words per passage (1200 total)
- Topic: Work, travel, shopping, entertainment, health
- Vocabulary: 1500-2500 common words
- Sentence structure: Simple and compound sentences, past/present/future tense

QUESTION TYPES PER PASSAGE:
- 3 Multiple choice questions
- 3 True/False/Not Given questions
- 3 Fill-in-the-blank questions
- 2 Matching questions
- 2 Short answer questions
Total: 13 questions per passage × 2 = 26 questions

OUTPUT FORMAT:
{
  "passage": "Combined passage text here...",
  "questions": [26 questions total]
}`
  },

  B1: {
    structure: {
      passages: 3,
      questionsPerPassage: [13, 13, 14],
      totalQuestions: 40,
      timeLimit: 40,
      wordCount: 1800,
      questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'heading', 'summary']
    },
    instruction: `You will read THREE passages with 40 questions total. Answer all questions based on the passages.`,
    promptTemplate: `Generate an IELTS Reading test for INTERMEDIATE level (B1).

PASSAGE REQUIREMENTS:
- Length: ~600 words per passage (1800 total)
- Topic: Education, environment, technology, culture, society
- Vocabulary: 2500-4000 words
- Sentence structure: Complex sentences, multiple tenses

QUESTION DISTRIBUTION:
Passage 1: 13 questions (5 MCQ, 4 T/F/NG, 2 fill, 2 matching)
Passage 2: 13 questions (4 MCQ, 3 T/F/NG, 2 heading, 2 fill, 2 matching)
Passage 3: 14 questions (5 MCQ, 4 T/F/NG, 2 summary, 3 matching)
Total: 40 questions

OUTPUT FORMAT: Same as above`
  },

  B2: {
    structure: {
      passages: 3,
      questionsPerPassage: [13, 13, 14],
      totalQuestions: 40,
      timeLimit: 60,
      wordCount: 2200,
      questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'heading', 'summary', 'sentence_completion']
    },
    instruction: `You will read THREE passages with 40 questions total. Answer all questions based on the passages.`,
    promptTemplate: `Generate an IELTS Reading test for UPPER INTERMEDIATE level (B2) - Official IELTS format.

PASSAGE REQUIREMENTS:
- Length: ~700 words per passage (2200 total)
- Topic: Academic subjects (science, history, psychology, business, arts)
- Vocabulary: 4000-6000 words, academic language
- Sentence structure: Complex academic sentences, passive voice

QUESTION DISTRIBUTION:
Passage 1: 13 questions (4 MCQ, 3 T/F/NG, 3 heading, 3 sentence completion)
Passage 2: 13 questions (3 MCQ, 4 T/F/NG, 2 matching, 2 summary, 2 fill)
Passage 3: 14 questions (4 MCQ, 4 T/F/NG, 2 heading, 2 summary, 2 matching)
Total: 40 questions

OUTPUT FORMAT: Same as above`
  },

  C1: {
    structure: {
      passages: 3,
      questionsPerPassage: [13, 13, 14],
      totalQuestions: 40,
      timeLimit: 60,
      wordCount: 2600,
      questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'heading', 'summary', 'sentence_completion', 'multiple_matching']
    },
    instruction: `You will read THREE complex academic passages with 40 questions total. Answer all questions based on the passages.`,
    promptTemplate: `Generate an IELTS Reading test for ADVANCED level (C1) - Official IELTS Academic format.

PASSAGE REQUIREMENTS:
- Length: ~850 words per passage (2600 total)
- Topic: Academic research, complex subjects (medicine, engineering, philosophy, law, economics)
- Vocabulary: 6000-8000 words, sophisticated academic language
- Sentence structure: Complex structures, idiomatic expressions

QUESTION DISTRIBUTION:
Passage 1: 13 questions (4 MCQ, 3 T/F/NG, 2 heading, 2 matching, 2 fill)
Passage 2: 13 questions (3 MCQ, 4 T/F/NG, 2 matching, 2 multiple matching, 2 summary)
Passage 3: 14 questions (4 MCQ, 4 T/F/NG, 2 heading, 2 summary, 2 matching)
Total: 40 questions

OUTPUT FORMAT: Same as above`
  },

  C2: {
    structure: {
      passages: 3,
      questionsPerPassage: [13, 13, 14],
      totalQuestions: 40,
      timeLimit: 60,
      wordCount: 3000,
      questionTypes: ['multiple_choice', 'true_false', 'fill_blank', 'matching', 'heading', 'summary', 'sentence_completion', 'multiple_matching', 'list_selection']
    },
    instruction: `You will read THREE highly complex academic passages with 40 questions total. Answer all questions based on the passages.`,
    promptTemplate: `Generate an IELTS Reading test for PROFICIENT level (C2) - Official IELTS Academic format.

PASSAGE REQUIREMENTS:
- Length: ~1000 words per passage (3000 total)
- Topic: Specialized academic research, interdisciplinary studies, theoretical concepts
- Vocabulary: 8000+ words, highly sophisticated academic language, technical terminology
- Sentence structure: Extremely complex structures, subtle nuances, abstract concepts

QUESTION DISTRIBUTION:
Passage 1: 13 questions (4 MCQ, 3 T/F/NG, 2 heading, 2 matching, 2 fill)
Passage 2: 13 questions (3 MCQ, 4 T/F/NG, 2 matching, 2 multiple matching, 2 summary)
Passage 3: 14 questions (4 MCQ, 4 T/F/NG, 2 heading, 2 summary, 2 matching)
Total: 40 questions

CRITICAL: Maintain authentic IELTS difficulty for Band 8.5+ candidates.

OUTPUT FORMAT: Same as above`
  }
};

module.exports = readingTemplates;
