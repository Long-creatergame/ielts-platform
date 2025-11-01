/**
 * IELTS Writing Test Templates
 * Simplified structure for easy management and AI generation
 */

export const writingTemplates = {
  A1: {
    structure: {
      task1: {
        type: "Personal Description",
        wordCount: "40-60",
        timeLimit: 10
      },
      task2: {
        type: "Simple Description",
        wordCount: "60-80",
        timeLimit: 15
      }
    },
    sampleTopics: {
      task1: "Write about your family. Describe 3-4 members.",
      task2: "Describe your favorite food. Why do you like it?"
    }
  },
  
  A2: {
    structure: {
      task1: {
        type: "Personal Letter",
        wordCount: "100-120",
        timeLimit: 15
      },
      task2: {
        type: "Simple Opinion",
        wordCount: "120-150",
        timeLimit: 25
      }
    },
    sampleTopics: {
      task1: "Write a letter to your friend about a recent holiday.",
      task2: "Some people think learning online is better. Do you agree?"
    }
  },
  
  B1: {
    structure: {
      task1: {
        type: "Formal Letter / Chart Description",
        wordCount: "150",
        timeLimit: 20
      },
      task2: {
        type: "Discussion Essay",
        wordCount: "250",
        timeLimit: 40
      }
    },
    sampleTopics: {
      task1: "Summarize the chart showing internet usage by age group.",
      task2: "Discuss both views: Is technology making life easier or more complicated?"
    }
  },
  
  B2: {
    structure: {
      task1: {
        type: "Academic Chart/Graph/Map",
        wordCount: "150",
        timeLimit: 20
      },
      task2: {
        type: "Academic Essay",
        wordCount: "250",
        timeLimit: 40
      }
    },
    sampleTopics: {
      task1: "Describe the line graph showing climate change trends over 50 years.",
      task2: "In many countries, the gap between rich and poor is increasing. What are the causes and solutions?"
    }
  },
  
  C1: {
    structure: {
      task1: {
        type: "Complex Academic Data",
        wordCount: "150",
        timeLimit: 20
      },
      task2: {
        type: "Advanced Academic Essay",
        wordCount: "250",
        timeLimit: 40
      }
    },
    sampleTopics: {
      task1: "Compare multiple charts showing economic indicators across countries.",
      task2: "To what extent should governments regulate artificial intelligence development?"
    }
  },
  
  C2: {
    structure: {
      task1: {
        type: "Highly Complex Academic Data",
        wordCount: "150",
        timeLimit: 20
      },
      task2: {
        type: "Sophisticated Academic Essay",
        wordCount: "250",
        timeLimit: 40
      }
    },
    sampleTopics: {
      task1: "Analyze interconnected data from multiple sources on global energy consumption.",
      task2: "Critically evaluate the ethical implications of genetic engineering for human enhancement."
    }
  }
};