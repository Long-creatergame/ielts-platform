/**
 * Cambridge IELTS Form Structures
 * Official Cambridge format definitions by CEFR level
 */

export const CAMBRIDGE_FORMS = {
  reading: {
    A1: [
      { section: 1, type: "Matching Information", questions: 10 },
      { section: 2, type: "True/False/Not Given", questions: 10 },
      { section: 3, type: "Sentence Completion", questions: 5 }
    ],
    A2: [
      { section: 1, type: "Matching Headings", questions: 10 },
      { section: 2, type: "Summary Completion", questions: 10 },
      { section: 3, type: "Multiple Choice", questions: 10 }
    ],
    B1: [
      { section: 1, type: "Matching Features", questions: 13 },
      { section: 2, type: "Summary Completion", questions: 13 },
      { section: 3, type: "Yes/No/Not Given", questions: 14 }
    ],
    B2: [
      { section: 1, type: "Multiple Choice", questions: 13 },
      { section: 2, type: "Matching Headings", questions: 14 },
      { section: 3, type: "Table Completion", questions: 13 }
    ],
    C1: [
      { section: 1, type: "Matching Paragraph", questions: 13 },
      { section: 2, type: "Summary Completion", questions: 13 },
      { section: 3, type: "Multiple Choice", questions: 14 }
    ],
    C2: [
      { section: 1, type: "Matching Information", questions: 13 },
      { section: 2, type: "Yes/No/Not Given", questions: 13 },
      { section: 3, type: "Table Completion", questions: 14 }
    ]
  },

  listening: {
    A1: [
      { section: 1, type: "Form Completion", questions: 10 },
      { section: 2, type: "Multiple Choice", questions: 10 }
    ],
    A2: [
      { section: 1, type: "Note Completion", questions: 10 },
      { section: 2, type: "Matching", questions: 10 }
    ],
    B1: [
      { section: 1, type: "Form Completion", questions: 10 },
      { section: 2, type: "Multiple Choice", questions: 10 },
      { section: 3, type: "Map Labelling", questions: 10 },
      { section: 4, type: "Sentence Completion", questions: 10 }
    ],
    B2: [
      { section: 1, type: "Note Completion", questions: 10 },
      { section: 2, type: "Multiple Choice", questions: 10 },
      { section: 3, type: "Matching", questions: 10 },
      { section: 4, type: "Flowchart Completion", questions: 10 }
    ],
    C1: [
      { section: 1, type: "Form Completion", questions: 10 },
      { section: 2, type: "Matching", questions: 10 },
      { section: 3, type: "Note Completion", questions: 10 },
      { section: 4, type: "Multiple Choice", questions: 10 }
    ],
    C2: [
      { section: 1, type: "Matching", questions: 10 },
      { section: 2, type: "Flowchart Completion", questions: 10 },
      { section: 3, type: "Note Completion", questions: 10 },
      { section: 4, type: "Multiple Choice", questions: 10 }
    ]
  },

  writing: {
    A1: [
      { task: 1, type: "Describe a Picture", minWords: 60 },
      { task: 2, type: "Simple Opinion Essay", minWords: 100 }
    ],
    A2: [
      { task: 1, type: "Letter Writing", minWords: 100 },
      { task: 2, type: "Opinion Essay", minWords: 150 }
    ],
    B1: [
      { task: 1, type: "Graph/Chart Description", minWords: 150 },
      { task: 2, type: "Discussion Essay", minWords: 250 }
    ],
    B2: [
      { task: 1, type: "Process Diagram", minWords: 150 },
      { task: 2, type: "Advantages/Disadvantages Essay", minWords: 250 }
    ],
    C1: [
      { task: 1, type: "Data Comparison", minWords: 150 },
      { task: 2, type: "Two-sided Argument Essay", minWords: 250 }
    ],
    C2: [
      { task: 1, type: "Trend Analysis Report", minWords: 150 },
      { task: 2, type: "Critical Evaluation Essay", minWords: 250 }
    ]
  },

  speaking: {
    A1: [
      { part: 1, type: "Introduction & Personal Info" },
      { part: 2, type: "Simple Topic" },
      { part: 3, type: "Basic Opinion" }
    ],
    A2: [
      { part: 1, type: "Daily Topics" },
      { part: 2, type: "Personal Experience" },
      { part: 3, type: "Simple Comparison" }
    ],
    B1: [
      { part: 1, type: "Abstract Ideas" },
      { part: 2, type: "Storytelling" },
      { part: 3, type: "Opinion Justification" }
    ],
    B2: [
      { part: 1, type: "Discussion" },
      { part: 2, type: "Problem Solving" },
      { part: 3, type: "Opinion Support" }
    ],
    C1: [
      { part: 1, type: "Complex Topic Discussion" },
      { part: 2, type: "Fluency/Coherence Focus" },
      { part: 3, type: "Abstract Comparison" }
    ],
    C2: [
      { part: 1, type: "Academic Discussion" },
      { part: 2, type: "Speculative Analysis" },
      { part: 3, type: "Critical Thinking Extension" }
    ]
  }
};

/**
 * Get Cambridge form structure for a skill and level
 */
export function getCambridgeForm(skill, level) {
  const forms = CAMBRIDGE_FORMS[skill];
  if (!forms) {
    console.warn(`[Cambridge Forms] No forms for skill: ${skill}`);
    return CAMBRIDGE_FORMS.reading.A1; // Fallback
  }

  const levelForm = forms[level];
  if (!levelForm) {
    console.warn(`[Cambridge Forms] No form for ${skill} at level ${level}, using B1`);
    return forms.B1 || forms.A2 || forms.A1;
  }

  return levelForm;
}

/**
 * Get question count for a Cambridge form
 */
export function getCambridgeQuestionCount(skill, level) {
  const form = getCambridgeForm(skill, level);
  return form.reduce((total, section) => total + (section.questions || 0), 0);
}

/**
 * Validate Cambridge form structure
 */
export function validateCambridgeForm(form) {
  if (!Array.isArray(form)) return false;
  return form.every(item => 
    item.type && 
    (item.section !== undefined || item.task !== undefined || item.part !== undefined)
  );
}

