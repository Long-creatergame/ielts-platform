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
        id: 'daily-routine',
        title: 'Daily Routines',
        level: 'A1',
        content: `A good daily routine is very important for success. Many successful people wake up early in the morning. They eat breakfast, exercise, and plan their day before starting work.

Jane is a teacher. She wakes up at 6:00 AM every day. First, she drinks a glass of water. Then she does yoga for 20 minutes. After that, she takes a shower and eats breakfast. Her breakfast is usually toast and fruit.

At 7:30 AM, Jane leaves home for school. She arrives at school at 8:00 AM. Her classes start at 8:30 AM and finish at 3:00 PM. After school, she plans lessons for the next day and grades student papers.

In the evening, Jane likes to read books or watch TV. She goes to bed at 10:00 PM. She sleeps for 8 hours every night.`,
        questions: [
          {
            id: 1,
            question: "What time does Jane wake up?",
            type: "multiple_choice",
            options: ["5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM"],
            correctAnswer: 1,
            explanation: "The passage states 'She wakes up at 6:00 AM every day.'"
          },
          {
            id: 2,
            question: "What does Jane do first after waking up?",
            type: "multiple_choice",
            options: ["Does yoga", "Drinks water", "Takes a shower", "Eats breakfast"],
            correctAnswer: 1,
            explanation: "The passage states 'First, she drinks a glass of water.'"
          },
          {
            id: 3,
            question: "When do Jane's classes start?",
            type: "multiple_choice",
            options: ["7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"],
            correctAnswer: 2,
            explanation: "The passage states 'Her classes start at 8:30 AM.'"
          }
        ]
      },
      {
        id: 'food-and-health',
        title: 'Food and Health',
        level: 'A2',
        content: `Healthy eating is important for our bodies. We need to eat different kinds of food every day. Fruits and vegetables are very good for us. They have vitamins that help our bodies stay strong.

Breakfast is the most important meal. It gives us energy for the whole day. A good breakfast might include eggs, bread, fruit, and milk or juice. Skipping breakfast can make you feel tired and hungry later.

Drinking water is also very important. Our bodies need about 8 glasses of water every day. Water helps us digest food and keeps our skin healthy. We should drink more water when we exercise.

Too much junk food is not good. Foods like chips, candy, and fast food have a lot of sugar and fat. Eating too much of these foods can make us gain weight and cause health problems. We should only eat them sometimes, not every day.`,
        questions: [
          {
            id: 1,
            question: "Why are fruits and vegetables good for us?",
            type: "multiple_choice",
            options: ["They are cheap", "They have vitamins", "They taste good", "They are easy to cook"],
            correctAnswer: 1,
            explanation: "The passage states 'They have vitamins that help our bodies stay strong.'"
          },
          {
            id: 2,
            question: "Which meal is mentioned as the most important?",
            type: "multiple_choice",
            options: ["Lunch", "Dinner", "Breakfast", "Snacks"],
            correctAnswer: 2,
            explanation: "The passage states 'Breakfast is the most important meal.'"
          },
          {
            id: 3,
            question: "How much water should we drink every day?",
            type: "multiple_choice",
            options: ["4 glasses", "6 glasses", "8 glasses", "10 glasses"],
            correctAnswer: 2,
            explanation: "The passage states 'Our bodies need about 8 glasses of water every day.'"
          }
        ]
      },
      {
        id: 'climate-change',
        title: 'Understanding Climate Change',
        level: 'B1',
        content: `Climate change is one of the most pressing issues of our time. It refers to long-term changes in weather patterns and temperatures across the globe. Scientists have observed that the Earth's average temperature has increased significantly over the past century.

The main cause of climate change is the increase in greenhouse gases in our atmosphere. These gases, particularly carbon dioxide from burning fossil fuels, trap heat from the sun. As a result, the Earth's temperature rises.

Climate change affects many aspects of our planet. Rising sea levels threaten coastal cities, while changing weather patterns cause more frequent and severe storms. Some regions experience longer droughts, while others face increased flooding.

Individuals can help reduce climate change by using less energy, walking or cycling instead of driving, and eating more plant-based foods. Governments and businesses also need to invest in renewable energy sources like wind and solar power.`,
        questions: [
          {
            id: 1,
            question: "What is climate change?",
            type: "multiple_choice",
            options: ["Short-term weather changes", "Long-term changes in weather patterns", "Daily temperature changes", "Seasonal variations"],
            correctAnswer: 1,
            explanation: "The passage states 'Climate change refers to long-term changes in weather patterns and temperatures.'"
          },
          {
            id: 2,
            question: "What is the main cause of climate change?",
            type: "multiple_choice",
            options: ["Pollution", "Population growth", "Increase in greenhouse gases", "Natural disasters"],
            correctAnswer: 2,
            explanation: "The passage states 'The main cause of climate change is the increase in greenhouse gases in our atmosphere.'"
          }
        ]
      },
      {
        id: 'global-economy',
        title: 'The Global Economy in the Digital Age',
        level: 'C2',
        content: `The transformation of the global economy in the digital age has been nothing short of revolutionary. Traditional economic models have been fundamentally disrupted by technological innovations, creating unprecedented opportunities while simultaneously presenting novel challenges.

E-commerce has emerged as a dominant force, reshaping retail landscapes and consumer behavior. The ability to purchase goods and services from anywhere in the world with a few clicks has democratized commerce but has also led to the decline of brick-and-mortar establishments. Small businesses now compete on a global scale, while established corporations adapt their strategies to maintain relevance.

The gig economy represents another significant shift. Platforms connecting workers with short-term projects have created new economic opportunities for millions, offering flexibility and autonomy. However, this model also raises questions about job security, benefits, and workers' rights.

Cryptocurrency and blockchain technology challenge traditional financial systems, offering decentralized alternatives that could potentially democratize access to financial services. Yet regulatory frameworks struggle to keep pace with these innovations, creating uncertainty in markets.

Artificial intelligence and automation continue to transform industries, from manufacturing to professional services. While these technologies promise increased efficiency, they also raise concerns about job displacement and the need for workforce reskilling.

The digital economy's environmental impact cannot be overlooked. Data centers consume enormous amounts of energy, and electronic waste is a growing concern. Sustainable technology solutions are becoming increasingly critical.`,
        questions: [
          {
            id: 1,
            question: "According to the passage, what has been a significant effect of e-commerce?",
            type: "multiple_choice",
            options: ["Increased brick-and-mortar stores", "Decline of physical retail", "Reduced global competition", "More expensive goods"],
            correctAnswer: 1,
            explanation: "The passage states 'The ability to purchase goods and services from anywhere has led to the decline of brick-and-mortar establishments.'"
          },
          {
            id: 2,
            question: "What concern is raised about cryptocurrency?",
            type: "multiple_choice",
            options: ["It's too expensive", "Regulatory frameworks are struggling to keep pace", "It's not secure", "It's difficult to use"],
            correctAnswer: 1,
            explanation: "The passage states 'Regulatory frameworks struggle to keep pace with these innovations, creating uncertainty in markets.'"
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
        id: 'introduce-yourself',
        level: 'A1',
        task: "Write a short paragraph introducing yourself. Include: your name, where you are from, what you do, and your hobbies. Write 50-80 words.",
        type: 'Task 1 Personal',
        wordCount: 80,
        timeLimit: 20
      },
      {
        id: 'family-letter',
        level: 'A2',
        task: "Write a letter to a friend telling them about your family. Include: who is in your family, what they do, and what you like to do together. Write 80-120 words.",
        type: 'Task 1 Letter',
        wordCount: 120,
        timeLimit: 25
      },
      {
        id: 'daily-routine-description',
        level: 'A2',
        task: "Describe your daily routine. Include: what time you wake up, what you do in the morning, afternoon, and evening. Write 80-120 words.",
        type: 'Task 1 Description',
        wordCount: 120,
        timeLimit: 25
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
        id: 'social-media-essay',
        level: 'B2',
        task: "Some people believe that social media has a negative impact on young people's social skills. Others argue that it helps them develop new communication abilities. Discuss both views and give your own opinion.",
        type: 'Task 2 Essay',
        wordCount: 250,
        timeLimit: 40
      },
      {
        id: 'education-system-essay',
        level: 'B2',
        task: "Some people think that all school subjects should be optional. Others believe that certain subjects like math and languages should be compulsory. Discuss both views and give your own opinion.",
        type: 'Task 2 Essay',
        wordCount: 250,
        timeLimit: 40
      },
      {
        id: 'technology-essay',
        level: 'C1',
        task: "Some people think that artificial intelligence will replace many jobs in the future. Others believe that it will create new opportunities. Discuss both views and give your own opinion.",
        type: 'Task 2 Essay',
        wordCount: 250,
        timeLimit: 40
      },
      {
        id: 'globalization-essay',
        level: 'C1',
        task: "Globalization has both positive and negative effects on different countries. To what extent do you agree or disagree? Discuss the advantages and disadvantages of globalization.",
        type: 'Task 2 Essay',
        wordCount: 250,
        timeLimit: 40
      },
      {
        id: 'philosophy-essay',
        level: 'C2',
        task: "Technology is merely a tool. Discuss the extent to which technological advancement serves humanity versus controlling it. Consider ethical implications and future possibilities.",
        type: 'Task 2 Essay',
        wordCount: 350,
        timeLimit: 45
      }
    ]
  },
  listening: {
    audioFiles: [
      {
        id: 'self-introduction',
        title: 'Self Introduction',
        audioUrl: '/api/audio/ielts-listening-a1-sample.mp3',
        level: 'A1',
        questions: [
          {
            id: 1,
            question: "What is the person's name?",
            type: "multiple_choice",
            options: ["Mike", "Tom", "John", "Steve"],
            correctAnswer: 0
          },
          {
            id: 2,
            question: "Where is the person from?",
            type: "multiple_choice",
            options: ["England", "America", "Australia", "Canada"],
            correctAnswer: 1
          }
        ]
      },
      {
        id: 'shopping-dialogue',
        title: 'Shopping Dialogue',
        audioUrl: '/api/audio/ielts-listening-a2-sample.mp3',
        level: 'A2',
        questions: [
          {
            id: 1,
            question: "What does the customer want to buy?",
            type: "multiple_choice",
            options: ["A shirt", "A jacket", "A dress", "A coat"],
            correctAnswer: 2
          },
          {
            id: 2,
            question: "What size does the customer need?",
            type: "multiple_choice",
            options: ["Small", "Medium", "Large", "Extra Large"],
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
      },
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
        id: 'news-report',
        title: 'News Report',
        audioUrl: '/api/audio/ielts-listening-c1-sample.mp3',
        level: 'C1',
        questions: [
          {
            id: 1,
            question: "What is the main topic of the news?",
            type: "multiple_choice",
            options: ["Weather forecast", "Economic policy", "Technology innovation", "Healthcare reform"],
            correctAnswer: 1
          }
        ]
      }
    ]
  },
  speaking: {
    topics: [
      {
        id: 'greetings',
        level: 'A1',
        part: 1,
        questions: [
          "What is your name?",
          "How old are you?",
          "Where are you from?",
          "What do you do?"
        ]
      },
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
        id: 'favorite-hobby',
        level: 'A2',
        part: 2,
        task: "Describe your favorite hobby. You should say: what it is, when you do it, how long you've been doing it, and explain why you like it.",
        preparationTime: 1,
        speakingTime: 1
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
        id: 'climate-change',
        level: 'B1',
        part: 3,
        questions: [
          "What do you think causes climate change?",
          "How is climate change affecting your country?",
          "What can individuals do to help reduce climate change?",
          "Do you think governments are doing enough to address climate change?"
        ]
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
      },
      {
        id: 'artificial-intelligence',
        level: 'C1',
        part: 3,
        questions: [
          "How is artificial intelligence changing the workplace?",
          "What ethical concerns do you have about AI?",
          "In what ways could AI be beneficial to society?",
          "How should governments regulate the development of AI?"
        ]
      },
      {
        id: 'global-ethics',
        level: 'C2',
        part: 3,
        questions: [
          "To what extent should countries prioritize national interests over global cooperation?",
          "How do cultural differences affect ethical decision-making in international contexts?",
          "What role should corporations play in addressing global challenges?",
          "How can we balance technological progress with ethical considerations?"
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
