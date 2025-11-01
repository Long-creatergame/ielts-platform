/**
 * IELTS Test Generator Controller
 * Uses AI templates to generate authentic IELTS test content
 */

import OpenAI from "openai";
import { writingTemplates } from "../prompts/ieltsTemplates/writingTemplate.js";
import { speakingTemplates } from "../prompts/ieltsTemplates/speakingTemplate.js";
import { readingTemplates } from "../prompts/ieltsTemplates/readingTemplate.js";
import { listeningTemplates } from "../prompts/ieltsTemplates/listeningTemplate.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Convert numeric band score to CEFR level
 */
export const bandToCEFR = (band) => {
  const num = parseFloat(band);
  if (isNaN(num)) return "B1"; // Default
  
  if (num < 3.0) return "A1";
  if (num < 4.0) return "A2";
  if (num < 5.0) return "B1";
  if (num < 6.0) return "B2";
  if (num < 7.0) return "C1";
  return "C2";
};

/**
 * Generate IELTS test content using AI templates
 */
export const generateIELTSTest = async (req, res) => {
  try {
    const { skill, level, topic } = req.body;

    // Validate input
    if (!skill || !['reading', 'listening', 'writing', 'speaking'].includes(skill)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid skill. Must be reading, listening, writing, or speaking." 
      });
    }

    if (!level) {
      return res.status(400).json({ 
        success: false, 
        message: "Level is required. Use A1, A2, B1, B2, C1, C2 or band score 3-9." 
      });
    }

    // Normalize level
    const levelMap = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const normalizedLevel = levelMap.includes(level.toUpperCase()) 
      ? level.toUpperCase() 
      : bandToCEFR(level);

    // Get template
    const templates = { 
      writing: writingTemplates, 
      speaking: speakingTemplates, 
      reading: readingTemplates, 
      listening: listeningTemplates 
    };
    
    const baseTemplate = templates[skill]?.[normalizedLevel];

    if (!baseTemplate) {
      return res.status(400).json({ 
        success: false, 
        message: `Template not found for ${skill} level ${normalizedLevel}` 
      });
    }

    // Generate using OpenAI if available
    if (!openai) {
      return res.status(503).json({ 
        success: false, 
        message: "AI service unavailable. Please check OpenAI API configuration." 
      });
    }

    // Build system prompt based on template
    const systemPrompt = buildSystemPrompt(skill, normalizedLevel, baseTemplate, topic || "General English");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    // Parse response
    const result = parseAIResponse(completion.choices[0].message.content);
    
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to parse AI response. Please try again." 
      });
    }

    return res.json({ 
      success: true, 
      content: result,
      metadata: {
        skill,
        level: normalizedLevel,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ AI Test Generation Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error during test generation" 
    });
  }
};

/**
 * Build system prompt based on skill and template
 */
function buildSystemPrompt(skill, level, template, topic) {
  let prompt = `You are an IELTS examiner generating authentic ${skill} questions for IELTS ${level}.\n\n`;
  
  prompt += `Follow the exact IELTS test structure based on Cambridge format.\n\n`;
  
  switch(skill) {
    case 'writing':
      prompt += `Generate TWO tasks:\n`;
      prompt += `Task 1: ${template.structure.task1.type} (${template.structure.task1.wordCount} words, ${template.structure.task1.timeLimit} min)\n`;
      prompt += `Sample: ${template.sampleTopics.task1}\n\n`;
      prompt += `Task 2: ${template.structure.task2.type} (${template.structure.task2.wordCount} words, ${template.structure.task2.timeLimit} min)\n`;
      prompt += `Sample: ${template.sampleTopics.task2}\n\n`;
      prompt += `Topic: ${topic}\n\n`;
      prompt += `Return JSON: { "tasks": [{ "taskNumber": 1, "task": "...", "type": "...", "wordCount": ..., "timeLimit": ... }] }`;
      break;
      
    case 'speaking':
      prompt += `Generate THREE parts:\n`;
      prompt += `Part 1 Questions: ${template.sampleTopics.part1.join(', ')}\n`;
      prompt += `Part 2 Cue Card: ${template.sampleTopics.part2}\n`;
      prompt += `Part 3 Follow-up: ${template.sampleTopics.part3.join(', ')}\n\n`;
      prompt += `Return JSON: { "parts": [{ "part": 1, "questions": [...] }, { "part": 2, "cueCard": "..." }, { "part": 3, "questions": [...] }] }`;
      break;
      
    case 'reading':
      prompt += `Structure: ${template.structure.passages} passages, ${template.structure.totalQuestions} questions total\n`;
      prompt += `Sample Topics: ${template.sampleTopics.join(', ')}\n`;
      prompt += `Selected Topic: ${topic}\n\n`;
      prompt += `Return JSON: { "passage": "...", "questions": [{ "id": 1, "question": "...", "type": "multiple_choice", "options": [...], "correctAnswer": 0 }] }`;
      break;
      
    case 'listening':
      prompt += `Structure: ${template.structure.sections} sections, ${template.structure.totalQuestions} questions total\n`;
      prompt += `Sample Topics: ${template.sampleTopics.join(', ')}\n`;
      prompt += `Selected Topic: ${topic}\n\n`;
      prompt += `Return JSON: { "sections": [{ "id": 1, "title": "...", "questions": [...], "transcript": "..." }] }`;
      break;
  }
  
  return prompt;
}

/**
 * Parse AI response and extract JSON
 */
function parseAIResponse(content) {
  try {
    // Try direct JSON parse
    return JSON.parse(content);
  } catch (e) {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON:", e2.message);
        return null;
      }
    }
    console.error("No valid JSON found in AI response");
    return null;
  }
}
