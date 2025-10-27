// Script to generate sample audio files for IELTS Listening
const fs = require('fs');
const path = require('path');

// Sample listening content
const listeningContent = {
  'ielts-listening-sample-1.mp3': {
    title: "University Course Discussion",
    content: `Good morning, everyone. Today we're going to discuss the course requirements for this semester. 

First, let me introduce myself. I'm Professor Johnson, and I'll be teaching this course on Environmental Science. The course is designed for second-year students who have completed the basic requirements.

Now, regarding the course structure, we have four main components. The first is lectures, which will be held every Tuesday and Thursday from 9 AM to 10:30 AM in Room 205. The second component is laboratory work, scheduled for Friday afternoons from 2 PM to 5 PM.

The third component is field trips. We'll have three field trips this semester. The first one is to the local nature reserve next week. The second trip is to the recycling center in mid-October. And the final trip is to the solar energy facility in November.

Finally, we have the assessment. There will be two written exams worth 40% each, and a final project worth 20%. The first exam is scheduled for October 15th, and the second exam is on December 3rd.

Any questions so far?`
  },
  'ielts-listening-sample-2.mp3': {
    title: "Library Information",
    content: `Welcome to the university library. I'm Sarah, and I'll be showing you around today.

The library is open seven days a week. Our opening hours are Monday to Friday from 8 AM to 10 PM, and weekends from 9 AM to 6 PM. During exam periods, we extend our hours until midnight.

We have five floors in total. The ground floor contains the main desk, computer labs, and group study rooms. The first floor has the general collection and newspapers. The second floor is dedicated to science and technology books. The third floor houses the humanities section, and the fourth floor contains rare books and special collections.

To borrow books, you need your student ID card. You can borrow up to 15 books at a time for a period of two weeks. You can renew books online or by phone, but only if no one else has reserved them.

We also have an online database with access to thousands of academic journals and e-books. You can access this from anywhere on campus using your student login.

Is there anything specific you'd like to know about our services?`
  },
  'ielts-listening-sample-3.mp3': {
    title: "Job Interview",
    content: `Good afternoon, Ms. Chen. Thank you for coming in today. I'm David from Human Resources, and this is my colleague, Lisa from the Marketing Department.

Let me start by asking you about your previous experience. I see you worked at ABC Company for two years. Could you tell us about your main responsibilities there?

That's very interesting. And what made you decide to leave that position?

Now, looking at this role, we're looking for someone who can manage our social media accounts and develop marketing campaigns. What experience do you have with social media marketing?

I see. And how do you stay updated with the latest trends in digital marketing?

Finally, where do you see yourself in five years' time?

Thank you for your time today, Ms. Chen. We'll be in touch within the next week to let you know our decision.`
  }
};

// Create placeholder audio files (in real implementation, you would use text-to-speech)
const createPlaceholderAudio = () => {
  const audioDir = path.join(__dirname, '../audio');
  
  Object.keys(listeningContent).forEach(filename => {
    const filePath = path.join(audioDir, filename);
    
    // Create a simple text file as placeholder (in real app, this would be actual audio)
    const content = listeningContent[filename];
    const placeholderContent = `# ${content.title}\n\n${content.content}\n\n[This is a placeholder audio file. In production, this would be actual MP3 audio generated from the text above using text-to-speech.]`;
    
    fs.writeFileSync(filePath.replace('.mp3', '.txt'), placeholderContent);
  });
  
  console.log('Placeholder audio files created successfully!');
  console.log('In production, replace these with actual MP3 files generated from the text content.');
};

// Generate the files
createPlaceholderAudio();

module.exports = { listeningContent };
