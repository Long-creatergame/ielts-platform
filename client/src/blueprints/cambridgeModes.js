/**
 * Cambridge IELTS Mode Definitions
 * Academic vs General Training configurations
 */

export const CAMBRIDGE_MODES = {
  academic: {
    label: "Cambridge Academic",
    shortLabel: "Academic",
    description: "IELTS Academic format for university and professional entry.",
    color: "#1E3A8A",
    icon: "🎓",
    reading: {
      passages: 3,
      totalQuestions: 40,
      questionTypes: [
        "Matching Headings",
        "True/False/Not Given",
        "Summary Completion",
        "Multiple Choice",
        "Matching Information",
        "Matching Paragraph",
        "Table/Flowchart Completion",
        "Sentence Completion"
      ],
      description: "Academic texts from books, journals, and articles"
    },
    listening: {
      sections: 4,
      totalQuestions: 40,
      types: [
        "Form Completion",
        "Multiple Choice",
        "Note Completion",
        "Matching",
        "Map/Plan/Diagram Labelling",
        "Sentence/Summary Completion",
        "Flowchart Completion"
      ],
      description: "Academic contexts: lectures, seminars, discussions"
    },
    writing: {
      tasks: [
        { 
          id: 1, 
          type: "Graph/Chart/Diagram Description", 
          minWords: 150,
          description: "Describe, summarize, or explain visual information"
        },
        { 
          id: 2, 
          type: "Argument/Discussion Essay", 
          minWords: 250,
          description: "Respond to an argument or discuss a point of view"
        }
      ],
      description: "Academic writing with formal register"
    },
    speaking: {
      parts: 3,
      totalQuestions: null,
      description: "Academic-style discussion with formal topics"
    }
  },
  general: {
    label: "Cambridge General Training",
    shortLabel: "General",
    description: "IELTS General Training format for work and migration purposes.",
    color: "#0E7490",
    icon: "🌍",
    reading: {
      passages: 3,
      totalQuestions: 40,
      questionTypes: [
        "Matching Headings",
        "Multiple Choice",
        "Sentence Completion",
        "Note/Table Completion",
        "Matching Information",
        "Short Answer Questions",
        "True/False/Not Given"
      ],
      description: "Everyday texts from advertisements, notices, and articles"
    },
    listening: {
      sections: 4,
      totalQuestions: 40,
      types: [
        "Form Completion",
        "Multiple Choice",
        "Note Completion",
        "Matching",
        "Sentence Completion",
        "Short Answer Questions"
      ],
      description: "Everyday social contexts: conversations, interactions"
    },
    writing: {
      tasks: [
        { 
          id: 1, 
          type: "Letter Writing (Formal/Semi-formal/Informal)", 
          minWords: 150,
          description: "Write a letter in response to a given situation"
        },
        { 
          id: 2, 
          type: "Essay: General Topic", 
          minWords: 250,
          description: "Respond to a point of view, argument, or problem"
        }
      ],
      description: "Practical writing with natural communication"
    },
    speaking: {
      parts: 3,
      totalQuestions: null,
      description: "General conversation on familiar topics"
    }
  }
};

/**
 * Get Cambridge mode configuration
 */
export function getCambridgeMode(mode = 'academic') {
  const config = CAMBRIDGE_MODES[mode];
  if (!config) {
    console.warn(`[Cambridge Mode] Invalid mode: ${mode}, using academic`);
    return CAMBRIDGE_MODES.academic;
  }
  return config;
}

/**
 * Get all available modes
 */
export function getAllModes() {
  return Object.keys(CAMBRIDGE_MODES).map(key => ({
    value: key,
    ...CAMBRIDGE_MODES[key]
  }));
}

/**
 * Get mode-specific form configuration for a skill
 */
export function getModeForm(skill, mode = 'academic') {
  const modeConfig = getCambridgeMode(mode);
  return modeConfig[skill] || null;
}

/**
 * Get mode-specific writing tasks
 */
export function getWritingTasks(mode = 'academic') {
  const modeConfig = getCambridgeMode(mode);
  return modeConfig.writing.tasks;
}

/**
 * Validate mode selection
 */
export function isValidMode(mode) {
  return Object.keys(CAMBRIDGE_MODES).includes(mode);
}

