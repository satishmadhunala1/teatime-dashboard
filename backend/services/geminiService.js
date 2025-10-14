
require("dotenv").config()
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const GEMINI_API_KEY="AIzaSyDSIfQzdj9XzRK8mG9hxM4RxKxTrmcvZt0"
// class GeminiService {
//   constructor() {
//     this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//     this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
//   }

//   async translateAndCorrect(englishData) {
//     const prompt = `
// You are an expert bilingual translator specializing in English to Telugu translation for news content. Follow these instructions carefully:

// ENGLISH INPUT:
// Title: ${englishData.title}
// Content: ${englishData.content}
// Tags: ${englishData.tags ? englishData.tags.join(', ') : 'Not provided'}

// TRANSLATION REQUIREMENTS:
// 1. Translate the English title and content to Telugu
// 2. Recheck every Telugu word for spelling and grammar 3 times to ensure perfection
// 3. Ensure natural, fluent Telugu phrasing that sounds like native Telugu journalism
// 4. Do NOT provide literal translation - adapt to Telugu cultural context
// 5. Generate 5 relevant tags in English based on the content
// 6. Generate 5 relevant tags in Telugu that match the English tags in meaning

// OUTPUT FORMAT (JSON only, no markdown):
// {
//   "teluguTitle": "translated telugu title here",
//   "teluguContent": "translated telugu content here",
//   "englishTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
//   "teluguTags": ["ట్యాగ్1", "ట్యాగ్2", "ట్యాగ్3", "ట్యాగ్4", "ట్యాగ్5"]
// }

// Ensure the Telugu translation is:
// - Grammatically perfect after 3 rounds of checking
// - Culturally appropriate for Telugu readers
// - Maintains journalistic tone and style
// - Flows naturally like original Telugu content
// `;

//     try {
//       const result = await this.model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();
      
//       // Extract JSON from the response
//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         return JSON.parse(jsonMatch[0]);
//       } else {
//         throw new Error('Invalid response format from Gemini API');
//       }
//     } catch (error) {
//       console.error('Gemini API Error:', error);
//       throw new Error('Translation failed: ' + error.message);
//     }
//   }
// }

// module.exports = new GeminiService();



const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY="AIzaSyDSIfQzdj9XzRK8mG9hxM4RxKxTrmcvZt0"

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateContentDirect(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Gemini API call failed: ' + error.message);
    }
  }

  async translateAndCorrect(englishData) {
    const prompt = `
You are an expert bilingual translator specializing in English to Telugu translation for news content. Follow these instructions carefully:

ENGLISH INPUT:
Title: ${englishData.title}
Content: ${englishData.content}
Existing English Tags: ${englishData.tags ? englishData.tags.join(', ') : 'None provided'}

TRANSLATION REQUIREMENTS:
1. Translate the English title and content to Telugu
2. Recheck every Telugu word for spelling and grammar 3 times to ensure perfection
3. Ensure natural, fluent Telugu phrasing that sounds like native Telugu journalism
4. Do NOT provide literal translation - adapt to Telugu cultural context
5. Generate 5-7 highly relevant tags in English based on the content (optimize existing tags if provided)
6. Generate 5-7 relevant tags in Telugu that match the English tags in meaning

TAG GENERATION STRATEGY:
- Analyze the content deeply for main themes, entities, and topics
- If English tags are provided, enhance them with more specific/contextual tags
- If no English tags provided, generate completely new relevant tags
- Ensure Telugu tags are natural, culturally appropriate, and match English tag meanings
- Tags should be specific, SEO-friendly, and meaningful

OUTPUT FORMAT (JSON only, no markdown, no extra text):
{
  "teluguTitle": "translated telugu title here",
  "teluguContent": "translated telugu content here",
  "englishTags": ["specific-tag1", "relevant-tag2", "contextual-tag3", "entity-tag4", "theme-tag5"],
  "teluguTags": ["ట్యాగ్1", "ట్యాగ్2", "ట్యాగ్3", "ట్యాగ్4", "ట్యాగ్5"]
}

Ensure the Telugu translation is:
- Grammatically perfect after 3 rounds of checking
- Culturally appropriate for Telugu readers
- Maintains journalistic tone and style
- Flows naturally like original Telugu content
`;

    try {
      const text = await this.generateContentDirect(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Smart tag combination: preserve user tags and add AI-generated ones
        const existingEnglishTags = englishData.tags || [];
        const allEnglishTags = [...new Set([...existingEnglishTags, ...parsedData.englishTags])].slice(0, 7);
        
        return {
          ...parsedData,
          englishTags: allEnglishTags,
          teluguTags: parsedData.teluguTags.slice(0, 7)
        };
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Translation failed: ' + error.message);
    }
  }
}

module.exports = new GeminiService();