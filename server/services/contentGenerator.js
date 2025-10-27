const contentDatabase = {
  reading: {
    passages: [
      {
        id: 'renewable-energy',
        title: 'The Future of Renewable Energy',
        level: 'B2',
        content: `As the world grapples with climate change and the need for sustainable energy sources, renewable energy technologies have emerged as a crucial solution. Solar, wind, hydroelectric, and geothermal power are no longer experimental technologies but are becoming mainstream energy sources in many countries.

Solar energy has seen the most dramatic growth in recent years. The cost of solar panels has dropped by over 80% since 2010, making solar power competitive with fossil fuels in many markets. Countries like Germany, China, and the United States have invested heavily in solar infrastructure, with some regions now generating more electricity from solar than from traditional sources during peak hours.

Wind energy has also experienced significant expansion, particularly in offshore installations. Modern wind turbines are more efficient and can generate electricity even in lower wind speeds. Countries with extensive coastlines, such as the United Kingdom and Denmark, have become leaders in offshore wind development.

However, renewable energy faces several challenges. The intermittent nature of solar and wind power requires sophisticated energy storage solutions and grid management systems. Battery technology has improved dramatically, but large-scale storage remains expensive and technically complex.

Another challenge is the need for significant infrastructure investment. While renewable energy sources have low operating costs once installed, the initial capital investment is substantial. Governments and private investors must commit to long-term projects that may not show returns for years.

Despite these challenges, the trend toward renewable energy is accelerating. Many countries have set ambitious targets for renewable energy adoption, and technological advances continue to reduce costs and improve efficiency. The transition to a renewable energy future is not just environmentally necessary but increasingly economically viable.`,
        questions: [
          {
            id: 1,
            question: "According to the passage, what percentage has the cost of solar panels dropped since 2010?",
            type: "multiple_choice",
            options: ["60%", "70%", "80%", "90%"],
            correctAnswer: 2,
            explanation: "The passage states that 'The cost of solar panels has dropped by over 80% since 2010'."
          },
          {
            id: 2,
            question: "Which countries are mentioned as leaders in offshore wind development?",
            type: "multiple_choice",
            options: ["Germany and China", "United States and Germany", "United Kingdom and Denmark", "China and United States"],
            correctAnswer: 2,
            explanation: "The passage specifically mentions 'Countries with extensive coastlines, such as the United Kingdom and Denmark, have become leaders in offshore wind development.'"
          },
          {
            id: 3,
            question: "What is the main challenge mentioned regarding renewable energy?",
            type: "multiple_choice",
            options: ["High operating costs", "Intermittent nature", "Lack of government support", "Technological limitations"],
            correctAnswer: 1,
            explanation: "The passage states that 'The intermittent nature of solar and wind power requires sophisticated energy storage solutions'."
          }
        ]
      },
      {
        id: 'urban-gardening',
        title: 'The Impact of Social Media on Modern Communication',
        level: 'B1',
        content: `Social media has revolutionized the way people communicate in the 21st century. Platforms like Facebook, Twitter, Instagram, and LinkedIn have created new opportunities for connection, but they have also introduced challenges to traditional communication methods.

One of the most significant benefits of social media is its ability to connect people across vast distances. Families separated by continents can maintain daily contact, and friends can share experiences in real-time. This has been particularly valuable during the COVID-19 pandemic, when physical distancing measures made digital communication essential.

However, social media also presents several drawbacks. The brevity of platforms like Twitter encourages superficial communication, while the curated nature of posts can create unrealistic expectations. Additionally, the constant availability of social media can lead to addiction and decreased face-to-face interaction skills.

Research suggests that while social media enhances our ability to maintain weak social ties, it may weaken our strongest relationships. The key is finding a balance between digital and traditional communication methods.`,
        questions: [
          {
            id: 1,
            question: "What is mentioned as one benefit of social media?",
            type: "multiple_choice",
            options: ["It reduces face-to-face interaction", "It connects people across vast distances", "It creates unrealistic expectations", "It encourages superficial communication"],
            correctAnswer: 1,
            explanation: "The passage states that 'One of the most significant benefits of social media is its ability to connect people across vast distances.'"
          },
          {
            id: 2,
            question: "What does the passage suggest about social media and strong relationships?",
            type: "multiple_choice",
            options: ["It strengthens them", "It has no effect on them", "It may weaken them", "It replaces them completely"],
            correctAnswer: 2,
            explanation: "The passage states that 'while social media enhances our ability to maintain weak social ties, it may weaken our strongest relationships.'"
          }
        ]
      },
      {
        id: 'artificial-intelligence',
        title: 'Artificial Intelligence in Healthcare',
        level: 'C1',
        content: `Artificial Intelligence (AI) is transforming healthcare in unprecedented ways, offering both tremendous opportunities and significant challenges. Machine learning algorithms can now analyze medical images with accuracy that often surpasses human radiologists, enabling earlier detection of diseases such as cancer and diabetic retinopathy.

The integration of AI into healthcare systems has accelerated during the COVID-19 pandemic. AI-powered diagnostic tools helped identify patterns in chest X-rays that were indicative of COVID-19, while natural language processing systems analyzed vast amounts of medical literature to identify potential treatments and drug interactions.

However, the implementation of AI in healthcare raises important ethical considerations. Patient privacy and data security are paramount concerns, as AI systems require access to sensitive medical information. There are also questions about algorithmic bias, where AI systems may perform differently across different demographic groups, potentially leading to health disparities.

Regulatory frameworks are struggling to keep pace with technological advances. The FDA and other regulatory bodies are developing new guidelines for AI medical devices, but the rapid evolution of AI technology presents ongoing challenges for oversight and safety assessment.

Despite these challenges, the potential benefits of AI in healthcare are immense. Predictive analytics can help identify patients at risk of developing certain conditions, enabling preventive interventions. Personalized medicine, where treatments are tailored to individual genetic profiles, is becoming more feasible with AI assistance.

The future of AI in healthcare will likely involve closer collaboration between technologists, healthcare professionals, and patients. As these systems become more sophisticated and widely adopted, they have the potential to revolutionize not just how we treat diseases, but how we understand and prevent them.`,
        questions: [
          {
            id: 1,
            question: "According to the passage, what advantage do AI algorithms have over human radiologists?",
            type: "multiple_choice",
            options: ["They are faster", "They are more accurate", "They are cheaper", "They are more available"],
            correctAnswer: 1,
            explanation: "The passage states that 'Machine learning algorithms can now analyze medical images with accuracy that often surpasses human radiologists.'"
          },
          {
            id: 2,
            question: "What is mentioned as a key ethical concern regarding AI in healthcare?",
            type: "multiple_choice",
            options: ["High costs", "Patient privacy and data security", "Limited availability", "Complex technology"],
            correctAnswer: 1,
            explanation: "The passage states that 'Patient privacy and data security are paramount concerns, as AI systems require access to sensitive medical information.'"
          }
        ]
      }
    ]
  },
  writing: {
    tasks: [
      {
        id: 'social-media-essay',
        level: 'B2',
        task: "Some people believe that social media has a negative impact on young people's social skills. Others argue that it helps them develop new communication abilities. Discuss both views and give your own opinion.",
        type: 'Task 2 Essay',
        wordCount: 250,
        timeLimit: 40
      },
      {
        id: 'environmental-chart',
        level: 'B1',
        task: "The chart below shows the percentage of households in different income groups who owned cars in a particular country between 1995 and 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
        type: 'Task 1 Chart',
        wordCount: 150,
        timeLimit: 20
      },
      {
        id: 'technology-essay',
        level: 'C1',
        task: "Some people think that artificial intelligence will replace many jobs in the future. Others believe that it will create new opportunities. Discuss both views and give your own opinion.",
        type: 'Task 2 Essay',
        wordCount: 250,
        timeLimit: 40
      }
    ]
  },
  listening: {
    audioFiles: [
      {
        id: 'university-lecture',
        title: 'University Course Discussion',
        audioUrl: '/api/audio/ielts-listening-sample-1.mp3',
        level: 'B2',
        questions: [
          {
            id: 1,
            question: "What is the professor's name?",
            type: "multiple_choice",
            options: ["Professor Smith", "Professor Johnson", "Professor Brown", "Professor Davis"],
            correctAnswer: 1
          },
          {
            id: 2,
            question: "What subject does the professor teach?",
            type: "multiple_choice",
            options: ["Biology", "Environmental Science", "Chemistry", "Physics"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'library-information',
        title: 'Library Information',
        audioUrl: '/api/audio/ielts-listening-sample-2.mp3',
        level: 'B1',
        questions: [
          {
            id: 1,
            question: "What are the library's weekend hours?",
            type: "multiple_choice",
            options: ["8 AM to 6 PM", "9 AM to 6 PM", "8 AM to 10 PM", "9 AM to 10 PM"],
            correctAnswer: 1
          }
        ]
      }
    ]
  },
  speaking: {
    topics: [
      {
        id: 'hometown',
        level: 'A2',
        part: 1,
        questions: [
          "Where are you from?",
          "What do you like most about your hometown?",
          "Has your hometown changed much over the years?",
          "Would you like to live in your hometown in the future?"
        ]
      },
      {
        id: 'travel',
        level: 'B1',
        part: 2,
        task: "Describe a memorable journey you have taken. You should say: where you went, when you went there, who you went with, what you did there, and explain why this journey was memorable for you.",
        preparationTime: 1,
        speakingTime: 2
      },
      {
        id: 'technology',
        level: 'B2',
        part: 3,
        questions: [
          "How has technology changed the way people communicate?",
          "Do you think technology has made our lives better or worse?",
          "What are the potential negative effects of technology on society?",
          "How do you think technology will change in the future?"
        ]
      }
    ]
  }
};

const getRandomContent = (skill, level = null) => {
  const skillContent = contentDatabase[skill];
  if (!skillContent) return null;

  if (skill === 'reading') {
    const passages = level 
      ? skillContent.passages.filter(p => p.level === level)
      : skillContent.passages;
    return passages[Math.floor(Math.random() * passages.length)];
  }
  
  if (skill === 'writing') {
    const tasks = level 
      ? skillContent.tasks.filter(t => t.level === level)
      : skillContent.tasks;
    return tasks[Math.floor(Math.random() * tasks.length)];
  }
  
  if (skill === 'listening') {
    const audioFiles = level 
      ? skillContent.audioFiles.filter(a => a.level === level)
      : skillContent.audioFiles;
    return audioFiles[Math.floor(Math.random() * audioFiles.length)];
  }
  
  if (skill === 'speaking') {
    const topics = level 
      ? skillContent.topics.filter(t => t.level === level)
      : skillContent.topics;
    return topics[Math.floor(Math.random() * topics.length)];
  }

  return null;
};

const getAllContent = (skill) => {
  return contentDatabase[skill] || null;
};

module.exports = {
  getRandomContent,
  getAllContent,
  contentDatabase
};
