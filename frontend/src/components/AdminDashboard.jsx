import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';

const TagInput = ({ tags, onAddTag, onRemoveTag, placeholder, disabled = false, showAutoGenerate = false, onAutoGenerate, inputDir = "ltr" }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !tags.includes(tag)) {
        onAddTag(tag);
      }
      setInputValue('');
    }
  };

  const handleAddClick = () => {
    const tag = inputValue.trim();
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          dir={inputDir}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="button"
          onClick={handleAddClick}
          disabled={disabled || !inputValue.trim()}
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm"
        >
          Add Tag
        </button>
        {showAutoGenerate && onAutoGenerate && (
          <button
            type="button"
            onClick={onAutoGenerate}
            disabled={disabled}
            className="bg-purple-500 text-white px-3 py-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm"
          >
            Auto Generate
          </button>
        )}
      </div>
      
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-md border">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveTag(index)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none text-lg font-bold"
                    title="Remove tag"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    englishTitle: '',
    englishContent: '',
    englishTags: [],
    teluguTitle: '',
    teluguContent: '',
    teluguTags: []
  });
  const [loading, setLoading] = useState({
    autoTranslate: false,
    generateEnglishTags: false,
    submit: false
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');

  // Auto-generate English tags when content is substantial
  useEffect(() => {
    const generateEnglishTags = async () => {
      if (formData.englishTitle.length > 10 && formData.englishContent.length > 50 && formData.englishTags.length === 0) {
        setLoading(prev => ({ ...prev, generateEnglishTags: true }));
        try {
          const response = await newsAPI.generateEnglishTags({
            englishTitle: formData.englishTitle,
            englishContent: formData.englishContent
          });
          
          if (response.data.englishTags && response.data.englishTags.length > 0) {
            setFormData(prev => ({
              ...prev,
              englishTags: response.data.englishTags
            }));
            setMessage('English tags auto-generated from your content!');
          }
        } catch (error) {
          console.log('Auto-tag generation failed:', error.message);
          // Silent fail - user can still generate manually
        } finally {
          setLoading(prev => ({ ...prev, generateEnglishTags: false }));
        }
      }
    };

    const timeoutId = setTimeout(generateEnglishTags, 2000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [formData.englishTitle, formData.englishContent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEnglishTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      englishTags: [...prev.englishTags, tag]
    }));
  };

  const handleRemoveEnglishTag = (index) => {
    setFormData(prev => ({
      ...prev,
      englishTags: prev.englishTags.filter((_, i) => i !== index)
    }));
  };

  const handleAddTeluguTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      teluguTags: [...prev.teluguTags, tag]
    }));
  };

  const handleRemoveTeluguTag = (index) => {
    setFormData(prev => ({
      ...prev,
      teluguTags: prev.teluguTags.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateEnglishTags = async () => {
    if (!formData.englishTitle && !formData.englishContent) {
      setMessage('Please enter English title or content first');
      return;
    }

    setLoading(prev => ({ ...prev, generateEnglishTags: true }));
    setMessage('');

    try {
      const response = await newsAPI.generateEnglishTags({
        englishTitle: formData.englishTitle,
        englishContent: formData.englishContent
      });

      setFormData(prev => ({
        ...prev,
        englishTags: response.data.englishTags || []
      }));

      setMessage(`Generated ${response.data.englishTags?.length || 0} relevant English tags from your content!`);
    } catch (error) {
      setMessage('Failed to generate English tags: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(prev => ({ ...prev, generateEnglishTags: false }));
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.englishTitle || !formData.englishContent) {
      setMessage('Please enter English title and content first');
      return;
    }

    setLoading(prev => ({ ...prev, autoTranslate: true }));
    setMessage('');

    try {
      const response = await newsAPI.autoTranslate({
        englishTitle: formData.englishTitle,
        englishContent: formData.englishContent,
        englishTags: formData.englishTags
      });

      setFormData(prev => ({
        ...prev,
        teluguTitle: response.data.teluguTitle,
        teluguContent: response.data.teluguContent,
        teluguTags: response.data.teluguTags || [],
        // Update English tags with any new ones generated during translation
        englishTags: response.data.englishTags || prev.englishTags
      }));

      setMessage('Telugu translation generated successfully! Tags have been optimized for both languages.');
    } catch (error) {
      setMessage('Translation failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(prev => ({ ...prev, autoTranslate: false }));
    }
  };

  const handlePreview = () => {
    setPreview({ ...formData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    setMessage('');

    try {
      const newsData = {
        englishTitle: formData.englishTitle,
        englishContent: formData.englishContent,
        englishTags: formData.englishTags,
        teluguTitle: formData.teluguTitle,
        teluguContent: formData.teluguContent,
        teluguTags: formData.teluguTags
      };

      await newsAPI.createNews(newsData);
      setMessage('News article published successfully!');
      
      // Reset form
      setFormData({
        englishTitle: '',
        englishContent: '',
        englishTags: [],
        teluguTitle: '',
        teluguContent: '',
        teluguTags: []
      });
      setPreview(null);
    } catch (error) {
      setMessage('Failed to publish: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const clearAllEnglishTags = () => {
    setFormData(prev => ({ ...prev, englishTags: [] }));
  };

  const clearAllTeluguTags = () => {
    setFormData(prev => ({ ...prev, teluguTags: [] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Bilingual News Publisher</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">AI-powered translation and smart tag generation</p>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          {/* English Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">English Content</h2>
              {formData.englishTags.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllEnglishTags}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium"
                >
                  Clear All Tags
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                English Title *
              </label>
              <input
                type="text"
                name="englishTitle"
                value={formData.englishTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter news title in English"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                English Content *
              </label>
              <textarea
                name="englishContent"
                value={formData.englishContent}
                onChange={handleInputChange}
                rows="4 sm:rows-6"
                className="w-full h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter news content in English"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                English Tags
                <span className="text-xs text-gray-500 ml-2">Press Enter, comma, or click Add Tag</span>
              </label>
              <TagInput
                tags={formData.englishTags}
                onAddTag={handleAddEnglishTag}
                onRemoveTag={handleRemoveEnglishTag}
                onAutoGenerate={handleGenerateEnglishTags}
                showAutoGenerate={true}
                placeholder="Add custom English tags or click Auto Generate"
                disabled={loading.generateEnglishTags}
              />
              {loading.generateEnglishTags && (
                <div className="flex items-center gap-2 text-purple-600 text-xs sm:text-sm mt-2">
                  <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating relevant English tags from your content...
                </div>
              )}
            </div>
          </div>

          {/* Auto Translate Button */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={loading.autoTranslate || !formData.englishTitle || !formData.englishContent}
              className="w-full bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg font-semibold"
            >
              {loading.autoTranslate ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Translating to Telugu and Optimizing Tags...
                </>
              ) : (
                '🚀 Auto Translate to Telugu'
              )}
            </button>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
              This will translate content to Telugu and generate matching Telugu tags
            </p>
          </div>

          {/* Telugu Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Telugu Content</h2>
              {formData.teluguTags.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllTeluguTags}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium"
                >
                  Clear All Tags
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                Telugu Title *
              </label>
              <input
                type="text"
                name="teluguTitle"
                value={formData.teluguTitle}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Telugu title will auto-fill after translation"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                Telugu Content *
              </label>
              <textarea
                name="teluguContent"
                value={formData.teluguContent}
                onChange={handleInputChange}
                dir="ltr"
                rows="4 sm:rows-6"
                className="w-full  h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Telugu content will auto-fill after translation"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                Telugu Tags
                <span className="text-xs text-gray-500 ml-2">Press Enter, comma, or click Add Tag</span>
              </label>
              <TagInput
                tags={formData.teluguTags}
                onAddTag={handleAddTeluguTag}
                onRemoveTag={handleRemoveTeluguTag}
                inputDir="ltr"
                placeholder="Add custom Telugu tags"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePreview}
              disabled={!formData.englishTitle || !formData.teluguTitle}
              className="w-full sm:flex-1 bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              👁️ Preview Article
            </button>
            <button
              type="submit"
              disabled={loading.submit || !formData.englishTitle || !formData.teluguTitle}
              className="w-full sm:flex-1 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-lg font-semibold"
            >
              {loading.submit ? '📤 Publishing...' : '📰 Publish News Article'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 sm:p-4 rounded-md text-sm ${
              message.includes('success') ? 'bg-green-100 text-green-700 border border-green-200' : 
              message.includes('Failed') ? 'bg-red-100 text-red-700 border border-red-200' : 
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <div className="flex items-center">
                {message.includes('success') && '✅ '}
                {message.includes('Failed') && '❌ '}
                <span className="ml-2">{message}</span>
              </div>
            </div>
          )}
        </form>

        {/* Preview Section */}
        {preview && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Article Preview</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Review your bilingual news article before publishing</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {/* English Preview */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm mr-2">English</span>
                  Version
                </h3>
                <div className="border-2 border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                  <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800">{preview.englishTitle}</h4>
                  <p className="text-gray-700 whitespace-pre-line mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{preview.englishContent}</p>
                  {preview.englishTags.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {preview.englishTags.map((tag, index) => (
                          <span key={index} className="bg-blue-200 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Telugu Preview */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs sm:text-sm mr-2">Telugu</span>
                  Version
                </h3>
                <div className="border-2 border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                  <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800" dir="ltr">{preview.teluguTitle}</h4>
                  <p className="text-gray-700 whitespace-pre-line mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base" dir="ltr">{preview.teluguContent}</p>
                  {preview.teluguTags.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">ట్యాగ్లు:</p>
                      <div className="flex flex-wrap gap-2">
                        {preview.teluguTags.map((tag, index) => (
                          <span key={index} className="bg-green-200 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;