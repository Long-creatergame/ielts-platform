/**
 * IELTS Test Generator Controller
 * Simplified version using Cambridge IELTS templates
 */

import OpenAI from "openai";
import { writingTemplates } from "../prompts/ieltsTemplates/writingTemplate.js";
import { speakingTemplates } from "../prompts/ieltsTemplates/speakingTemplate.js";
import { readingTemplates } from "../prompts/ieltsTemplates/readingTemplate.js";
import { listeningTemplates } from "../prompts/ieltsTemplates/listeningTemplate.js";
import { bandToCEFR } from "../utils/levelMapper.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Generate IELTS test content using AI templates
 */
export const generateIELTSTest = async (req, res) => {
  try {
    const { skill, level, topic, language } = req.body;

    // Normalize level
    const levelMap = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const normalizedLevel = levelMap.includes(level) ? level : bandToCEFR(level);

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
        message: "Template not found for given skill/level" 
      });
    }

    // Check OpenAI availability
    if (!openai) {
      return res.status(503).json({ 
        success: false, 
        message: "AI service unavailable" 
      });
    }

    // Build system prompt
    const systemPrompt = `
You are an IELTS examiner.
Generate an authentic ${skill} test for IELTS ${normalizedLevel} based on Cambridge IELTS official format.
Topic: ${topic || "General English"}.

Use this base structure:
${JSON.stringify(baseTemplate, null, 2)}

Return ONLY JSON:
{
  "instructions": "string",
  "questions": [ "..." ],
  "expectedResponseFormat": "string"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.8
    });

    // Parse response
    let content;
    try {
      content = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      // Try extracting JSON from markdown
      const text = completion.choices[0].message.content;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      content = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
    }

    if (!content) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to parse AI response" 
      });
    }

    console.log("✅ Generated IELTS test for:", skill, normalizedLevel);

    return res.json({ success: true, content });

  } catch (error) {
    console.error("❌ Error generating IELTS test:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};