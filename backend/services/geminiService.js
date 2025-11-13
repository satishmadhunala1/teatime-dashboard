
require("dotenv").config()




const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY="AIzaSyCEyJ8WdqlxsqXk_1dHdkwncNTMA58qqoQ"

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

 async translateNewsArticle(newsData) {
    const prompt = `
You are an expert Telugu news editor. Translate this English news article to Telugu while maintaining journalistic standards.

ORIGINAL ENGLISH NEWS:
Title: ${newsData.title}
Content: ${newsData.content}
Category: ${newsData.category}

TRANSLATION REQUIREMENTS:
1. Translate title and content to natural, fluent Telugu
2. Maintain journalistic tone and style
3. Adapt cultural references appropriately for Telugu readers
4. Ensure grammatical accuracy and proper spelling
5. Generate 3-5 relevant tags in English
6. Generate 3-5 relevant tags in Telugu that match the English tags

IMPORTANT:
- Make Telugu translation sound like original Telugu journalism
- Don't do literal translation - adapt for cultural context
- Keep the essence and facts intact
- Use proper Telugu news terminology

OUTPUT FORMAT (JSON only):
{
  "teluguTitle": "translated telugu title",
  "teluguContent": "translated telugu content",
  "englishTags": ["tag1", "tag2", "tag3"],
  "teluguTags": ["ట్యాగ్1", "ట్యాగ్2", "ట్యాగ్3"]
}

Example:
Input: "PM Modi launches new education policy in Delhi"
Output: {
  "teluguTitle": "పీఎం మోదీ ఢిల్లీలో కొత్త విద్యా విధానాన్ని ప్రారంభించారు",
  "teluguContent": "ప్రధానమంత్రి నరేంద్ర మోదీ ఢిల్లీలో నూతన విద్యా విధానాన్ని ప్రారంభించారు...",
  "englishTags": ["education-policy", "pm-modi", "delhi", "government"],
  "teluguTags": ["విద్యా-విధానం", "పీఎం-మోదీ", "ఢిల్లీ", "ప్రభుత్వం"]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
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