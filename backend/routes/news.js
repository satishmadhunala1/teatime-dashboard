const express = require('express');
const router = express.Router();
const News = require('../models/News');
const geminiService = require('../services/geminiService');

// Generate English tags only
router.post('/generate-english-tags', async (req, res) => {
  try {
    const { englishTitle, englishContent } = req.body;

    if (!englishTitle && !englishContent) {
      return res.status(400).json({
        error: 'English title or content is required to generate tags'
      });
    }

    const prompt = `
Generate 5-7 highly relevant and specific tags for this news content. Focus on the main topics, entities, and themes.

CONTENT:
Title: ${englishTitle || 'Not provided'}
Content: ${englishContent || 'Not provided'}

REQUIREMENTS:
- Generate 5-7 relevant tags
- Tags should be specific and meaningful
- Include entity names, topics, locations if mentioned
- Use lowercase, hyphenated format for multi-word tags
- Make tags SEO-friendly and descriptive
- Avoid generic tags unless necessary

OUTPUT FORMAT (JSON only):
{
  "englishTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Examples for reference:
- If content about AI technology: ["artificial-intelligence", "machine-learning", "tech-innovation", "ai-research", "future-technology"]
- If content about politics: ["election-2024", "political-news", "government-policy", "democratic-process", "public-opinion"]
`;

    const result = await geminiService.generateContentDirect(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      res.json(parsedData);
    } else {
      // Fallback: Generate basic tags from title
      const fallbackTags = generateFallbackTags(englishTitle, englishContent);
      res.json({ englishTags: fallbackTags });
    }
  } catch (error) {
    console.error('English tag generation error:', error);
    
    // Fallback tag generation
    const fallbackTags = generateFallbackTags(req.body.englishTitle, req.body.englishContent);
    res.json({ englishTags: fallbackTags });
  }
});

// Generate Telugu tags only
router.post('/generate-telugu-tags', async (req, res) => {
  try {
    const { teluguTitle, teluguContent } = req.body;

    if (!teluguTitle && !teluguContent) {
      return res.status(400).json({
        error: 'Telugu title or content is required to generate tags'
      });
    }

    const prompt = `
Generate 5-7 highly relevant and specific Telugu tags for this news content. Focus on the main topics, entities, and themes.

CONTENT:
Title: ${teluguTitle || 'Not provided'}
Content: ${teluguContent || 'Not provided'}

REQUIREMENTS:
- Generate 5-7 relevant Telugu tags
- Tags should be specific and meaningful in Telugu
- Include entity names, topics, locations if mentioned
- Use proper Telugu script and spelling
- Make tags SEO-friendly and descriptive
- Avoid generic tags unless necessary

OUTPUT FORMAT (JSON only):
{
  "teluguTags": ["ట్యాగ్1", "ట్యాగ్2", "ట్యాగ్3", "ట్యాగ్4", "ట్యాగ్5"]
}

Examples for reference:
- If content about AI technology: ["కృత్రిమ-మేధస్సు", "యంత్ర-అభ్యసన", "సాంకేతిక-నవీకరణ", "ఏఐ-పరిశోధన", "భవిష్యత్-టెక్నాలజీ"]
- If content about politics: ["ఎన్నికలు-2024", "రాజకీయ-వార్తలు", "ప్రభుత్వ-విధానం", "ప్రజాస్వామ్య-ప్రక్రియ", "పబ్లిక్-ఆపినియన్"]
`;

    const result = await geminiService.generateContentDirect(prompt);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      res.json(parsedData);
    } else {
      // Fallback: Generate basic Telugu tags
      const fallbackTags = ["సమాచారం", "వార్త", "అప్డేట్", "తాజా", "సంగతులు"];
      res.json({ teluguTags: fallbackTags });
    }
  } catch (error) {
    console.error('Telugu tag generation error:', error);
    
    // Fallback tag generation
    const fallbackTags = ["సమాచారం", "వార్త", "అప్డేట్", "తాజా", "సంగతులు"];
    res.json({ teluguTags: fallbackTags });
  }
});

// Auto-translate English to Telugu
router.post('/auto-translate', async (req, res) => {
  try {
    const { englishTitle, englishContent, englishTags } = req.body;

    if (!englishTitle || !englishContent) {
      return res.status(400).json({
        error: 'English title and content are required'
      });
    }

    const translationResult = await geminiService.translateAndCorrect({
      title: englishTitle,
      content: englishContent,
      tags: englishTags
    });

    res.json(translationResult);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation service unavailable',
      details: error.message
    });
  }
});

// Auto-translate Telugu to English
router.post('/auto-translate-telugu-to-english', async (req, res) => {
  try {
    const { teluguTitle, teluguContent, teluguTags } = req.body;

    if (!teluguTitle || !teluguContent) {
      return res.status(400).json({
        error: 'Telugu title and content are required'
      });
    }

    const translationResult = await geminiService.translateTeluguToEnglish({
      title: teluguTitle,
      content: teluguContent,
      tags: teluguTags
    });

    res.json(translationResult);
  } catch (error) {
    console.error('Telugu to English translation error:', error);
    res.status(500).json({
      error: 'Translation service unavailable',
      details: error.message
    });
  }
});

// Create news article
router.post('/', async (req, res) => {
  try {
    const {
      englishTitle,
      englishContent,
      englishTags,
      teluguTitle,
      teluguContent,
      teluguTags
    } = req.body;

    const news = new News({
      englishTitle,
      englishContent,
      englishTags,
      teluguTitle,
      teluguContent,
      teluguTags
    });

    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all news articles
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single news article
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function for fallback tag generation
function generateFallbackTags(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
  
  const words = text
    .split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 10);
  
  return [...new Set(words)].slice(0, 5);
}

module.exports = router;