/**
 * Cambridge Authentic Blueprint
 * Official Cambridge IELTS Test Structure
 * No CEFR level splitting - only Academic vs General Training modes
 */

export const CAMBRIDGE_AUTHENTIC_BLUEPRINT = {
  reading: {
    academic: {
      structure: [
        { section: 1, type: ["Matching Headings", "True/False/Not Given"], questions: 13 },
        { section: 2, type: ["Sentence Completion", "Summary Completion"], questions: 13 },
        { section: 3, type: ["Multiple Choice", "Matching Information"], questions: 14 },
      ],
      totalQuestions: 40,
      duration: 60,
      passages: 3,
      description: "Academic texts from books, journals, magazines, and newspapers"
    },
    general: {
      structure: [
        { section: 1, type: ["Matching Information", "Sentence Completion"], questions: 14 },
        { section: 2, type: ["Note/Table Completion", "Short Answer"], questions: 13 },
        { section: 3, type: ["Matching Headings", "Multiple Choice"], questions: 13 },
      ],
      totalQuestions: 40,
      duration: 60,
      passages: 3,
      description: "Everyday texts from advertisements, notices, leaflets, and newspapers"
    },
  },

  listening: {
    academic: {
      structure: [
        { section: 1, context: "Everyday Conversation", type: ["Form Completion"], questions: 10, difficulty: "easy" },
        { section: 2, context: "Monologue", type: ["Map/Diagram Labelling", "Multiple Choice"], questions: 10, difficulty: "easy-medium" },
        { section: 3, context: "Academic Discussion", type: ["Multiple Choice", "Matching"], questions: 10, difficulty: "medium-hard" },
        { section: 4, context: "Lecture", type: ["Note Completion", "Sentence Completion"], questions: 10, difficulty: "hard" },
      ],
      totalQuestions: 40,
      duration: 30,
      transferTime: 10,
      description: "Academic listening scenarios"
    },
    general: {
      structure: [
        { section: 1, context: "Everyday Conversation", type: ["Form Completion"], questions: 10, difficulty: "easy" },
        { section: 2, context: "Monologue", type: ["Map/Diagram Labelling", "Multiple Choice"], questions: 10, difficulty: "easy-medium" },
        { section: 3, context: "Conversation", type: ["Multiple Choice", "Matching"], questions: 10, difficulty: "medium-hard" },
        { section: 4, context: "Monologue", type: ["Note Completion", "Sentence Completion"], questions: 10, difficulty: "hard" },
      ],
      totalQuestions: 40,
      duration: 30,
      transferTime: 10,
      description: "General training listening scenarios"
    },
  },

  writing: {
    academic: {
      tasks: [
        { 
          id: 1, 
          type: "Graph/Chart/Process Description", 
          minWords: 150,
          duration: 20,
          description: "Describe, summarize, or explain visual information"
        },
        { 
          id: 2, 
          type: "Essay – Discussion or Opinion", 
          minWords: 250,
          duration: 40,
          description: "Present a solution, argument, or opinion"
        },
      ],
      duration: 60,
      description: "Academic writing tasks"
    },
    general: {
      tasks: [
        { 
          id: 1, 
          type: "Letter (Formal/Semi/Informal)", 
          minWords: 150,
          duration: 20,
          description: "Write a letter in response to a situation"
        },
        { 
          id: 2, 
          type: "Essay – General Topic", 
          minWords: 250,
          duration: 40,
          description: "Present an argument, problem, or point of view"
        },
      ],
      duration: 60,
      description: "General training writing tasks"
    },
  },

  speaking: {
    academic: {
      structure: [
        { 
          part: 1, 
          name: "Introduction & Interview", 
          duration: 4,
          topics: ["Work", "Study", "Hometown", "Hobbies"],
          description: "General questions about yourself"
        },
        { 
          part: 2, 
          name: "Cue Card – Long Turn", 
          duration: 3,
          preparationTime: 1,
          description: "Speak for 1-2 minutes on a given topic"
        },
        { 
          part: 3, 
          name: "Discussion", 
          duration: 4,
          description: "Two-way discussion related to Part 2"
        },
      ],
      totalDuration: 14,
      description: "Academic speaking test"
    },
    general: {
      structure: [
        { 
          part: 1, 
          name: "Introduction & Interview", 
          duration: 4,
          topics: ["Work", "Study", "Hometown", "Hobbies"],
          description: "General questions about yourself"
        },
        { 
          part: 2, 
          name: "Cue Card – Long Turn", 
          duration: 3,
          preparationTime: 1,
          description: "Speak for 1-2 minutes on a given topic"
        },
        { 
          part: 3, 
          name: "Discussion", 
          duration: 4,
          description: "Two-way discussion related to Part 2"
        },
      ],
      totalDuration: 14,
      description: "General training speaking test"
    },
  },
};

/**
 * Get authentic Cambridge blueprint for a skill and mode
 * @param {string} skill - Skill name (reading, listening, writing, speaking)
 * @param {string} mode - Mode (academic, general)
 * @returns {object} Cambridge blueprint structure
 */
export function getAuthenticBlueprint(skill, mode = "academic") {
  const blueprint = CAMBRIDGE_AUTHENTIC_BLUEPRINT[skill];
  
  if (!blueprint) {
    throw new Error(`Invalid skill: ${skill}. Must be reading, listening, writing, or speaking.`);
  }

  // Reading and Writing have mode-specific blueprints
  if (skill === "reading" || skill === "writing") {
    const modeBlueprint = blueprint[mode];
    if (!modeBlueprint) {
      throw new Error(`Invalid mode: ${mode} for skill ${skill}. Must be academic or general.`);
    }
    return {
      ...modeBlueprint,
      skill,
      mode,
      formType: "Cambridge-Authentic"
    };
  }

  // Listening and Speaking also have mode-specific (but same structure, just different content)
  if (skill === "listening" || skill === "speaking") {
    const modeBlueprint = blueprint[mode] || blueprint.academic; // Fallback to academic if mode not found
    return {
      ...modeBlueprint,
      skill,
      mode,
      formType: "Cambridge-Authentic"
    };
  }

  return blueprint;
}

/**
 * Get all available modes for a skill
 * @param {string} skill - Skill name
 * @returns {Array} Available modes
 */
export function getAvailableModes(skill) {
  const blueprint = CAMBRIDGE_AUTHENTIC_BLUEPRINT[skill];
  if (!blueprint) return [];
  
  return Object.keys(blueprint);
}

/**
 * Validate blueprint structure
 * @param {object} blueprint - Blueprint to validate
 * @returns {boolean} True if valid
 */
export function isValidBlueprint(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') return false;
  if (!blueprint.skill || !blueprint.formType) return false;
  if (blueprint.formType !== "Cambridge-Authentic") return false;
  return true;
}

export default CAMBRIDGE_AUTHENTIC_BLUEPRINT;
