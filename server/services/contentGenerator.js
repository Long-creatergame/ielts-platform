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

In the evening, Jane likes to read books or watch TV. She goes to bed at 10:00 PM. She sleeps for 8 hours every night.

On weekends, Jane has a different routine. She wakes up at 8:00 AM on Saturdays and Sundays. She enjoys cooking breakfast for her family. In the afternoon, she visits the park with her children. They play games and ride bicycles together.

Jane believes that a regular routine helps her stay healthy and happy. She feels more relaxed when she follows her daily schedule.`,
        questions: [
          {
            id: 1,
            question: "What time does Jane wake up during weekdays?",
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
          },
          {
            id: 4,
            question: "What does Jane eat for breakfast?",
            type: "multiple_choice",
            options: ["Eggs and bacon", "Toast and fruit", "Cereal and milk", "Bread and cheese"],
            correctAnswer: 1,
            explanation: "The passage states 'Her breakfast is usually toast and fruit.'"
          },
          {
            id: 5,
            question: "When do Jane's classes finish?",
            type: "multiple_choice",
            options: ["2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"],
            correctAnswer: 2,
            explanation: "The passage states 'Her classes start at 8:30 AM and finish at 3:00 PM.'"
          },
          {
            id: 6,
            question: "What does Jane do after school?",
            type: "multiple_choice",
            options: ["Watches TV", "Plans lessons", "Exercises", "Cooks dinner"],
            correctAnswer: 1,
            explanation: "The passage states 'After school, she plans lessons for the next day and grades student papers.'"
          },
          {
            id: 7,
            question: "What does Jane like to do in the evening?",
            type: "multiple_choice",
            options: ["Read books or watch TV", "Go to the gym", "Cook dinner", "Meet friends"],
            correctAnswer: 0,
            explanation: "The passage states 'In the evening, Jane likes to read books or watch TV.'"
          },
          {
            id: 8,
            question: "What time does Jane go to bed?",
            type: "multiple_choice",
            options: ["9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM"],
            correctAnswer: 2,
            explanation: "The passage states 'She goes to bed at 10:00 PM.'"
          },
          {
            id: 9,
            question: "How many hours does Jane sleep every night?",
            type: "multiple_choice",
            options: ["6 hours", "7 hours", "8 hours", "9 hours"],
            correctAnswer: 2,
            explanation: "The passage states 'She sleeps for 8 hours every night.'"
          },
          {
            id: 10,
            question: "When does Jane wake up on weekends?",
            type: "multiple_choice",
            options: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"],
            correctAnswer: 2,
            explanation: "The passage states 'She wakes up at 8:00 AM on Saturdays and Sundays.'"
          },
          {
            id: 11,
            question: "What does Jane do in the afternoon on weekends?",
            type: "multiple_choice",
            options: ["Visits the park with children", "Reads books", "Plans lessons", "Watches TV"],
            correctAnswer: 0,
            explanation: "The passage states 'In the afternoon, she visits the park with her children.'"
          },
          {
            id: 12,
            question: "How many glasses of water does Jane drink first thing in the morning?",
            type: "multiple_choice",
            options: ["One glass", "Two glasses", "Three glasses", "Four glasses"],
            correctAnswer: 0,
            explanation: "The passage states 'First, she drinks a glass of water.'"
          },
          {
            id: 13,
            question: "What is the main idea of this passage?",
            type: "multiple_choice",
            options: ["Exercise is important", "Jane is a teacher", "Having a routine is helpful", "Sleeping well is key"],
            correctAnswer: 2,
            explanation: "The passage focuses on Jane's daily routine and explains that routines help people stay healthy and happy."
          }
        ]
      },
      {
        id: 'shopping-habits',
        title: 'Shopping Habits',
        level: 'A1',
        content: `Shopping is an activity that most people do regularly. Some people like shopping while others find it stressful. Understanding shopping habits can help us make better choices.

Many people shop for food every week. They visit supermarkets to buy fresh fruits, vegetables, meat, and bread. Some people prefer to shop every few days to keep food fresh. Others shop once a week to save time.

Clothing shopping is different. Some people shop for clothes only when they need something new. Others enjoy shopping for clothes as a hobby. They like trying on different styles and colors.

Online shopping is becoming more popular. People can buy things from home using their computers or phones. It is convenient because you don't need to go to the store. However, you cannot see or touch the products before buying them.

Many people compare prices before making a purchase. They look at different stores to find the best price. Some people wait for sales to buy things at lower prices. Others prefer to buy things immediately if they need them.

Shopping can be fun, but it's important to stay within your budget. Making a shopping list helps people remember what they need and avoid buying unnecessary things. It's also good to shop when you're not hungry because hunger can make you buy more food than you need.

Some people prefer shopping with friends while others like shopping alone. Shopping with friends can be more enjoyable, but it might take longer because everyone has different preferences. Shopping alone is faster but can be less fun.`,
        questions: [
          {
            id: 1,
            question: "What is one thing most people shop for regularly?",
            type: "multiple_choice",
            options: ["Cars", "Food", "Houses", "Pets"],
            correctAnswer: 1,
            explanation: "The passage states 'Many people shop for food every week.'"
          },
          {
            id: 2,
            question: "Why do some people shop for food once a week?",
            type: "multiple_choice",
            options: ["Food is cheaper", "They save time", "Food tastes better", "Stores are closer"],
            correctAnswer: 1,
            explanation: "The passage states 'Others shop once a week to save time.'"
          },
          {
            id: 3,
            question: "What is mentioned as a benefit of online shopping?",
            type: "multiple_choice",
            options: ["Products are cheaper", "You don't need to go to the store", "Products arrive faster", "You get better quality"],
            correctAnswer: 1,
            explanation: "The passage states 'It is convenient because you don't need to go to the store.'"
          },
          {
            id: 4,
            question: "What is a disadvantage of online shopping mentioned in the passage?",
            type: "multiple_choice",
            options: ["Delivery is slow", "Products cost more", "You cannot see or touch products", "You need a credit card"],
            correctAnswer: 2,
            explanation: "The passage states 'However, you cannot see or touch the products before buying them.'"
          },
          {
            id: 5,
            question: "What helps people remember what to buy?",
            type: "multiple_choice",
            options: ["A shopping list", "A map", "A calculator", "A clock"],
            correctAnswer: 0,
            explanation: "The passage states 'Making a shopping list helps people remember what they need and avoid buying unnecessary things.'"
          },
          {
            id: 6,
            question: "According to the passage, why shouldn't you shop when you're hungry?",
            type: "multiple_choice",
            options: ["You spend more money", "You forget your list", "You buy too much food", "You get tired quickly"],
            correctAnswer: 2,
            explanation: "The passage states 'It's also good to shop when you're not hungry because hunger can make you buy more food than you need.'"
          },
          {
            id: 7,
            question: "What is TRUE about shopping with friends?",
            type: "multiple_choice",
            options: ["It is cheaper", "It is more fun but slower", "It is easier", "It saves money"],
            correctAnswer: 1,
            explanation: "The passage states 'Shopping with friends can be more enjoyable, but it might take longer because everyone has different preferences.'"
          },
          {
            id: 8,
            question: "What does the passage say about shopping alone?",
            type: "multiple_choice",
            options: ["It is more expensive", "It is faster but less fun", "It is boring", "It takes longer"],
            correctAnswer: 1,
            explanation: "The passage states 'Shopping alone is faster but can be less fun.'"
          },
          {
            id: 9,
            question: "What do many people do before buying something?",
            type: "multiple_choice",
            options: ["Compare prices", "Ask friends", "Read reviews", "Watch videos"],
            correctAnswer: 0,
            explanation: "The passage states 'Many people compare prices before making a purchase.'"
          },
          {
            id: 10,
            question: "Some people shop for clothes as a...?",
            type: "multiple_choice",
            options: ["Job", "Chore", "Hobby", "Responsibility"],
            correctAnswer: 2,
            explanation: "The passage states 'Others enjoy shopping for clothes as a hobby.'"
          },
          {
            id: 11,
            question: "What should you do to stay within your budget?",
            type: "multiple_choice",
            options: ["Shop online only", "Make a shopping list", "Shop with friends", "Wait for sales"],
            correctAnswer: 1,
            explanation: "The passage states 'It's important to stay within your budget. Making a shopping list helps people remember what they need and avoid buying unnecessary things.'"
          },
          {
            id: 12,
            question: "What type of shopping is becoming more popular?",
            type: "multiple_choice",
            options: ["Store shopping", "Online shopping", "Market shopping", "Garage sale shopping"],
            correctAnswer: 1,
            explanation: "The passage states 'Online shopping is becoming more popular.'"
          },
          {
            id: 13,
            question: "What is the main idea of this passage?",
            type: "multiple_choice",
            options: ["Everyone likes shopping", "Shopping habits vary", "Shopping is expensive", "Online shopping is best"],
            correctAnswer: 1,
            explanation: "The passage describes different shopping habits and preferences people have."
          }
        ]
      },
      {
        id: 'weather-seasons',
        title: 'Weather and Seasons',
        level: 'A1',
        content: `Weather changes throughout the year in most places. We have four seasons: spring, summer, autumn, and winter. Each season has different weather.
        
Spring is usually warm and rainy. Flowers grow in spring. The weather gets warmer and days get longer. Many people like spring because it is not too hot or too cold.

Summer is the hottest season. Days are long and nights are short. People enjoy swimming, going to the beach, and having picnics. Some places have very hot summers, while others are mild and pleasant.

Autumn brings cooler weather. Leaves change color and fall from trees. It becomes windy and rainy. People start wearing warmer clothes. Days get shorter as winter approaches.

Winter is the coldest season. It often snows in winter in many places. Days are short and nights are long. People wear coats, hats, and gloves to stay warm. Some animals sleep all winter.

The weather affects what we wear, what we do, and how we feel. It's important to check the weather forecast before going outside. Weather can change quickly, so it's good to be prepared.`,
        questions: [
          {
            id: 1,
            question: "How many seasons are there?",
            type: "multiple_choice",
            options: ["Two", "Three", "Four", "Five"],
            correctAnswer: 2,
            explanation: "The passage states 'We have four seasons: spring, summer, autumn, and winter.'"
          },
          {
            id: 2,
            question: "What happens in spring?",
            type: "multiple_choice",
            options: ["It snows", "Flowers grow", "Days get shorter", "It gets very cold"],
            correctAnswer: 1,
            explanation: "The passage states 'Flowers grow in spring.'"
          },
          {
            id: 3,
            question: "Which season is the hottest?",
            type: "multiple_choice",
            options: ["Spring", "Summer", "Autumn", "Winter"],
            correctAnswer: 1,
            explanation: "The passage states 'Summer is the hottest season.'"
          },
          {
            id: 4,
            question: "What do people enjoy doing in summer?",
            type: "multiple_choice",
            options: ["Building snowmen", "Swimming and going to the beach", "Making snow angels", "Wearing warm clothes"],
            correctAnswer: 1,
            explanation: "The passage states 'People enjoy swimming, going to the beach, and having picnics.'"
          },
          {
            id: 5,
            question: "What happens to leaves in autumn?",
            type: "multiple_choice",
            options: ["They turn green", "They change color and fall", "They grow bigger", "They stay on trees"],
            correctAnswer: 1,
            explanation: "The passage states 'Leaves change color and fall from trees.'"
          },
          {
            id: 6,
            question: "What season has the coldest weather?",
            type: "multiple_choice",
            options: ["Spring", "Summer", "Autumn", "Winter"],
            correctAnswer: 3,
            explanation: "The passage states 'Winter is the coldest season.'"
          },
          {
            id: 7,
            question: "What often happens in winter?",
            type: "multiple_choice",
            options: ["It's very hot", "It often snows", "Flowers bloom", "Days are long"],
            correctAnswer: 1,
            explanation: "The passage states 'It often snows in winter in many places.'"
          },
          {
            id: 8,
            question: "Why is spring pleasant for many people?",
            type: "multiple_choice",
            options: ["It's very hot", "It's not too hot or too cold", "It snows a lot", "It's very cold"],
            correctAnswer: 1,
            explanation: "The passage states 'Many people like spring because it is not too hot or too cold.'"
          },
          {
            id: 9,
            question: "What should you do before going outside?",
            type: "multiple_choice",
            options: ["Have breakfast", "Check the weather forecast", "Call a friend", "Watch TV"],
            correctAnswer: 1,
            explanation: "The passage states 'It's important to check the weather forecast before going outside.'"
          },
          {
            id: 10,
            question: "What changes in autumn?",
            type: "multiple_choice",
            options: ["Weather gets warmer", "Days get longer", "Days get shorter", "It gets very hot"],
            correctAnswer: 2,
            explanation: "The passage states 'Days get shorter as winter approaches.'"
          },
          {
            id: 11,
            question: "What do people wear in winter?",
            type: "multiple_choice",
            options: ["Shorts", "Coats, hats, and gloves", "Swimsuits", "Light clothes"],
            correctAnswer: 1,
            explanation: "The passage states 'People wear coats, hats, and gloves to stay warm.'"
          },
          {
            id: 12,
            question: "What happens to some animals in winter?",
            type: "multiple_choice",
            options: ["They swim", "They play", "They sleep all winter", "They grow bigger"],
            correctAnswer: 2,
            explanation: "The passage states 'Some animals sleep all winter.'"
          },
          {
            id: 13,
            question: "What makes autumn different from summer?",
            type: "multiple_choice",
            options: ["It gets warmer", "It brings cooler weather", "Days get longer", "It gets very hot"],
            correctAnswer: 1,
            explanation: "The passage states 'Autumn brings cooler weather.'"
          }
        ]
      },
      {
        id: 'food-and-health',
        title: 'Food and Health',
        level: 'A2',
        content: `Healthy eating is very important for our bodies. We need to eat different kinds of food every day to stay healthy. Fruits and vegetables are very good for us because they have vitamins that help our bodies stay strong.

Breakfast is the most important meal of the day. It gives us energy for the whole day. A good breakfast might include eggs, bread, fruit, and milk or juice. Skipping breakfast can make you feel tired and hungry later. Experts say that people who eat breakfast perform better at work or school.

Drinking water is also very important. Our bodies need about 8 glasses of water every day. Water helps us digest food and keeps our skin healthy. We should drink more water when we exercise or when it's hot outside. Dehydration can cause headaches and make us feel tired.

Too much junk food is not good for us. Foods like chips, candy, and fast food have a lot of sugar and fat. Eating too much of these foods can make us gain weight and cause health problems like diabetes and heart disease. We should only eat them sometimes, not every day.

Cooking at home is usually healthier than eating out. When you cook at home, you can control what ingredients you use. You can choose fresh vegetables and lean meats. You can also avoid unhealthy oils and excessive salt. Home-cooked meals are often less expensive than restaurant meals too.

Eating slowly is another good habit. When we eat too fast, we don't give our bodies time to feel full. This can lead to overeating. Taking time to enjoy our food helps us eat less and feel more satisfied with smaller portions.

Regular meals at the same times each day help our bodies work better. Our bodies get used to when we eat and can digest food more efficiently. Many nutritionists recommend eating three main meals plus healthy snacks between meals if needed.`,
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
            explanation: "The passage states 'Breakfast is the most important meal of the day.'"
          },
          {
            id: 3,
            question: "How many glasses of water should we drink every day?",
            type: "multiple_choice",
            options: ["4 glasses", "6 glasses", "8 glasses", "10 glasses"],
            correctAnswer: 2,
            explanation: "The passage states 'Our bodies need about 8 glasses of water every day.'"
          },
          {
            id: 4,
            question: "What can skipping breakfast cause?",
            type: "multiple_choice",
            options: ["Headaches", "Feeling tired and hungry", "Gaining weight", "Dehydration"],
            correctAnswer: 1,
            explanation: "The passage states 'Skipping breakfast can make you feel tired and hungry later.'"
          },
          {
            id: 5,
            question: "When should we drink more water?",
            type: "multiple_choice",
            options: ["When sleeping", "When sitting", "When exercising or hot", "When eating"],
            correctAnswer: 2,
            explanation: "The passage states 'We should drink more water when we exercise or when it's hot outside.'"
          },
          {
            id: 6,
            question: "What health problems can result from eating too much junk food?",
            type: "multiple_choice",
            options: ["Headaches only", "Diabetes and heart disease", "Tiredness only", "Sleep problems"],
            correctAnswer: 1,
            explanation: "The passage states 'Eating too much of these foods can make us gain weight and cause health problems like diabetes and heart disease.'"
          },
          {
            id: 7,
            question: "What is mentioned as an advantage of cooking at home?",
            type: "multiple_choice",
            options: ["It's faster", "You can control ingredients", "It's more fun", "It needs no planning"],
            correctAnswer: 1,
            explanation: "The passage states 'When you cook at home, you can control what ingredients you use.'"
          },
          {
            id: 8,
            question: "What happens if we eat too fast?",
            type: "multiple_choice",
            options: ["We digest better", "We might overeat", "We feel fuller", "We have more energy"],
            correctAnswer: 1,
            explanation: "The passage states 'When we eat too fast, we don't give our bodies time to feel full. This can lead to overeating.'"
          },
          {
            id: 9,
            question: "How many main meals do nutritionists recommend?",
            type: "multiple_choice",
            options: ["Two", "Three", "Four", "Five"],
            correctAnswer: 1,
            explanation: "The passage states 'Many nutritionists recommend eating three main meals plus healthy snacks between meals if needed.'"
          },
          {
            id: 10,
            question: "What is dehydration mentioned as causing?",
            type: "multiple_choice",
            options: ["Weight gain", "Headaches and tiredness", "Better digestion", "More energy"],
            correctAnswer: 1,
            explanation: "The passage states 'Dehydration can cause headaches and make us feel tired.'"
          },
          {
            id: 11,
            question: "Why is cooking at home often less expensive?",
            type: "multiple_choice",
            options: ["Food is cheaper", "You buy less", "Restaurant meals cost more", "You share with family"],
            correctAnswer: 2,
            explanation: "The passage states 'Home-cooked meals are often less expensive than restaurant meals too.'"
          },
          {
            id: 12,
            question: "What does the passage say about eating at regular times?",
            type: "multiple_choice",
            options: ["It's not important", "It helps our bodies work better", "It causes problems", "It makes us eat more"],
            correctAnswer: 1,
            explanation: "The passage states 'Regular meals at the same times each day help our bodies work better.'"
          },
          {
            id: 13,
            question: "What is the main purpose of this passage?",
            type: "multiple_choice",
            options: ["To tell us about exercise", "To explain healthy eating habits", "To advertise restaurants", "To promote a diet plan"],
            correctAnswer: 1,
            explanation: "The passage explains various aspects of healthy eating including breakfast, water, junk food, cooking at home, and eating habits."
          }
        ]
      },
      {
        id: 'travel-and-tourism',
        title: 'Travel and Tourism',
        level: 'A2',
        content: `Traveling is one of the most popular activities in the world. People travel for many reasons including vacation, business, education, or to visit family and friends. Tourism has become a major industry that creates jobs and helps local economies grow.

Many people like to travel because it allows them to experience different cultures. When you visit another country, you can try local foods, see famous landmarks, and learn about how people live in different places. Some travelers enjoy taking photos of beautiful places to share with friends and family.

Planning a trip takes time and research. Travelers need to find information about their destination, book hotels or flights, and decide what activities they want to do. The internet has made planning much easier because people can compare prices and read reviews from other travelers.

Tourism brings money to local communities. When tourists visit, they spend money on hotels, restaurants, shopping, and attractions. This money helps create jobs for local people in the hospitality and service industries. Many small towns and cities depend on tourism for their economy.

However, tourism can also have negative effects. Popular destinations sometimes become overcrowded, which can damage the environment and make the place less enjoyable for visitors. Some tourists behave disrespectfully toward local customs and traditions, which can cause problems between visitors and residents.

Ecotourism is becoming more popular among environmentally conscious travelers. This type of tourism focuses on traveling to natural areas in a way that protects the environment and helps local communities. Ecotourists often choose destinations that practice sustainable tourism and support conservation efforts.

Advancements in transportation have made travel faster and more accessible. Modern airplanes can carry hundreds of passengers across continents in just hours. High-speed trains connect major cities within countries. However, increased travel also means more carbon emissions, which contribute to climate change.

Despite the challenges, travel enriches our lives by broadening our perspectives and creating lasting memories. Many people save money for years to visit their dream destinations. Travel blogs and social media inspire others to explore new places and cultures around the world.`,
        questions: [
          {
            id: 1,
            question: "Why do many people like to travel?",
            type: "multiple_choice",
            options: ["To save money", "To experience different cultures", "To learn languages", "To buy souvenirs"],
            correctAnswer: 1,
            explanation: "The passage states 'Many people like to travel because it allows them to experience different cultures.'"
          },
          {
            id: 2,
            question: "What has made planning trips easier?",
            type: "multiple_choice",
            options: ["Travel agents", "Television shows", "The internet", "Friends' advice"],
            correctAnswer: 2,
            explanation: "The passage states 'The internet has made planning much easier because people can compare prices and read reviews from other travelers.'"
          },
          {
            id: 3,
            question: "How does tourism help local communities?",
            type: "multiple_choice",
            options: ["It teaches them languages", "It brings money", "It builds schools", "It creates problems"],
            correctAnswer: 1,
            explanation: "The passage states 'Tourism brings money to local communities... This money helps create jobs.'"
          },
          {
            id: 4,
            question: "What negative effect of tourism is mentioned?",
            type: "multiple_choice",
            options: ["Hotels are too expensive", "Destinations become overcrowded", "Food is different", "Locals are unfriendly"],
            correctAnswer: 1,
            explanation: "The passage states 'Popular destinations sometimes become overcrowded, which can damage the environment.'"
          },
          {
            id: 5,
            question: "What is ecotourism?",
            type: "multiple_choice",
            options: ["Cheap tourism", "Tourism that protects the environment", "Tourism to cities only", "Tourism without hotels"],
            correctAnswer: 1,
            explanation: "The passage states 'Ecotourism... focuses on traveling to natural areas in a way that protects the environment and helps local communities.'"
          },
          {
            id: 6,
            question: "What problem does increased travel create?",
            type: "multiple_choice",
            options: ["Higher prices", "More carbon emissions", "Lost luggage", "Language barriers"],
            correctAnswer: 1,
            explanation: "The passage states 'However, increased travel also means more carbon emissions, which contribute to climate change.'"
          },
          {
            id: 7,
            question: "What do ecotourists often support?",
            type: "multiple_choice",
            options: ["Cheap flights", "Conservation efforts", "Big hotels", "Fast travel"],
            correctAnswer: 1,
            explanation: "The passage states 'Ecotourists often choose destinations that practice sustainable tourism and support conservation efforts.'"
          },
          {
            id: 8,
            question: "What problem can some tourists cause?",
            type: "multiple_choice",
            options: ["They spend too much", "They behave disrespectfully", "They travel too much", "They take photos"],
            correctAnswer: 1,
            explanation: "The passage states 'Some tourists behave disrespectfully toward local customs and traditions.'"
          },
          {
            id: 9,
            question: "What helps people decide where to travel?",
            type: "multiple_choice",
            options: ["Travel blogs and social media", "TV commercials only", "Newspaper ads", "Random choice"],
            correctAnswer: 0,
            explanation: "The passage states 'Travel blogs and social media inspire others to explore new places.'"
          },
          {
            id: 10,
            question: "What do many people do to visit their dream destinations?",
            type: "multiple_choice",
            options: ["Buy tickets immediately", "Save money for years", "Work as tour guides", "Stay home instead"],
            correctAnswer: 1,
            explanation: "The passage states 'Many people save money for years to visit their dream destinations.'"
          },
          {
            id: 11,
            question: "What does the passage say travel does?",
            type: "multiple_choice",
            options: ["Broadens our perspectives", "Makes us richer", "Takes too long", "Is too expensive"],
            correctAnswer: 0,
            explanation: "The passage states 'Despite the challenges, travel enriches our lives by broadening our perspectives.'"
          },
          {
            id: 12,
            question: "What industry has become major because of tourism?",
            type: "multiple_choice",
            options: ["Farming", "Tourism", "Construction", "Technology"],
            correctAnswer: 1,
            explanation: "The passage states 'Tourism has become a major industry that creates jobs and helps local economies grow.'"
          },
          {
            id: 13,
            question: "What main industries benefit from tourism?",
            type: "multiple_choice",
            options: ["Hospitality and service", "Agriculture and farming", "Construction and mining", "Finance and banking"],
            correctAnswer: 0,
            explanation: "The passage states 'This money helps create jobs for local people in the hospitality and service industries.'"
          }
        ]
      },
      {
        id: 'climate-change',
        title: 'Understanding Climate Change',
        level: 'B1',
        content: `Climate change is one of the most pressing issues of our time. It refers to long-term changes in weather patterns and temperatures across the globe. Scientists have observed that the Earth's average temperature has increased significantly over the past century, with most warming occurring in recent decades.

The main cause of climate change is the increase in greenhouse gases in our atmosphere. These gases, particularly carbon dioxide from burning fossil fuels, trap heat from the sun. As a result, the Earth's temperature rises. Human activities such as deforestation, industrial processes, and transportation have dramatically increased greenhouse gas concentrations since the Industrial Revolution.

Climate change affects many aspects of our planet. Rising sea levels threaten coastal cities and small island nations. Changing weather patterns cause more frequent and severe storms, hurricanes, and wildfires. Some regions experience longer droughts and heatwaves, while others face increased flooding and heavy rainfall. These changes disrupt agriculture, water supplies, and ecosystems worldwide.

The impact on wildlife is severe. Many species struggle to adapt to rapidly changing temperatures and habitats. Polar ice melting threatens Arctic wildlife like polar bears and seals. Coral reefs are bleaching and dying due to warming ocean temperatures. These changes could lead to mass extinctions if action isn't taken soon.

Individuals can help reduce climate change through daily choices. Using less energy at home, walking or cycling instead of driving, eating more plant-based foods, and reducing waste all contribute to lowering emissions. Many people also switch to renewable energy sources for their homes or choose electric vehicles.

Governments and businesses play crucial roles in addressing climate change. National policies that limit carbon emissions, promote renewable energy, and protect forests are essential. International agreements like the Paris Agreement bring countries together to set emission reduction targets and share technologies.

The transition to clean energy is accelerating. Solar and wind power costs have plummeted, making renewable energy competitive with fossil fuels. Electric vehicle sales are increasing rapidly. Companies are committing to carbon-neutral operations. However, the scale of change needed remains enormous.

Despite challenges, many experts remain optimistic. Innovations in technology, changes in consumer behavior, and political will are creating momentum for climate action. The urgency grows each year as extreme weather events increase, but so does the determination to create a sustainable future for generations to come.`,
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
          },
          {
            id: 3,
            question: "What has increased greenhouse gases since the Industrial Revolution?",
            type: "multiple_choice",
            options: ["Natural events only", "Human activities", "Animal behavior", "Ocean changes"],
            correctAnswer: 1,
            explanation: "The passage states 'Human activities such as deforestation, industrial processes, and transportation have dramatically increased greenhouse gas concentrations since the Industrial Revolution.'"
          },
          {
            id: 4,
            question: "What threatens Arctic wildlife?",
            type: "multiple_choice",
            options: ["Pollution", "Overfishing", "Polar ice melting", "Tourism"],
            correctAnswer: 2,
            explanation: "The passage states 'Polar ice melting threatens Arctic wildlife like polar bears and seals.'"
          },
          {
            id: 5,
            question: "What is one way individuals can help reduce climate change?",
            type: "multiple_choice",
            options: ["Drive more often", "Use more energy", "Walk or cycle instead of driving", "Eat more meat"],
            correctAnswer: 2,
            explanation: "The passage states 'Using less energy at home, walking or cycling instead of driving... all contribute to lowering emissions.'"
          },
          {
            id: 6,
            question: "What agreement brings countries together to address climate change?",
            type: "multiple_choice",
            options: ["The Kyoto Protocol", "The Paris Agreement", "The UN Convention", "The Geneva Accord"],
            correctAnswer: 1,
            explanation: "The passage states 'International agreements like the Paris Agreement bring countries together to set emission reduction targets.'"
          },
          {
            id: 7,
            question: "Why are renewable energy sources becoming more popular?",
            type: "multiple_choice",
            options: ["They're expensive", "Costs have plummeted", "They don't work well", "They're less efficient"],
            correctAnswer: 1,
            explanation: "The passage states 'Solar and wind power costs have plummeted, making renewable energy competitive with fossil fuels.'"
          },
          {
            id: 8,
            question: "What problem affects coral reefs due to climate change?",
            type: "multiple_choice",
            options: ["Overfishing", "Bleaching and dying", "Pollution", "Too many tourists"],
            correctAnswer: 1,
            explanation: "The passage states 'Coral reefs are bleaching and dying due to warming ocean temperatures.'"
          },
          {
            id: 9,
            question: "What weather events are becoming more frequent due to climate change?",
            type: "multiple_choice",
            options: ["Mild days", "Severe storms and hurricanes", "Sunny skies", "Cool temperatures"],
            correctAnswer: 1,
            explanation: "The passage states 'Changing weather patterns cause more frequent and severe storms, hurricanes, and wildfires.'"
          },
          {
            id: 10,
            question: "What could happen to species if action isn't taken?",
            type: "multiple_choice",
            options: ["They will thrive", "Mass extinctions", "They will move", "No change"],
            correctAnswer: 1,
            explanation: "The passage states 'These changes could lead to mass extinctions if action isn't taken soon.'"
          },
          {
            id: 11,
            question: "What is an example of extreme weather increasing due to climate change?",
            type: "multiple_choice",
            options: ["Longer droughts and heatwaves", "Mild weather only", "Consistent temperatures", "Less rain"],
            correctAnswer: 0,
            explanation: "The passage states 'Some regions experience longer droughts and heatwaves, while others face increased flooding.'"
          },
          {
            id: 12,
            question: "What creates momentum for climate action according to experts?",
            type: "multiple_choice",
            options: ["International conflicts", "Technology innovations and political will", "Economic recession", "Population decline"],
            correctAnswer: 1,
            explanation: "The passage states 'Innovations in technology, changes in consumer behavior, and political will are creating momentum for climate action.'"
          },
          {
            id: 13,
            question: "What is the author's overall tone about climate change?",
            type: "multiple_choice",
            options: ["Very pessimistic", "Cautiously optimistic", "Indifferent", "Completely optimistic"],
            correctAnswer: 1,
            explanation: "The passage mentions challenges but ends with optimism about future action: 'many experts remain optimistic' and 'so does the determination to create a sustainable future.'"
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
          },
          {
            id: 3,
            question: "How old is the person?",
            type: "multiple_choice",
            options: ["20", "25", "30", "35"],
            correctAnswer: 2
          },
          {
            id: 4,
            question: "What is the person's job?",
            type: "multiple_choice",
            options: ["Teacher", "Student", "Engineer", "Doctor"],
            correctAnswer: 1
          },
          {
            id: 5,
            question: "What does the person like to do?",
            type: "multiple_choice",
            options: ["Read books", "Play sports", "Watch movies", "Cook"],
            correctAnswer: 0
          },
          {
            id: 6,
            question: "Where does the person live?",
            type: "multiple_choice",
            options: ["In a house", "In an apartment", "In a dormitory", "With family"],
            correctAnswer: 1
          },
          {
            id: 7,
            question: "What is the person's favorite subject?",
            type: "multiple_choice",
            options: ["Math", "English", "Science", "History"],
            correctAnswer: 2
          },
          {
            id: 8,
            question: "How many siblings does the person have?",
            type: "multiple_choice",
            options: ["None", "One", "Two", "Three"],
            correctAnswer: 2
          },
          {
            id: 9,
            question: "What is the person's hobby?",
            type: "multiple_choice",
            options: ["Swimming", "Reading", "Music", "Traveling"],
            correctAnswer: 1
          },
          {
            id: 10,
            question: "What is the person studying?",
            type: "multiple_choice",
            options: ["Business", "Medicine", "Engineering", "Arts"],
            correctAnswer: 0
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
          },
          {
            id: 3,
            question: "What color does the customer prefer?",
            type: "multiple_choice",
            options: ["Red", "Blue", "Green", "Black"],
            correctAnswer: 2
          },
          {
            id: 4,
            question: "How much does it cost?",
            type: "multiple_choice",
            options: ["$30", "$40", "$50", "$60"],
            correctAnswer: 2
          },
          {
            id: 5,
            question: "What payment method does the customer use?",
            type: "multiple_choice",
            options: ["Cash", "Credit card", "Debit card", "Mobile payment"],
            correctAnswer: 1
          },
          {
            id: 6,
            question: "Does the store offer gift wrapping?",
            type: "multiple_choice",
            options: ["Yes, it's free", "Yes, for $5", "No", "Only on weekends"],
            correctAnswer: 1
          },
          {
            id: 7,
            question: "What is the store's return policy?",
            type: "multiple_choice",
            options: ["No returns", "7 days", "14 days", "30 days"],
            correctAnswer: 2
          },
          {
            id: 8,
            question: "Can the customer try it on?",
            type: "multiple_choice",
            options: ["Yes, in the fitting room", "No", "Only small sizes", "After payment"],
            correctAnswer: 0
          },
          {
            id: 9,
            question: "Is there a discount available?",
            type: "multiple_choice",
            options: ["10% off today", "20% off today", "No discount", "Student discount only"],
            correctAnswer: 0
          },
          {
            id: 10,
            question: "Where can the customer pick up their purchase?",
            type: "multiple_choice",
            options: ["At the counter", "By the window", "In the back room", "On the second floor"],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 'restaurant-conversation',
        title: 'Restaurant Conversation',
        audioUrl: '/api/audio/ielts-listening-a2-sample-2.mp3',
        level: 'A2',
        questions: [
          {
            id: 1,
            question: "What time is the reservation for?",
            type: "multiple_choice",
            options: ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
            correctAnswer: 1
          },
          {
            id: 2,
            question: "How many people are in the reservation?",
            type: "multiple_choice",
            options: ["Two", "Three", "Four", "Five"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "What type of table does the customer prefer?",
            type: "multiple_choice",
            options: ["By the window", "In a quiet corner", "Near the entrance", "In the smoking section"],
            correctAnswer: 1
          },
          {
            id: 4,
            question: "What is the customer's dietary preference?",
            type: "multiple_choice",
            options: ["Vegetarian", "Vegan", "Gluten-free", "No restrictions"],
            correctAnswer: 3
          },
          {
            id: 5,
            question: "What is the name for the reservation?",
            type: "multiple_choice",
            options: ["Smith", "Johnson", "Williams", "Brown"],
            correctAnswer: 1
          },
          {
            id: 6,
            question: "Do they need a high chair?",
            type: "multiple_choice",
            options: ["Yes", "No", "Not sure", "Maybe"],
            correctAnswer: 0
          },
          {
            id: 7,
            question: "What is the special of the day?",
            type: "multiple_choice",
            options: ["Fish and chips", "Pasta", "Burger", "Salad"],
            correctAnswer: 0
          },
          {
            id: 8,
            question: "What drink does the waiter recommend?",
            type: "multiple_choice",
            options: ["Wine", "Beer", "Juice", "Water"],
            correctAnswer: 0
          },
          {
            id: 9,
            question: "How long is the estimated wait time?",
            type: "multiple_choice",
            options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"],
            correctAnswer: 1
          },
          {
            id: 10,
            question: "What is the cancellation policy?",
            type: "multiple_choice",
            options: ["Free until 1 hour before", "No cancellation", "$10 fee", "Full refund always"],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 'airport-announcement',
        title: 'Airport Announcement',
        audioUrl: '/api/audio/ielts-listening-a2-sample-3.mp3',
        level: 'A2',
        questions: [
          {
            id: 1,
            question: "Which flight is delayed?",
            type: "multiple_choice",
            options: ["Flight 234", "Flight 345", "Flight 456", "Flight 567"],
            correctAnswer: 2
          },
          {
            id: 2,
            question: "What is the new departure time?",
            type: "multiple_choice",
            options: ["12:30", "13:00", "13:30", "14:00"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "Which gate is the flight leaving from?",
            type: "multiple_choice",
            options: ["Gate 5", "Gate 10", "Gate 15", "Gate 20"],
            correctAnswer: 2
          },
          {
            id: 4,
            question: "What is the reason for the delay?",
            type: "multiple_choice",
            options: ["Weather", "Mechanical issue", "Late crew", "Security check"],
            correctAnswer: 1
          },
          {
            id: 5,
            question: "Where should passengers go for more information?",
            type: "multiple_choice",
            options: ["Gate 5", "Information desk", "Security", "Check-in counter"],
            correctAnswer: 1
          },
          {
            id: 6,
            question: "What compensation is offered?",
            type: "multiple_choice",
            options: ["Food voucher", "Flight credit", "Refund", "Nothing"],
            correctAnswer: 0
          },
          {
            id: 7,
            question: "How long is the estimated delay?",
            type: "multiple_choice",
            options: ["30 minutes", "1 hour", "2 hours", "3 hours"],
            correctAnswer: 1
          },
          {
            id: 8,
            question: "Which airline is making the announcement?",
            type: "multiple_choice",
            options: ["Airline A", "Airline B", "Airline C", "Airline D"],
            correctAnswer: 2
          },
          {
            id: 9,
            question: "What should passengers do immediately?",
            type: "multiple_choice",
            options: ["Go to gate", "Stay in waiting area", "Contact airline", "Leave airport"],
            correctAnswer: 1
          },
          {
            id: 10,
            question: "Are meals being served during the wait?",
            type: "multiple_choice",
            options: ["Yes, free", "Yes, for $10", "No", "At gate only"],
            correctAnswer: 0
          }
        ]
      },
      {
        id: 'hotel-booking',
        title: 'Hotel Booking',
        audioUrl: '/api/audio/ielts-listening-a2-sample-4.mp3',
        level: 'A2',
        questions: [
          {
            id: 1,
            question: "How many nights is the booking for?",
            type: "multiple_choice",
            options: ["2 nights", "3 nights", "4 nights", "5 nights"],
            correctAnswer: 2
          },
          {
            id: 2,
            question: "What type of room does the guest want?",
            type: "multiple_choice",
            options: ["Single", "Double", "Twin", "Suite"],
            correctAnswer: 2
          },
          {
            id: 3,
            question: "What view does the guest prefer?",
            type: "multiple_choice",
            options: ["Ocean view", "City view", "Garden view", "Mountain view"],
            correctAnswer: 1
          },
          {
            id: 4,
            question: "What is the check-in time?",
            type: "multiple_choice",
            options: ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
            correctAnswer: 2
          },
          {
            id: 5,
            question: "Does the guest need parking?",
            type: "multiple_choice",
            options: ["Yes, included", "Yes, $10/day", "No", "Not sure"],
            correctAnswer: 0
          },
          {
            id: 6,
            question: "What is the total price?",
            type: "multiple_choice",
            options: ["$200", "$250", "$300", "$350"],
            correctAnswer: 2
          },
          {
            id: 7,
            question: "What breakfast option is chosen?",
            type: "multiple_choice",
            options: ["Full breakfast", "Continental only", "No breakfast", "Room service"],
            correctAnswer: 1
          },
          {
            id: 8,
            question: "What is the cancellation policy?",
            type: "multiple_choice",
            options: ["Free until 24h before", "Free until 48h before", "$50 fee", "No refund"],
            correctAnswer: 1
          },
          {
            id: 9,
            question: "What amenities does the guest request?",
            type: "multiple_choice",
            options: ["Wi-Fi", "Gym access", "Pool access", "Spa access"],
            correctAnswer: 0
          },
          {
            id: 10,
            question: "What is the guest's special request?",
            type: "multiple_choice",
            options: ["Late checkout", "Early check-in", "Extra towels", "Quiet floor"],
            correctAnswer: 0
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
    // For IELTS Reading, we need 3 passages with 40 questions total
    const availablePassages = level 
      ? skillContent.passages.filter(p => p.level === level)
      : skillContent.passages;
    
    if (availablePassages.length < 3) {
      // If not enough passages for this level, return null to trigger AI fallback
      // This ensures each level gets content appropriate to its difficulty
      return null;
    }
    
    // Select 3 random passages for IELTS format
    const selectedPassages = [];
    const shuffled = [...availablePassages].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 3; i++) {
      selectedPassages.push(shuffled[i]);
    }
    
    // Combine all 3 passages into one
    const combinedPassage = {
      id: selectedPassages.map(p => p.id).join('-'),
      title: `Reading Test - ${selectedPassages.length} Passages`,
      level: level || 'mixed',
      content: selectedPassages.map((p, idx) => 
        `\n**PASSAGE ${idx + 1}: ${p.title}**\n\n${p.content}`
      ).join('\n\n---\n'),
      questions: selectedPassages.flatMap((p, passageIdx) => 
        p.questions.map((q, qIdx) => ({
          ...q,
          id: passageIdx * 100 + q.id, // Ensure unique IDs
          passage: passageIdx + 1
        }))
      )
    };
    
    return combinedPassage;
  }
  
  if (skill === 'writing') {
    // For IELTS Writing, we need 2 tasks: Task 1 and Task 2
    const tasks = level 
      ? skillContent.tasks.filter(t => t.level === level)
      : skillContent.tasks;
    
    // Check if we have at least one Task 1 and one Task 2 for this level
    const task1Candidates = tasks.filter(t => t.type.includes('Task 1'));
    const task2Candidates = tasks.filter(t => t.type.includes('Task 2'));
    
    if (task1Candidates.length === 0 || task2Candidates.length === 0) {
      // Not enough tasks for this level, return null to trigger AI fallback
      return null;
    }
    
    // Select 2 random tasks: one Task 1 and one Task 2
    const selectedTask1 = task1Candidates[Math.floor(Math.random() * task1Candidates.length)];
    const selectedTask2 = task2Candidates[Math.floor(Math.random() * task2Candidates.length)];
    
    // Format as array for frontend
    return {
      tasks: [
        { ...selectedTask1, order: 1 },
        { ...selectedTask2, order: 2 }
      ],
      timeLimit: 60 // Total time for both tasks
    };
  }
  
  if (skill === 'listening') {
    // For IELTS Listening, we need 4 sections with 40 questions total
    const availableSections = level 
      ? skillContent.audioFiles.filter(a => a.level === level)
      : skillContent.audioFiles;
    
    if (availableSections.length < 4) {
      // If not enough, return null to trigger AI fallback
      return null;
    }
    
    // Select 4 random sections for IELTS format
    const selectedSections = [];
    const shuffled = [...availableSections].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 4; i++) {
      selectedSections.push(shuffled[i]);
    }
    
    return {
      sections: selectedSections,
      totalQuestions: selectedSections.reduce((sum, s) => sum + (s.questions?.length || 0), 0)
    };
  }
  
  if (skill === 'speaking') {
    // For IELTS Speaking, we need 3 parts: Part 1, Part 2, Part 3
    const topics = level 
      ? skillContent.topics.filter(t => t.level === level)
      : skillContent.topics;
    
    // Check if we have at least one topic for each part
    const part1Candidates = topics.filter(t => t.part === 1);
    const part2Candidates = topics.filter(t => t.part === 2);
    const part3Candidates = topics.filter(t => t.part === 3);
    
    if (part1Candidates.length === 0 || part2Candidates.length === 0 || part3Candidates.length === 0) {
      // Not enough topics for this level, return null to trigger AI fallback
      return null;
    }
    
    // Select 3 topics: one for each part
    const selectedPart1 = part1Candidates[Math.floor(Math.random() * part1Candidates.length)];
    const selectedPart2 = part2Candidates[Math.floor(Math.random() * part2Candidates.length)];
    const selectedPart3 = part3Candidates[Math.floor(Math.random() * part3Candidates.length)];
    
    // Format as array for frontend
    return {
      parts: [
        { ...selectedPart1, order: 1 },
        { ...selectedPart2, order: 2 },
        { ...selectedPart3, order: 3 }
      ],
      timeLimit: 14 // Total time for speaking test
    };
  }

  return null;
};

const getAllContent = (skill) => {
  return contentDatabase[skill] || null;
};

// New AI-powered content generation using templates
const generateWithAITemplate = async (skill, level) => {
  try {
    // Import templates and mapper
    const readingTemplate = require('../prompts/ieltsTemplates/readingTemplate');
    const listeningTemplate = require('../prompts/ieltsTemplates/listeningTemplate');
    const writingTemplate = require('../prompts/ieltsTemplates/writingTemplate');
    const speakingTemplate = require('../prompts/ieltsTemplates/speakingTemplate');
    const { normalizeBand, getDifficultyParams } = require('../utils/levelMapper');
    
    // Normalize level
    const normalized = normalizeBand(level);
    const difficultyParams = getDifficultyParams(normalized.cefr);
    
    // Get appropriate template
    let template;
    let systemPrompt;
    
    switch(skill) {
      case 'reading':
        template = readingTemplate[normalized.cefr];
        systemPrompt = `${template.promptTemplate}\n\nDifficulty Parameters: ${JSON.stringify(difficultyParams)}`;
        break;
      case 'listening':
        template = listeningTemplate[normalized.cefr];
        systemPrompt = `${template.promptTemplate}\n\nDifficulty Parameters: ${JSON.stringify(difficultyParams)}`;
        break;
      case 'writing':
        template = writingTemplate[normalized.cefr];
        systemPrompt = `${template.promptTemplate}\n\nDifficulty Parameters: ${JSON.stringify(difficultyParams)}`;
        break;
      case 'speaking':
        template = speakingTemplate[normalized.cefr];
        systemPrompt = `${template.promptTemplate}\n\nDifficulty Parameters: ${JSON.stringify(difficultyParams)}`;
        break;
      default:
        return null;
    }
    
    // If no OpenAI API key, return null to use fallback
    if (!process.env.OPENAI_API_KEY) {
      return null;
    }
    
    // Skip OpenAI calls during test/deploy to prevent timeout
    if (process.env.NODE_ENV === 'test') {
      console.log('[ContentGenerator] Skipping OpenAI call during test/deploy');
      return null;
    }
    
    // Call OpenAI
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a complete ${skill} test for level ${normalized.cefr} (band ${normalized.numeric}).` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    // Parse response
    let aiContent;
    try {
      const content = aiResponse.choices[0].message.content;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      aiContent = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error('AI response parse error:', parseError.message);
      return null;
    }
    
    return aiContent;
  } catch (error) {
    console.error('AI generation error:', error.message);
    return null;
  }
};

module.exports = {
  getRandomContent,
  getAllContent,
  contentDatabase,
  generateWithAITemplate // Export new function
};
