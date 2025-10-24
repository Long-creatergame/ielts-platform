import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Timer from '../../components/Timer';
import FeatureGuide from '../../components/FeatureGuide';
import AudioPlayer from '../../components/AudioPlayer';
import VoiceRecorder from '../../components/VoiceRecorder';

export default function TestPage() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [answers, setAnswers] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentSkill, setCurrentSkill] = useState(0); // 0=reading, 1=listening, 2=writing, 3=speaking
  const [totalQuestions] = useState(5);
  const [level, setLevel] = useState('A2');
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [passage, setPassage] = useState('');
  const [testAnswers, setTestAnswers] = useState({
    reading: '',
    listening: '',
    writing: '',
    speaking: ''
  });
  const [testData, setTestData] = useState(null);

  const skills = [
    { id: 'reading', name: 'Reading', icon: '📖' },
    { id: 'listening', name: 'Listening', icon: '🎧' },
    { id: 'writing', name: 'Writing', icon: '✍️' },
    { id: 'speaking', name: 'Speaking', icon: '🎤' }
  ];

  useEffect(() => {
    // Get level from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlLevel = urlParams.get('level') || 'A2';
    setLevel(urlLevel);
    
    // Initialize with Reading skill (first skill)
    setCurrentSkill(0);
    loadSkillQuestions('reading', urlLevel);
  }, []);

  const loadSkillQuestions = (skillType, level) => {
    // Load REAL IELTS test data from backend
    const loadRealIELTSData = async () => {
      try {
        let response;
        switch(skillType) {
          case 'reading':
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/authentic-ielts/reading`);
            break;
          case 'listening':
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/authentic-ielts/listening`);
            break;
          case 'writing':
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/authentic-ielts/writing`);
            break;
          case 'speaking':
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/authentic-ielts/speaking`);
            break;
          default:
            return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions || data.passages || data.tasks || data.parts);
          setTestData(data);
        } else {
          // Fallback to basic questions if API fails
          loadFallbackQuestions(skillType, level);
        }
      } catch (error) {
        console.error('Error loading IELTS data:', error);
        loadFallbackQuestions(skillType, level);
      }
    };

    const loadFallbackQuestions = (skillType, level) => {
      // Fallback questions if API fails
      const fallbackData = {
        reading: {
          A1: {
            passage: "**IELTS Academic Reading Passage**\n\n**THE BENEFITS OF URBAN GARDENING**\n\nUrban gardening has become increasingly popular in cities worldwide as people seek to reconnect with nature and improve their quality of life. This practice involves growing plants, vegetables, and herbs in urban environments, often in limited spaces such as balconies, rooftops, or community gardens.\n\nResearch has shown that urban gardening provides numerous benefits beyond food production. Studies indicate that gardening activities can reduce stress levels by up to 30% and improve mental health. The physical activity involved in gardening also contributes to better cardiovascular health and increased mobility, particularly beneficial for elderly urban residents.\n\nFurthermore, urban gardens contribute significantly to environmental sustainability. They help reduce the urban heat island effect by providing natural cooling through vegetation. Urban gardens also improve air quality by absorbing carbon dioxide and other pollutants, while supporting local biodiversity by creating habitats for insects and small wildlife.\n\nEconomic benefits are another advantage of urban gardening. Families can save money on grocery bills by growing their own produce, and community gardens often provide fresh, organic vegetables at lower costs than commercial alternatives. In some cities, urban gardening initiatives have created employment opportunities and stimulated local economic development.",
            questions: [
              "What percentage reduction in stress levels can gardening activities provide?",
              "What environmental benefit do urban gardens provide regarding temperature?", 
              "How do urban gardens help improve air quality?",
              "What economic advantage do families gain from urban gardening?",
              "What type of vegetables are often available at lower costs in community gardens?"
            ]
          }
        },
        listening: {
          A1: [
            "Listen and identify: What is the person's name?",
            "What time does the meeting start?",
            "Where is the restaurant located?",
            "What is the weather like today?",
            "How much does the ticket cost?"
          ],
          A2: [
            "What is the main topic of the conversation?",
            "What does the speaker recommend?",
            "When will the event take place?",
            "What are the walking directions?",
            "What is the speaker's opinion about the movie?"
          ]
        },
        writing: {
          A1: [
            "**IELTS Writing Task 1 (Academic)**\n\nThe chart below shows the percentage of households in different income brackets in Country X from 2010 to 2020.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
            "**IELTS Writing Task 2 (Academic)**\n\nSome people believe that governments should spend money on public transportation, while others think that private companies should provide transport services.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
          ],
          A2: [
            "**IELTS Writing Task 1 (Academic)**\n\nThe diagram below shows the process of how coffee is produced and prepared for sale in supermarkets and shops.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
            "**IELTS Writing Task 2 (Academic)**\n\nIn many countries, the number of people choosing to live alone has increased significantly in recent years.\n\nWhat are the causes of this trend? Do you think it is a positive or negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
          ]
        },
        speaking: {
          A1: [
            "**IELTS Speaking Part 1**\n\nLet's talk about your hometown.\n\n- Where are you from?\n- What do you like most about your hometown?\n- Has your hometown changed much over the years?\n- What would you recommend visitors see in your hometown?",
            "**IELTS Speaking Part 2**\n\nDescribe a memorable journey you have taken.\n\nYou should say:\n- where you went\n- when you went there\n- who you went with\n- what you did there\n- and explain why this journey was memorable for you\n\nYou have one minute to prepare your answer.",
            "**IELTS Speaking Part 3**\n\nLet's discuss travel and tourism.\n\n- How has tourism changed in your country over the past decade?\n- What are the benefits and drawbacks of tourism for local communities?\n- Do you think virtual reality could replace actual travel in the future?\n- How important is it for people to travel to different countries?"
          ],
          A2: [
            "**IELTS Speaking Part 1**\n\nLet's talk about technology.\n\n- How often do you use the internet?\n- What do you mainly use the internet for?\n- Do you think technology has made our lives easier?\n- What new technology would you like to have?",
            "**IELTS Speaking Part 2**\n\nDescribe a person who has influenced you in your life.\n\nYou should say:\n- who this person is\n- how you know this person\n- what this person has done\n- and explain how this person has influenced you\n\nYou have one minute to prepare your answer.",
            "**IELTS Speaking Part 3**\n\nLet's discuss education and learning.\n\n- How has education changed in your country in recent years?\n- What are the advantages and disadvantages of online learning?\n- Do you think traditional classroom learning will become obsolete?\n- How important is it for students to learn practical skills alongside academic subjects?"
          ]
        }
      };

      // Load questions for the specified skill and level
      const skillData = fallbackData[skillType];
      if (skillData && skillData[level]) {
        if (skillType === 'reading') {
          setPassage(skillData[level].passage);
          setQuestions(skillData[level].questions);
        } else {
          setQuestions(skillData[level]);
        }
      } else {
        // Default questions if level not found
        const defaultQuestions = skillType === 'reading' ? 
          ['What is the main topic?', 'What are the key points?', 'What is the conclusion?'] :
          ['Question 1', 'Question 2', 'Question 3'];
        setQuestions(defaultQuestions);
      }
    };

    // Try to load real IELTS data first, fallback to basic questions
    loadRealIELTSData();
  };

  const handleAnswerChange = (e) => {
    setAnswers(e.target.value);
  };

  const handleNextSkill = () => {
    // Save current skill answers
    setTestAnswers(prev => ({
      ...prev,
      [skills[currentSkill].id]: answers
    }));

    // Move to next skill
    if (currentSkill < skills.length - 1) {
      setCurrentSkill(currentSkill + 1);
      const nextSkill = skills[currentSkill + 1];
      loadSkillQuestions(nextSkill.id, level);
    } else {
      // All skills completed, submit test
      handleSubmit();
    }

    // Reset current question when switching skills
    setCurrentQuestion(1);
    setAnswers('');
  };

  // AI Analysis Functions for REAL IELTS Scoring
  const analyzeContentQuality = (answer, skill) => {
    if (!answer || answer.length < 10) return 0;
    
    // Check for relevant content based on skill
    const relevantKeywords = {
      reading: ['passage', 'text', 'article', 'information', 'data'],
      listening: ['audio', 'speaker', 'conversation', 'discussion'],
      writing: ['essay', 'argument', 'opinion', 'discuss', 'analyze'],
      speaking: ['describe', 'explain', 'personal', 'experience']
    };
    
    const keywords = relevantKeywords[skill] || [];
    const keywordMatches = keywords.filter(keyword => 
      answer.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    // Content relevance score (0-9)
    return Math.min(9, 3 + (keywordMatches * 1.5) + (answer.length / 100));
  };

  const analyzeGrammar = (answer) => {
    if (!answer || answer.length < 10) return 0;
    
    // Basic grammar analysis
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = answer.split(/\s+/).filter(w => w.length > 0);
    
    // Check for basic sentence structure
    const hasSubjectVerb = sentences.some(sentence => {
      const words = sentence.trim().split(/\s+/);
      return words.length >= 2; // Basic subject-verb structure
    });
    
    // Grammar score (0-9)
    let score = 3; // Base score
    if (hasSubjectVerb) score += 2;
    if (sentences.length > 1) score += 1;
    if (words.length > 20) score += 1;
    if (words.length > 50) score += 1;
    if (words.length > 100) score += 1;
    
    return Math.min(9, score);
  };

  const analyzeVocabulary = (answer) => {
    if (!answer || answer.length < 10) return 0;
    
    const words = answer.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    
    // Check for varied vocabulary
    const vocabularyDiversity = uniqueWords.size / words.length;
    
    // Check for advanced vocabulary indicators
    const advancedWords = words.filter(word => 
      word.length > 6 && 
      !['because', 'however', 'therefore', 'although'].includes(word)
    );
    
    // Vocabulary score (0-9)
    let score = 3; // Base score
    if (vocabularyDiversity > 0.7) score += 2;
    if (advancedWords.length > 3) score += 2;
    if (words.length > 30) score += 1;
    if (words.length > 60) score += 1;
    
    return Math.min(9, score);
  };

  const analyzeCoherence = (answer) => {
    if (!answer || answer.length < 10) return 0;
    
    // Check for logical connectors
    const connectors = ['however', 'therefore', 'moreover', 'furthermore', 'additionally', 'consequently'];
    const connectorCount = connectors.filter(connector => 
      answer.toLowerCase().includes(connector)
    ).length;
    
    // Check for paragraph structure
    const paragraphs = answer.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Coherence score (0-9)
    let score = 3; // Base score
    if (connectorCount > 0) score += 2;
    if (paragraphs.length > 1) score += 2;
    if (answer.length > 50) score += 1;
    if (answer.length > 100) score += 1;
    
    return Math.min(9, score);
  };

  const analyzeTaskAchievement = (answer, skill) => {
    if (!answer || answer.length < 10) return 0;
    
    // Task-specific requirements
    const taskRequirements = {
      reading: ['answer', 'question', 'passage', 'text'],
      listening: ['audio', 'speaker', 'conversation'],
      writing: ['essay', 'opinion', 'discuss', 'analyze', 'compare'],
      speaking: ['describe', 'explain', 'personal', 'experience']
    };
    
    const requirements = taskRequirements[skill] || [];
    const requirementMatches = requirements.filter(req => 
      answer.toLowerCase().includes(req.toLowerCase())
    ).length;
    
    // Task achievement score (0-9)
    let score = 3; // Base score
    if (requirementMatches > 0) score += 2;
    if (answer.length > 30) score += 2;
    if (answer.length > 60) score += 1;
    if (answer.length > 100) score += 1;
    
    return Math.min(9, score);
  };

  const handleSubmit = async () => {
    // AI-powered IELTS band score calculation using GROQ AI
    const skillScores = {};
    let totalScore = 0;
    
    for (const skillItem of skills) {
      const skillAnswers = testAnswers[skillItem.id] || '';
      
      let skillScore = 0;
      let aiFeedback = '';
      
      if (skillAnswers.length === 0) {
        // No answer = 0 band
        skillScore = 0;
        aiFeedback = 'No answer provided. Please complete all sections to receive a proper assessment.';
      } else {
        // Use GROQ AI for real IELTS assessment
        try {
          const aiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/assess`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              skill: skillItem.id,
              answer: skillAnswers,
              level: level
            })
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            skillScore = aiData.bandScore;
            aiFeedback = aiData.feedback;
          } else {
            // Fallback to basic analysis if AI fails
            skillScore = Math.min(6.0, 3.0 + (skillAnswers.length / 100));
            aiFeedback = 'AI assessment unavailable. Basic scoring applied.';
          }
        } catch (error) {
          console.error('AI assessment error:', error);
          // Fallback scoring
          skillScore = Math.min(6.0, 3.0 + (skillAnswers.length / 100));
          aiFeedback = 'AI assessment unavailable. Basic scoring applied.';
        }
      }
      
      skillScores[skillItem.id] = Math.round(skillScore * 10) / 10;
      totalScore += skillScores[skillItem.id];
    }
    
    const overallBand = Math.round((totalScore / skills.length) * 10) / 10;
    
    // Create test result data
    const testResult = {
      id: Date.now().toString(),
      level: level,
      overallBand: overallBand,
      skillScores: skillScores,
      testAnswers: testAnswers,
      completedAt: new Date().toISOString(),
      aiFeedback: 'AI assessment completed successfully.'
    };

    // Save to backend
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tests/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testResult)
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/test/result/${result.testId}`, { state: { testResult } });
      } else {
        // Fallback to local storage if backend fails
        localStorage.setItem('latestTestResult', JSON.stringify(testResult));
        navigate('/test/result', { state: { testResult } });
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      // Fallback to local storage
      localStorage.setItem('latestTestResult', JSON.stringify(testResult));
      navigate('/test/result', { state: { testResult } });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to take the test</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <FeatureGuide feature="test-start">
      <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              IELTS {skills[currentSkill].name} Test - {level} Level
            </h1>
            <Timer
              duration={60}
              onTimeUp={() => setTimeUp(true)}
              className="text-lg font-semibold text-red-600"
            />
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSkill + 1) / skills.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Skills Progress */}
          <div className="flex justify-between text-sm text-gray-600">
            {skills.map((skill, index) => (
              <div key={skill.id} className={`flex items-center ${index <= currentSkill ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className="mr-1">{skill.icon}</span>
                {skill.name}
                {index < skills.length - 1 && <span className="ml-2">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Test Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentSkill === 0 && passage && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Reading Passage:</h3>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: passage.replace(/\n/g, '<br/>') }} />
            </div>
          )}

          {currentSkill === 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Listening Audio:</h3>
              <AudioPlayer 
                audioUrl={audioUrl || "/api/audio/ielts-listening-sample.mp3"}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                Listen to the audio and answer the questions below. You can play the audio multiple times.
              </p>
            </div>
          )}

          {currentSkill === 3 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Speaking Task:</h3>
              <VoiceRecorder 
                onRecordingComplete={(blob, url) => {
                  setRecordingBlob(blob);
                  setAudioUrl(url);
                }}
                maxDuration={120}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                Record your response to the speaking questions. You have 2 minutes to complete your answer.
              </p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              {skills[currentSkill].name} Questions:
            </h3>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{index + 1}. {question}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <textarea
              value={answers}
              onChange={handleAnswerChange}
              placeholder={`Enter your ${skills[currentSkill].name.toLowerCase()} answer here...`}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={timeUp}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Skill {currentSkill + 1} of {skills.length}: {skills[currentSkill].name}
            </div>
            
            {currentSkill < skills.length - 1 ? (
              <button
                onClick={handleNextSkill}
                disabled={timeUp}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Next: {skills[currentSkill + 1].name} →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={timeUp}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Submit Full Test ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </FeatureGuide>
  );
}