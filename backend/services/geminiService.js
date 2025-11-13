const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_API_KEY = "AIzaSyBroZjJ2d3iwa2-2viJWn59Ly4B-w0_G_Y"

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // Add retry mechanism with exponential backoff
  async makeRequestWithRetry(prompt, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error(`Gemini API Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff: wait longer after each attempt
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async generateContentDirect(prompt) {
    try {
      return await this.makeRequestWithRetry(prompt);
    } catch (error) {
      console.error('Gemini API Error after retries:', error);
      throw new Error('Gemini API call failed: ' + error.message);
    }
  }

  async translateAndCorrect({ title, content, tags = [] }) {
    const prompt = `
CRITICAL MISSION: You are a Telugu Linguistics Professor with 30 years of experience in translation and journalism. Your translation must be ABSOLUTELY PERFECT without a single error.

ENGLISH INPUT TO TRANSLATE:
TITLE: ${title}
CONTENT: ${content}
TAGS: ${tags.length ? tags.join(', ') : 'None provided'}

MANDATORY QUALITY CONTROL PROCESS - VERIFY 5 TIMES:

VERIFICATION 1 - GRAMMAR CHECK:
✓ Every Telugu word must follow proper grammar rules
✓ Check verb conjugations, noun cases, and sentence structure
✓ Ensure proper sandhi (word-joining) and samasa (compounds)

VERIFICATION 2 - SPELLING ACCURACY:
✓ Every Telugu character must be perfectly spelled
✓ Verify all అక్షరాలు (letters) and ఉచ్చారణ (pronunciation)
✓ Check for common spelling mistakes and eliminate them

VERIFICATION 3 - CULTURAL APPROPRIATENESS:
✓ Translation must sound like native Telugu journalism
✓ Use proper Telugu news terminology and phrases
✓ Adapt cultural references appropriately for Telugu readers

VERIFICATION 4 - MEANING PRESERVATION:
✓ Maintain exact original meaning while making it natural Telugu
✓ No literal translation - only contextual adaptation
✓ Preserve all facts, numbers, and important details

VERIFICATION 5 - FLUENCY CHECK:
✓ Read entire translation aloud mentally
✓ Ensure smooth flow like original Telugu news content
✓ Verify paragraph structure and readability

TRANSLATION REQUIREMENTS:
1. Title Translation: Must be compelling and accurate
2. Content Translation: Must be flawless, natural Telugu
3. Tags: Generate 3-5 highly relevant English tags
4. Telugu Tags: Generate matching Telugu tags that are culturally appropriate

TELUGU LANGUAGE EXCELLENCE STANDARDS:
- Use ప్రామాణిక తెలుగు (Standard Telugu)
- Follow శుద్ధ తెలుగు (Pure Telugu) principles
- Maintain news journalism standards
- Ensure readability for all Telugu readers

OUTPUT FORMAT (STRICT JSON ONLY - NO DEVIATIONS):
{
  "teluguTitle": "పరిపూర్ణమైన తెలుగు శీర్షిక ఇక్కడ రాయండి",
  "teluguContent": "పూర్తిగా తప్పులేని తెలుగు విషయం ఇక్కడ రాయండి. ప్రతి పదం, ప్రతి వాక్యం సంపూర్ణంగా సరిగ్గా ఉండాలి.",
  "englishTags": ["precise-tag1", "accurate-tag2", "relevant-tag3"],
  "teluguTags": ["ఖచ్చితమైన-ట్యాగ్1", "సరైన-ట్యాగ్2", "సందర్భోచిత-ట్యాగ్3"]
}

EXAMPLES OF PERFECT TRANSLATION:

English: "Prime Minister Modi announced new economic reforms today"
Perfect Telugu: "ప్రధానమంత్రి మోదీ నేడు కొత్త ఆర్థిక సంస్కరణలను ప్రకటించారు"

English: "Scientists discovered new planet in habitable zone"
Perfect Telugu: "శాస్త్రవేత్తలు నివసించడానికి అనుకూలమైన ప్రదేశంలో కొత్త గ్రహాన్ని కనుగొన్నారు"

English: "Stock market reaches all-time high amid positive sentiment"
Perfect Telugu: "అనుకూలమైన వాతావరణంతో స్టాక్ మార్కెట్ అన్ని కాలాల్లోనూ అత్యధిక స్థాయిని తాకింది"

FINAL QUALITY ASSURANCE:
Before submitting, perform these 5 verification checks one final time. Every character must be perfect. No compromises on quality.

IMPORTANT: Return ONLY the JSON object. No additional text, no explanations, no apologies.
`;

    try {
      const text = await this.makeRequestWithRetry(prompt);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // Additional client-side validation
        this.validateTeluguTranslation(result);
        
        return result;
      } else {
        throw new Error('Invalid JSON response format from Gemini API');
      }
    } catch (error) {
      console.error('Translation failed after retries:', error);
      return this.getFallbackTranslation(title, content, tags);
    }
  }

  // Enhanced validation for Telugu content
  validateTeluguTranslation(translation) {
    const { teluguTitle, teluguContent, teluguTags } = translation;
    
    // Basic Telugu script validation
    const teluguRegex = /[\u0C00-\u0C7F]/;
    
    if (!teluguRegex.test(teluguTitle)) {
      console.warn('Warning: Telugu title may contain non-Telugu characters');
    }
    
    if (!teluguRegex.test(teluguContent)) {
      console.warn('Warning: Telugu content may contain non-Telugu characters');
    }
    
    // Check for common Telugu errors
    this.checkCommonErrors(teluguTitle, 'Title');
    this.checkCommonErrors(teluguContent, 'Content');
  }

  // Check for common Telugu translation errors
  checkCommonErrors(text, field) {
    const commonErrors = [
      { pattern: /[a-zA-Z]/, message: 'English characters in Telugu text' },
      { pattern: /\?\?\?/, message: 'Untranslated sections' },
      { pattern: /\[.*\]/, message: 'Bracketed notes in translation' }
    ];
    
    commonErrors.forEach(({ pattern, message }) => {
      if (pattern.test(text)) {
        console.warn(`Quality Check - ${field}: Possible ${message}`);
      }
    });
  }

  // Fallback translation for when API is unavailable
  fallbackTranslation(text) {
    return `[తాత్కాలికంగా అనువాదం అందుబాటులో లేదు] ${text}`;
  }

  generateFallbackTags(title) {
    const words = title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    return words.slice(0, 3).map(word => word.replace(/[^a-z0-9]/g, ''));
  }

  getFallbackTranslation(title, content, tags) {
    return {
      teluguTitle: this.fallbackTranslation(title),
      teluguContent: this.fallbackTranslation(content),
      englishTags: tags.length ? tags.slice(0, 3) : this.generateFallbackTags(title),
      teluguTags: ["సమాచారం", "వార్త", "అప్డేట్"],
      _fallback: true,
      _message: "Translation service temporarily unavailable. Using fallback."
    };
  }

  async translateNewsArticle(newsData) {
    const prompt = `
You are a Telugu journalism expert. Translate this news article with absolute perfection.

ORIGINAL NEWS:
Title: ${newsData.title}
Content: ${newsData.content}
Category: ${newsData.category}

FOLLOW THE SAME 5-STEP VERIFICATION PROCESS AS MAIN TRANSLATION
Ensure every character is perfect Telugu.

OUTPUT FORMAT (JSON only):
{
  "teluguTitle": "పరిపూర్ణ తెలుగు శీర్షిక",
  "teluguContent": "దోషరహిత తెలుగు విషయం",
  "englishTags": ["tag1", "tag2", "tag3"],
  "teluguTags": ["ట్యాగ్1", "ట్యాగ్2", "ట్యాగ్3"]
}
`;

    try {
      const text = await this.makeRequestWithRetry(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        this.validateTeluguTranslation(result);
        return result;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackTranslation(
        newsData.title, 
        newsData.content, 
        newsData.tags || []
      );
    }
  }

  // Additional method for quality-focused tag generation
  async generatePerfectTags({ englishTitle, englishContent }) {
    const prompt = `
Generate highly specific and relevant tags for this news content.

CONTENT:
Title: ${englishTitle}
Content: ${englishContent}

Generate 3-5 English tags and 3-5 matching Telugu tags.
Tags must be specific, relevant, and SEO-friendly.

OUTPUT FORMAT (JSON only):
{
  "englishTags": ["specific-tag1", "relevant-tag2", "accurate-tag3"],
  "teluguTags": ["స్పష్టమైన-ట్యాగ్1", "సందర్భోచిత-ట్యాగ్2", "ఖచ్చితమైన-ట్యాగ్3"]
}
`;

    try {
      const text = await this.makeRequestWithRetry(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return {
          englishTags: this.generateFallbackTags(englishTitle),
          teluguTags: ["సమాచారం", "వార్త", "అప్డేట్"]
        };
      }
    } catch (error) {
      console.error('Tag generation error:', error);
      return {
        englishTags: this.generateFallbackTags(englishTitle),
        teluguTags: ["సమాచారం", "వార్త", "అప్డేట్"]
      };
    }
  }
}

module.exports = new GeminiService();