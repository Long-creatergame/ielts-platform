/**
 * IELTS Writing Test Template
 * Official Cambridge IELTS format
 * Time: 60 minutes total
 * Task 1: 20 minutes, 150 words minimum
 * Task 2: 40 minutes, 250 words minimum
 */

const writingTemplates = {
  A1: {
    structure: {
      tasks: 1,
      task1TimeLimit: 15,
      task1WordCount: 100,
      totalTimeLimit: 15
    },
    instruction: `You have 15 minutes to complete ONE writing task. Write at least 100 words.`,
    promptTemplate: `Generate an IELTS Writing test for BEGINNER level (A1).

TASK REQUIREMENTS:
- Only Task 1 (no Task 2 for beginners)
- Topic: Personal information, daily activities, familiar topics
- Word count: 100-120 words minimum
- Time: 15 minutes
- Task type: Simple description, letter to friend, describing routine

SAMPLE TOPICS:
- Describe your family
- Write about your favorite hobby
- Describe your daily routine
- Write a letter to a friend
- Describe a place you know well

OUTPUT FORMAT:
{
  "tasks": [
    {
      "id": 1,
      "task": "Write a letter to your friend. Tell them about your new job/school and describe what you do every day.",
      "type": "Task 1 - Personal Letter",
      "wordCount": 100,
      "timeLimit": 15,
      "instructions": "Write at least 100 words. Use simple sentences.",
      "assessment": {
        "taskResponse": "Minimum criteria",
        "coherence": "Basic linking",
        "lexicalResource": "Simple vocabulary",
        "grammar": "Present tense mastery"
      }
    }
  ],
  "metadata": {
    "level": "A1",
    "bandScore": 3.0-4.0
  }
}`
  },

  A2: {
    structure: {
      tasks: 1,
      task1TimeLimit: 20,
      task1WordCount: 120,
      totalTimeLimit: 20
    },
    instruction: `You have 20 minutes to complete ONE writing task. Write at least 120 words.`,
    promptTemplate: `Generate an IELTS Writing test for ELEMENTARY level (A2).

TASK REQUIREMENTS:
- Only Task 1
- Topic: Personal and familiar topics, simple opinions
- Word count: 120-150 words minimum
- Time: 20 minutes
- Task type: Description, simple explanation, basic letter

SAMPLE TOPICS:
- Describe your hometown
- Write about a memorable trip
- Describe your favorite food
- Explain how to make something simple
- Write a thank you letter

OUTPUT FORMAT: Same as A1 but 120-150 words`
  },

  B1: {
    structure: {
      tasks: 2,
      task1TimeLimit: 20,
      task1WordCount: 150,
      task2TimeLimit: 40,
      task2WordCount: 250,
      totalTimeLimit: 60
    },
    instruction: `You have 60 minutes to complete TWO writing tasks. Task 1: 20 minutes (150 words). Task 2: 40 minutes (250 words).`,
    promptTemplate: `Generate an IELTS Writing test for INTERMEDIATE level (B1) - Official IELTS format.

TASK 1 REQUIREMENTS (20 minutes, 150 words):
- Type: Describe, explain, or request information
- Topic: Personal or public interest (graph interpretation, process description, letter)
- Word count: 150 words minimum
- Focus: Clear message, some organization, basic linking words

SAMPLE TASK 1 TOPICS:
- Describe a bar chart showing student attendance
- Write about a process: How coffee is made
- Write a formal letter requesting information
- Describe a map showing changes over time

TASK 2 REQUIREMENTS (40 minutes, 250 words):
- Type: Give opinion, discuss, problem-solution
- Topic: General interest or current affairs
- Word count: 250 words minimum
- Focus: Express opinions, give reasons, some examples

SAMPLE TASK 2 TOPICS:
- "Some people think technology makes life easier. Do you agree?"
- "What are the advantages and disadvantages of social media?"
- "Describe a solution to traffic congestion in cities."
- "Should students wear school uniforms?"

OUTPUT FORMAT:
{
  "tasks": [
    {
      "id": 1,
      "task": "[Task 1 prompt]",
      "type": "Task 1 - Description",
      "wordCount": 150,
      "timeLimit": 20,
      "instructions": "Write at least 150 words..."
    },
    {
      "id": 2,
      "task": "[Task 2 prompt]",
      "type": "Task 2 - Essay",
      "wordCount": 250,
      "timeLimit": 40,
      "instructions": "Write at least 250 words..."
    }
  ],
  "metadata": {
    "level": "B1",
    "bandScore": 5.0-6.0
  }
}`
  },

  B2: {
    structure: {
      tasks: 2,
      task1TimeLimit: 20,
      task1WordCount: 150,
      task2TimeLimit: 40,
      task2WordCount: 250,
      totalTimeLimit: 60
    },
    instruction: `You have 60 minutes to complete TWO writing tasks. Task 1: 20 minutes (150 words). Task 2: 40 minutes (250 words).`,
    promptTemplate: `Generate an IELTS Writing test for UPPER INTERMEDIATE level (B2) - Official IELTS Academic format.

TASK 1 REQUIREMENTS (20 minutes, 150 words):
- Type: Academic writing (chart/graph/table/diagram description)
- Topic: Data interpretation, comparison, process description
- Word count: 150 words minimum
- Focus: Accurate data description, clear comparisons, appropriate vocabulary

SAMPLE TASK 1 TOPICS:
- Bar chart: Internet usage by age group in 2020
- Line graph: Climate change temperature trends
- Table: Employment statistics across countries
- Pie chart: Energy sources distribution
- Process diagram: Recycling process
- Map: City development over 50 years

TASK 2 REQUIREMENTS (40 minutes, 250 words):
- Type: Academic essay (opinion, discussion, problem-solution, advantage-disadvantage)
- Topic: Social issues, education, environment, technology, health
- Word count: 250 words minimum
- Focus: Clear position, well-developed arguments, examples, appropriate style

SAMPLE TASK 2 TOPICS:
- "Governments should invest more in public transportation than in roads. To what extent do you agree?"
- "Discuss both views: Some say automation will replace jobs; others say it creates new opportunities."
- "What are the main causes of climate change and what solutions can governments implement?"
- "Some believe university education should be free; others think students should pay fees. Discuss both views."

DIFFICULTY: Upper intermediate to advanced
CRITERIA: Task achievement, coherence & cohesion, lexical resource, grammatical range & accuracy

OUTPUT FORMAT: Same as B1`
  },

  C1: {
    structure: {
      tasks: 2,
      task1TimeLimit: 20,
      task1WordCount: 150,
      task2TimeLimit: 40,
      task2WordCount: 250,
      totalTimeLimit: 60
    },
    instruction: `You have 60 minutes to complete TWO writing tasks. Task 1: 20 minutes (150 words). Task 2: 40 minutes (250 words).`,
    promptTemplate: `Generate an IELTS Writing test for ADVANCED level (C1) - Official IELTS Academic format.

TASK 1 REQUIREMENTS (20 minutes, 150 words):
- Type: Complex academic data description
- Topic: Multiple data sources, sophisticated comparisons, nuanced trends
- Word count: 150 words minimum (150-180 optimal)
- Focus: Precise data, subtle comparisons, sophisticated vocabulary, varied structures

SAMPLE TASK 1 TOPICS:
- Multiple charts: Energy consumption trends + renewable energy growth
- Complex table: Economic indicators across multiple countries over 20 years
- Process: Advanced technological or biological process
- Maps: Urban planning changes with multiple details

TASK 2 REQUIREMENTS (40 minutes, 250 words):
- Type: Complex academic argument
- Topic: Abstract concepts, ethical debates, philosophical questions, controversial issues
- Word count: 250 words minimum (250-280 optimal)
- Focus: Sophisticated arguments, nuanced perspectives, academic vocabulary, complex structures

SAMPLE TASK 2 TOPICS:
- "Artificial intelligence raises ethical concerns about human autonomy. Discuss the implications."
- "The concept of universal basic income challenges traditional economic models. Evaluate both perspectives."
- "Cultural appropriation in the arts: Where should the line be drawn between appreciation and exploitation?"
- "Genetic engineering holds promise for curing diseases but raises questions about playing God. What is your view?"

DIFFICULTY: Advanced to proficient
CRITERIA: Sophisticated task response, excellent coherence, wide lexical range, grammatical accuracy

OUTPUT FORMAT: Same as B1`
  },

  C2: {
    structure: {
      tasks: 2,
      task1TimeLimit: 20,
      task1WordCount: 150,
      task2TimeLimit: 40,
      task2WordCount: 250,
      totalTimeLimit: 60
    },
    instruction: `You have 60 minutes to complete TWO writing tasks. Task 1: 20 minutes (150 words). Task 2: 40 minutes (250 words).`,
    promptTemplate: `Generate an IELTS Writing test for PROFICIENT level (C2) - Official IELTS Academic format.

TASK 1 REQUIREMENTS (20 minutes, 150 words):
- Type: Highly complex academic data interpretation
- Topic: Multiple interconnected data sources, sophisticated analysis
- Word count: 150 words minimum (160-180 optimal for complexity)
- Focus: Expert-level precision, nuanced analysis, sophisticated vocabulary, varied structures

SAMPLE TASK 1 TOPICS:
- Multiple complex charts: Interrelated economic, social, environmental data over decades
- Complex process: Multi-stage technical or scientific process with exceptions
- Maps: Significant urban transformation with multiple factors
- Diagrams: Advanced scientific or architectural concepts

TASK 2 REQUIREMENTS (40 minutes, 250 words):
- Type: Highly sophisticated academic argument
- Topic: Abstract philosophical questions, interdisciplinary issues, cutting-edge debates
- Word count: 250 words minimum (280-320 optimal for complexity)
- Focus: Expert-level argumentation, subtle nuances, exceptional vocabulary range, natural sophisticated structures

SAMPLE TASK 2 TOPICS:
- "The post-truth era challenges fundamental assumptions about knowledge and reality. Explore this philosophical crisis."
- "Interdisciplinary approaches in science blur traditional boundaries. Evaluate the epistemological implications."
- "The tension between cultural preservation and globalization reveals deeper questions about identity. What is your analysis?"
- "Existential challenges posed by emerging technologies require rethinking of human nature itself. Discuss."

DIFFICULTY: Proficient/expert level
CRITERIA: Exceptional task response, nuanced coherence, exceptional lexical resource, natural accuracy

CRITICAL: Maintain authentic IELTS Band 8.5-9.0 difficulty.

OUTPUT FORMAT: Same as B1`
  }
};

module.exports = writingTemplates;
