/**
 * Get Cambridge Authentic Blueprint Service
 * Server-side wrapper for accessing authentic Cambridge blueprint
 */

// For server-side, we'll use a simplified version or import from a shared location
// Since blueprints are primarily frontend, we'll create a server-compatible structure

const CAMBRIDGE_AUTHENTIC_BLUEPRINT = {
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
    },
  },

  listening: {
    academic: {
      structure: [
        { section: 1, context: "Everyday Conversation", type: ["Form Completion"], questions: 10 },
        { section: 2, context: "Monologue", type: ["Map/Diagram Labelling"], questions: 10 },
        { section: 3, context: "Academic Discussion", type: ["Multiple Choice"], questions: 10 },
        { section: 4, context: "Lecture", type: ["Note Completion"], questions: 10 },
      ],
      totalQuestions: 40,
      duration: 30,
    },
    general: {
      structure: [
        { section: 1, context: "Everyday Conversation", type: ["Form Completion"], questions: 10 },
        { section: 2, context: "Monologue", type: ["Map/Diagram Labelling"], questions: 10 },
        { section: 3, context: "Conversation", type: ["Multiple Choice"], questions: 10 },
        { section: 4, context: "Monologue", type: ["Note Completion"], questions: 10 },
      ],
      totalQuestions: 40,
      duration: 30,
    },
  },

  writing: {
    academic: {
      tasks: [
        { id: 1, type: "Graph/Chart/Process Description", minWords: 150 },
        { id: 2, type: "Essay – Discussion or Opinion", minWords: 250 },
      ],
      duration: 60,
    },
    general: {
      tasks: [
        { id: 1, type: "Letter (Formal/Semi/Informal)", minWords: 150 },
        { id: 2, type: "Essay – General Topic", minWords: 250 },
      ],
      duration: 60,
    },
  },

  speaking: {
    academic: {
      structure: [
        { part: 1, name: "Introduction & Interview", duration: 4 },
        { part: 2, name: "Cue Card – Long Turn", duration: 3 },
        { part: 3, name: "Discussion", duration: 4 },
      ],
      totalDuration: 14,
    },
    general: {
      structure: [
        { part: 1, name: "Introduction & Interview", duration: 4 },
        { part: 2, name: "Cue Card – Long Turn", duration: 3 },
        { part: 3, name: "Discussion", duration: 4 },
      ],
      totalDuration: 14,
    },
  },
};

/**
 * Get authentic Cambridge blueprint for a skill and mode
 * @param {string} skill - Skill name (reading, listening, writing, speaking)
 * @param {string} mode - Mode (academic, general)
 * @returns {object} Cambridge blueprint structure
 */
function getAuthenticBlueprint(skill, mode = "academic") {
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

  // Listening and Speaking also have mode-specific
  if (skill === "listening" || skill === "speaking") {
    const modeBlueprint = blueprint[mode] || blueprint.academic;
    return {
      ...modeBlueprint,
      skill,
      mode,
      formType: "Cambridge-Authentic"
    };
  }

  return blueprint;
}

module.exports = {
  getAuthenticBlueprint,
  CAMBRIDGE_AUTHENTIC_BLUEPRINT
};
