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

// Auto-translate endpoint (updated)
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

// Auto-translate endpoint


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

module.exports = router;