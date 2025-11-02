/**
 * IELTS Test Blueprints
 * Official Cambridge IELTS format definitions for all skills and modes
 */

export const IELTS_TEST_BLUEPRINTS = {
  writing: {
    academic: {
      timeLimit: 60,
      tasks: [
        {
          taskNumber: 1,
          title: "Task 1 - Visual Report",
          description: "You should spend about 20 minutes on this task.",
          instruction: "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          minWords: 150,
          timeLimit: 20,
          wordCountWarning: "You must write at least 150 words.",
          bandDescription: "Task 1 is marked on: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.",
          media: {
            type: "chart",
            url: "/images/chart-example.png"
          }
        },
        {
          taskNumber: 2,
          title: "Task 2 - Essay",
          description: "You should spend about 40 minutes on this task.",
          instruction: "Some people think environmental protection should be the responsibility of individuals. Others believe that it should be the government's responsibility.\n\nDiscuss both views and give your own opinion.",
          minWords: 250,
          timeLimit: 40,
          wordCountWarning: "You must write at least 250 words.",
          bandDescription: "Task 2 is marked on: Task Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy."
        }
      ],
      totalQuestions: 2,
      passingCriteria: {
        minTask1Words: 150,
        minTask2Words: 250,
        overallTarget: 400
      }
    },
    general: {
      timeLimit: 60,
      tasks: [
        {
          taskNumber: 1,
          title: "Task 1 - Letter",
          description: "You should spend about 20 minutes on this task.",
          instruction: "You recently moved to a new city and want to tell your friend about your new home.\n\nWrite a letter to your friend explaining your situation and inviting them to visit. Include details about:\n\n- Your new location\n- What you like about it\n- Things you'd like to do together",
          minWords: 150,
          timeLimit: 20,
          wordCountWarning: "You must write at least 150 words.",
          letterType: "informal",
          tips: "Write in a friendly, conversational tone as you would to a close friend."
        },
        {
          taskNumber: 2,
          title: "Task 2 - Essay",
          description: "You should spend about 40 minutes on this task.",
          instruction: "Some people think governments should pay for the education of every student. Others believe that students should pay for their own education.\n\nWrite about 250 words. Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
          minWords: 250,
          timeLimit: 40,
          wordCountWarning: "You must write at least 250 words.",
          tips: "You should express a clear opinion and support it with examples."
        }
      ],
      totalQuestions: 2,
      passingCriteria: {
        minTask1Words: 150,
        minTask2Words: 250,
        overallTarget: 400
      }
    }
  },

  reading: {
    academic: {
      timeLimit: 60,
      timeWarning: "You have 60 minutes to answer 40 questions. There are 3 passages.",
      sections: [
        {
          sectionNumber: 1,
          title: "Passage 1",
          passage: "The reading passage will appear here. This is a sample academic text about science, history, culture, or current affairs. Academic reading tests typically include texts from journals, books, research papers, and newspapers.\n\nAcademic reading passages are designed to test your ability to read and understand complex, factual texts written for educated non-specialists.",
          timeAllocated: 20,
          questionCount: 13,
          questions: [
            {
              id: 1,
              type: "TrueFalseNotGiven",
              question: "The passage mentions that academic reading tests are easy.",
              options: null
            },
            {
              id: 2,
              type: "MultipleChoice",
              question: "According to the passage, academic texts are typically written for:",
              options: [
                "A) General public",
                "B) Educated non-specialists",
                "C) University students only",
                "D) Specialists only"
              ],
              correctAnswer: "B"
            }
          ]
        },
        {
          sectionNumber: 2,
          title: "Passage 2",
          passage: "This is the second academic passage. Academic reading passages can cover a wide range of topics including environmental science, technology, history, psychology, business, and more.\n\nYou need to read carefully and answer questions that test your understanding of the main ideas, supporting details, inferences, and the writer's opinions or attitudes.",
          timeAllocated: 20,
          questionCount: 13,
          questions: [
            {
              id: 1,
              type: "MultipleChoice",
              question: "What is the main purpose of the second passage?",
              options: [
                "A) To entertain readers",
                "B) To inform about topic range",
                "C) To persuade readers",
                "D) To describe personal experiences"
              ],
              correctAnswer: "B"
            }
          ]
        },
        {
          sectionNumber: 3,
          title: "Passage 3",
          passage: "This is the third and typically the most challenging academic passage. It often contains more complex vocabulary and sentence structures. Your ability to read quickly and accurately is tested here.\n\nRemember to manage your time well. Allocate about 20 minutes for each passage, but you may need less time for Passage 1 and more time for Passage 3.",
          timeAllocated: 20,
          questionCount: 14,
          questions: []
        }
      ],
      totalQuestions: 40,
      questionTypes: ["TrueFalseNotGiven", "MultipleChoice", "MatchingHeadings", "SummaryCompletion", "MatchingInformation"],
      instructions: "Write your answers on the answer sheet. You can write your answers directly on this page, but make sure you transfer them to the answer sheet before time ends.",
      transferTime: 0
    },
    general: {
      timeLimit: 60,
      timeWarning: "You have 60 minutes to answer 40 questions. There are 3 sections.",
      sections: [
        {
          sectionNumber: 1,
          title: "Section 1",
          description: "Two or three short factual texts, one of which may be composite (consisting of 6–8 short texts related by topic). Topics are relevant to everyday life in an English-speaking country.",
          timeAllocated: 20,
          questionCount: 13,
          questions: []
        },
        {
          sectionNumber: 2,
          title: "Section 2",
          description: "Two short factual texts focusing on work-related issues (e.g., applying for jobs, company policies, pay and conditions, workplace facilities, staff development and training).",
          timeAllocated: 20,
          questionCount: 13,
          questions: []
        },
        {
          sectionNumber: 3,
          title: "Section 3",
          description: "One longer, more complex text on a topic of general interest. Texts are authentic and are taken from notices, advertisements, company handbooks, official documents, books, magazines and newspapers.",
          timeAllocated: 20,
          questionCount: 14,
          questions: []
        }
      ],
      totalQuestions: 40,
      questionTypes: ["TrueFalse", "MultipleChoice", "GapFill", "MatchingInfo", "ShortAnswer"],
      instructions: "Answer all questions in the spaces provided on the answer sheet."
    }
  },

  listening: {
    academic: {
      timeLimit: 30,
      transferTime: 10,
      instructionAudio: "You will hear a number of different recordings and you will have to answer questions on what you hear.",
      instructionText: "You will hear each recording ONCE only. While you listen, write your answers on the question paper. At the end of the test, you will have 10 minutes to transfer your answers to the answer sheet.",
      sections: [
        {
          sectionNumber: 1,
          title: "Section 1",
          context: "A conversation between two people set in an everyday social context (e.g., booking accommodation, joining a club, buying a ticket).",
          questionCount: 10,
          audio: "/audio/listening-section1.mp3"
        },
        {
          sectionNumber: 2,
          title: "Section 2",
          context: "A monologue set in an everyday social context (e.g., a speech about local facilities, a talk about the arrangements for meals during a conference).",
          questionCount: 10,
          audio: "/audio/listening-section2.mp3"
        },
        {
          sectionNumber: 3,
          title: "Section 3",
          context: "A conversation between up to four people set in an educational or training context (e.g., a university tutor and student discussing an assignment, students discussing a research project).",
          questionCount: 10,
          audio: "/audio/listening-section3.mp3"
        },
        {
          sectionNumber: 4,
          title: "Section 4",
          context: "A monologue on an academic subject (e.g., a university lecture).",
          questionCount: 10,
          audio: "/audio/listening-section4.mp3"
        }
      ],
      totalQuestions: 40,
      playOnce: true
    },
    general: {
      timeLimit: 30,
      transferTime: 10,
      instructionAudio: "You will hear a number of different recordings and you will have to answer questions on what you hear.",
      instructionText: "You will hear each recording ONCE only. While you listen, write your answers on the question paper. At the end of the test, you will have 10 minutes to transfer your answers to the answer sheet.",
      sections: [
        {
          sectionNumber: 1,
          title: "Section 1",
          context: "A conversation between two people set in an everyday social context (e.g., booking a hotel room).",
          questionCount: 10,
          audio: "/audio/general-listening-section1.mp3"
        },
        {
          sectionNumber: 2,
          title: "Section 2",
          context: "A monologue set in an everyday social context (e.g., information about a local facility).",
          questionCount: 10,
          audio: "/audio/general-listening-section2.mp3"
        },
        {
          sectionNumber: 3,
          title: "Section 3",
          context: "A conversation between up to four people set in an educational or training context (e.g., discussing course options).",
          questionCount: 10,
          audio: "/audio/general-listening-section3.mp3"
        },
        {
          sectionNumber: 4,
          title: "Section 4",
          context: "A monologue on a topic of general interest (e.g., a presentation on a historical site).",
          questionCount: 10,
          audio: "/audio/general-listening-section4.mp3"
        }
      ],
      totalQuestions: 40,
      playOnce: true
    }
  },

  speaking: {
    academic: {
      timeLimit: 11, // 11-14 minutes
      introduction: "The IELTS Speaking test is a face-to-face interview with an examiner. It takes 11–14 minutes and consists of 3 parts.",
      parts: [
        {
          partNumber: 1,
          title: "Part 1: Introduction and Interview",
          duration: "4-5 minutes",
          instruction: "The examiner will ask you general questions about yourself and familiar topics (e.g., home, family, work, studies, interests).",
          questionTypes: [
            {
              category: "Work or Studies",
              examples: [
                "Do you work or are you a student?",
                "What do you like most about your job/studies?",
                "Do you think your job/studies will change in the future?"
              ]
            },
            {
              category: "Hometown",
              examples: [
                "Where are you from?",
                "What do you like most about your hometown?",
                "Has your hometown changed much in recent years?"
              ]
            },
            {
              category: "Free Time",
              examples: [
                "What do you like to do in your free time?",
                "Do you have any hobbies?",
                "How often do you watch movies?"
              ]
            }
          ],
          tips: "Give detailed answers (2–3 sentences), but don't speak for too long."
        },
        {
          partNumber: 2,
          title: "Part 2: Long Turn",
          duration: "3-4 minutes",
          instruction: "You will be given a task card with a topic. You have 1 minute to prepare and should speak for 1–2 minutes.",
          preparation: {
            time: 60,
            instruction: "You have 1 minute to read the task and prepare. You can take notes."
          },
          speakingTime: {
            min: 60,
            max: 120,
            warning: "Keep speaking! You have 1–2 minutes. The examiner will tell you when to stop."
          },
          sampleTask: {
            topic: "Describe a memorable journey you have taken.",
            prompts: [
              "When and where you went",
              "Who you traveled with",
              "What you did during the journey",
              "Explain why this journey was memorable for you"
            ]
          },
          followUp: "After you finish speaking, the examiner may ask 1–2 follow-up questions before moving to Part 3.",
          tips: "Use the prompts on the card to structure your answer. Speak clearly and at a natural pace."
        },
        {
          partNumber: 3,
          title: "Part 3: Two-way Discussion",
          duration: "4-5 minutes",
          instruction: "The examiner will ask you further questions related to the topic in Part 2. These questions will be more abstract and require you to analyze, discuss, and speculate.",
          questionExamples: [
            "In general, what types of transportation are most popular in your country?",
            "Do you think traveling by car will become more or less popular in the future? Why?",
            "What are the benefits of traveling abroad compared to traveling domestically?",
            "How has technology changed the way people travel?"
          ],
          tips: "Think about broader issues. Give your opinion with reasons and examples."
        }
      ],
      totalParts: 3,
      markingCriteria: [
        "Fluency and Coherence",
        "Lexical Resource",
        "Grammatical Range and Accuracy",
        "Pronunciation"
      ]
    },
    general: {
      timeLimit: 11, // 11-14 minutes
      introduction: "The IELTS Speaking test is a face-to-face interview with an examiner. It takes 11–14 minutes and consists of 3 parts.",
      parts: [
        {
          partNumber: 1,
          title: "Part 1: Introduction and Interview",
          duration: "4-5 minutes",
          instruction: "The examiner will ask you general questions about yourself and familiar topics (e.g., home, family, work, studies, interests).",
          questionTypes: [
            {
              category: "Personal Information",
              examples: [
                "What's your name?",
                "Where are you from?",
                "Do you work or study?"
              ]
            },
            {
              category: "Daily Life",
              examples: [
                "What do you do every day?",
                "Do you like cooking?",
                "What's your favorite food?"
              ]
            }
          ],
          tips: "Be natural and relaxed. Answer confidently."
        },
        {
          partNumber: 2,
          title: "Part 2: Long Turn",
          duration: "3-4 minutes",
          instruction: "You will be given a task card with a topic. You have 1 minute to prepare and should speak for 1–2 minutes.",
          preparation: {
            time: 60,
            instruction: "You have 1 minute to read the task and prepare. You can take notes."
          },
          speakingTime: {
            min: 60,
            max: 120,
            warning: "Keep speaking! You have 1–2 minutes."
          },
          sampleTask: {
            topic: "Describe your favorite food.",
            prompts: [
              "What it is",
              "When and where you usually eat it",
              "How it's prepared",
              "Explain why you like it"
            ]
          },
          followUp: "After you finish speaking, the examiner may ask 1–2 follow-up questions.",
          tips: "Use the 1-minute preparation time wisely. Take notes if it helps."
        },
        {
          partNumber: 3,
          title: "Part 3: Two-way Discussion",
          duration: "4-5 minutes",
          instruction: "The examiner will ask you further questions related to the topic in Part 2. These questions will be more abstract.",
          questionExamples: [
            "What types of food are popular in your country?",
            "Do you think people's eating habits have changed in recent years?",
            "What are the advantages of home-cooked meals versus eating out?",
            "How do you think food culture will change in the future?"
          ],
          tips: "Express your opinions clearly with reasons."
        }
      ],
      totalParts: 3,
      markingCriteria: [
        "Fluency and Coherence",
        "Lexical Resource",
        "Grammatical Range and Accuracy",
        "Pronunciation"
      ]
    }
  }
};

/**
 * Get blueprint for a specific skill and mode
 */
export const getBlueprint = (skill, mode = 'academic') => {
  return IELTS_TEST_BLUEPRINTS[skill]?.[mode] || null;
};

/**
 * Get available modes for a skill
 */
export const getAvailableModes = (skill) => {
  return Object.keys(IELTS_TEST_BLUEPRINTS[skill] || {});
};

/**
 * Get all skills with modes
 */
export const getAllSkillsWithModes = () => {
  return Object.keys(IELTS_TEST_BLUEPRINTS).map(skill => ({
    skill,
    modes: Object.keys(IELTS_TEST_BLUEPRINTS[skill])
  }));
};

/**
 * Validate if a blueprint exists
 */
export const validateBlueprint = (skill, mode) => {
  return !!IELTS_TEST_BLUEPRINTS[skill]?.[mode];
};

export default IELTS_TEST_BLUEPRINTS;
