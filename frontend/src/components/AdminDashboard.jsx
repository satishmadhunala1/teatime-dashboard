import React, { useState, useEffect } from "react";
import { newsAPI } from "../services/api";

// Copy Icon Component
const CopyIcon = ({ copied }) => (
  <svg
    className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-500'}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    {copied ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    )}
  </svg>
);

// Enhanced TagInput with Copy
const TagInput = ({
  tags,
  onAddTag,
  onRemoveTag,
  placeholder,
  disabled = false,
  showAutoGenerate = false,
  onAutoGenerate,
  inputDir = "ltr",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !tags.includes(tag)) {
        onAddTag(tag);
      }
      setInputValue("");
    }
  };

  const handleAddClick = () => {
    const tag = inputValue.trim();
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setInputValue("");
    }
  };

  const copyTag = async (tag, index) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy tag: ', err);
    }
  };

  const copyAllTags = async () => {
    try {
      await navigator.clipboard.writeText(tags.join(', '));
      setCopiedIndex('all');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy tags: ', err);
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

      {/* Enhanced Tags Display with Copy */}
      {tags.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-md border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {tags.length} tag{tags.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={copyAllTags}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              title="Copy all tags"
            >
              <CopyIcon copied={copiedIndex === 'all'} />
              {copiedIndex === 'all' ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium group"
              >
                {tag}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyTag(tag, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-blue-600"
                    title="Copy tag"
                  >
                    <CopyIcon copied={copiedIndex === index} />
                  </button>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => onRemoveTag(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-600 text-lg font-bold"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  )}
                </div>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced TextArea with Copy
const EnhancedTextArea = ({ value, onChange, placeholder, name, required, dir = "ltr", rows = 6 }) => {
  const [copied, setCopied] = useState(false);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative">
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        dir={dir}
        rows={rows}
        className="w-full h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        placeholder={placeholder}
        required={required}
      />
      {value && (
        <button
          type="button"
          onClick={copyContent}
          className="absolute top-2 right-2 flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded text-xs text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors"
          title="Copy content"
        >
          <CopyIcon copied={copied} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
};

// Enhanced Input with Copy
const EnhancedInput = ({ value, onChange, placeholder, name, required, dir = "ltr" }) => {
  const [copied, setCopied] = useState(false);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        dir={dir}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder={placeholder}
        required={required}
      />
      {value && (
        <button
          type="button"
          onClick={copyContent}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded text-xs text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors"
          title="Copy text"
        >
          <CopyIcon copied={copied} />
        </button>
      )}
    </div>
  );
};

// Better Music Player
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = document.getElementById('background-music');
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
      <audio id="background-music" src="/song.mp3" loop />
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full ${
          isPlaying ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
        } hover:bg-green-600 transition-colors`}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
      <div className="text-sm">
        <div className="font-medium text-gray-700">Background Music</div>
        <div className="text-xs text-gray-500">Click to {isPlaying ? 'pause' : 'play'}</div>
      </div>
    </div>
  );
};

// Translation Toggle Component
const TranslationToggle = ({ isTeluguToEnglish, onToggle }) => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-white border border-gray-300 rounded-lg p-1 flex">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !isTeluguToEnglish
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          English → Telugu
        </button>
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isTeluguToEnglish
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Telugu → English
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isTeluguToEnglish, setIsTeluguToEnglish] = useState(false);
  const [formData, setFormData] = useState({
    englishTitle: "",
    englishContent: "",
    englishTags: [],
    teluguTitle: "",
    teluguContent: "",
    teluguTags: [],
  });
  const [loading, setLoading] = useState({
    autoTranslate: false,
    generateSourceTags: false,
    submit: false,
  });
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // Auto-generate source tags when content is substantial
  useEffect(() => {
    const generateSourceTags = async () => {
      const sourceTitle = isTeluguToEnglish ? formData.teluguTitle : formData.englishTitle;
      const sourceContent = isTeluguToEnglish ? formData.teluguContent : formData.englishContent;
      const sourceTags = isTeluguToEnglish ? formData.teluguTags : formData.englishTags;

      if (
        sourceTitle.length > 10 &&
        sourceContent.length > 50 &&
        sourceTags.length === 0
      ) {
        setLoading((prev) => ({ ...prev, generateSourceTags: true }));
        try {
          const endpoint = isTeluguToEnglish 
            ? newsAPI.generateTeluguTags 
            : newsAPI.generateEnglishTags;

          const response = await endpoint({
            [isTeluguToEnglish ? 'teluguTitle' : 'englishTitle']: sourceTitle,
            [isTeluguToEnglish ? 'teluguContent' : 'englishContent']: sourceContent,
          });

          if (response.data[isTeluguToEnglish ? 'teluguTags' : 'englishTags']?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              [isTeluguToEnglish ? 'teluguTags' : 'englishTags']: 
                response.data[isTeluguToEnglish ? 'teluguTags' : 'englishTags'],
            }));
            setMessage(`${isTeluguToEnglish ? 'Telugu' : 'English'} tags auto-generated from your content!`);
          }
        } catch (error) {
          console.log("Auto-tag generation failed:", error.message);
        } finally {
          setLoading((prev) => ({ ...prev, generateSourceTags: false }));
        }
      }
    };

    const timeoutId = setTimeout(generateSourceTags, 2000);
    return () => clearTimeout(timeoutId);
  }, [
    formData.englishTitle, 
    formData.englishContent, 
    formData.teluguTitle, 
    formData.teluguContent, 
    isTeluguToEnglish
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEnglishTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      englishTags: [...prev.englishTags, tag],
    }));
  };

  const handleRemoveEnglishTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      englishTags: prev.englishTags.filter((_, i) => i !== index),
    }));
  };

  const handleAddTeluguTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      teluguTags: [...prev.teluguTags, tag],
    }));
  };

  const handleRemoveTeluguTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      teluguTags: prev.teluguTags.filter((_, i) => i !== index),
    }));
  };

  const handleGenerateSourceTags = async () => {
    const sourceTitle = isTeluguToEnglish ? formData.teluguTitle : formData.englishTitle;
    const sourceContent = isTeluguToEnglish ? formData.teluguContent : formData.englishContent;

    if (!sourceTitle && !sourceContent) {
      setMessage(`Please enter ${isTeluguToEnglish ? 'Telugu' : 'English'} title or content first`);
      return;
    }

    setLoading((prev) => ({ ...prev, generateSourceTags: true }));
    setMessage("");

    try {
      const endpoint = isTeluguToEnglish 
        ? newsAPI.generateTeluguTags 
        : newsAPI.generateEnglishTags;

      const response = await endpoint({
        [isTeluguToEnglish ? 'teluguTitle' : 'englishTitle']: sourceTitle,
        [isTeluguToEnglish ? 'teluguContent' : 'englishContent']: sourceContent,
      });

      const tagField = isTeluguToEnglish ? 'teluguTags' : 'englishTags';
      
      setFormData((prev) => ({
        ...prev,
        [tagField]: response.data[tagField] || [],
      }));

      setMessage(
        `Generated ${
          response.data[tagField]?.length || 0
        } relevant ${isTeluguToEnglish ? 'Telugu' : 'English'} tags from your content!`
      );
    } catch (error) {
      setMessage(
        `Failed to generate ${isTeluguToEnglish ? 'Telugu' : 'English'} tags: ` +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading((prev) => ({ ...prev, generateSourceTags: false }));
    }
  };

  const handleAutoTranslate = async () => {
    const sourceTitle = isTeluguToEnglish ? formData.teluguTitle : formData.englishTitle;
    const sourceContent = isTeluguToEnglish ? formData.teluguContent : formData.englishContent;
    const sourceTags = isTeluguToEnglish ? formData.teluguTags : formData.englishTags;

    if (!sourceTitle || !sourceContent) {
      setMessage(`Please enter ${isTeluguToEnglish ? 'Telugu' : 'English'} title and content first`);
      return;
    }

    setLoading((prev) => ({ ...prev, autoTranslate: true }));
    setMessage("");

    try {
      const endpoint = isTeluguToEnglish 
        ? newsAPI.autoTranslateTeluguToEnglish 
        : newsAPI.autoTranslate;

      const requestData = isTeluguToEnglish
        ? {
            teluguTitle: sourceTitle,
            teluguContent: sourceContent,
            teluguTags: sourceTags,
          }
        : {
            englishTitle: sourceTitle,
            englishContent: sourceContent,
            englishTags: sourceTags,
          };

      const response = await endpoint(requestData);

      setFormData((prev) => ({
        ...prev,
        englishTitle: isTeluguToEnglish ? response.data.englishTitle : prev.englishTitle,
        englishContent: isTeluguToEnglish ? response.data.englishContent : prev.englishContent,
        englishTags: isTeluguToEnglish ? response.data.englishTags || [] : response.data.englishTags || prev.englishTags,
        teluguTitle: !isTeluguToEnglish ? response.data.teluguTitle : prev.teluguTitle,
        teluguContent: !isTeluguToEnglish ? response.data.teluguContent : prev.teluguContent,
        teluguTags: !isTeluguToEnglish ? response.data.teluguTags || [] : response.data.teluguTags || prev.teluguTags,
      }));

      setMessage(
        `${isTeluguToEnglish ? 'English' : 'Telugu'} translation generated successfully! Tags have been optimized for both languages.`
      );
    } catch (error) {
      setMessage(
        "Translation failed: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading((prev) => ({ ...prev, autoTranslate: false }));
    }
  };

  const handlePreview = () => {
    setPreview({ ...formData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));
    setMessage("");

    try {
      const newsData = {
        englishTitle: formData.englishTitle,
        englishContent: formData.englishContent,
        englishTags: formData.englishTags,
        teluguTitle: formData.teluguTitle,
        teluguContent: formData.teluguContent,
        teluguTags: formData.teluguTags,
      };

      await newsAPI.createNews(newsData);
      setMessage("News article published successfully!");

      // Reset form
      setFormData({
        englishTitle: "",
        englishContent: "",
        englishTags: [],
        teluguTitle: "",
        teluguContent: "",
        teluguTags: [],
      });
      setPreview(null);
    } catch (error) {
      setMessage(
        "Failed to publish: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const clearAllEnglishTags = () => {
    setFormData((prev) => ({ ...prev, englishTags: [] }));
  };

  const clearAllTeluguTags = () => {
    setFormData((prev) => ({ ...prev, teluguTags: [] }));
  };

  const getSourceLanguage = () => isTeluguToEnglish ? "Telugu" : "English";
  const getTargetLanguage = () => isTeluguToEnglish ? "English" : "Telugu";

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header with Better Music Player */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Bilingual News Publisher
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              AI-powered bidirectional translation and smart tag generation
            </p>
          </div>
          <MusicPlayer />
        </div>

        {/* Translation Toggle */}
        <TranslationToggle 
          isTeluguToEnglish={isTeluguToEnglish}
          onToggle={setIsTeluguToEnglish}
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
        >
          {/* Source Language Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
                {getSourceLanguage()} Content {isTeluguToEnglish && "(Source)"}
              </h2>
              {(!isTeluguToEnglish ? formData.englishTags : formData.teluguTags).length > 0 && (
                <button
                  type="button"
                  onClick={isTeluguToEnglish ? clearAllTeluguTags : clearAllEnglishTags}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium"
                >
                  Clear All Tags
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                {getSourceLanguage()} Title *
              </label>
              <EnhancedInput
                name={isTeluguToEnglish ? "teluguTitle" : "englishTitle"}
                value={isTeluguToEnglish ? formData.teluguTitle : formData.englishTitle}
                onChange={handleInputChange}
                placeholder={`Enter news title in ${getSourceLanguage()}`}
                required
                dir={isTeluguToEnglish ? "ltr" : "ltr"}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                {getSourceLanguage()} Content *
              </label>
              <EnhancedTextArea
                name={isTeluguToEnglish ? "teluguContent" : "englishContent"}
                value={isTeluguToEnglish ? formData.teluguContent : formData.englishContent}
                onChange={handleInputChange}
                placeholder={`Enter news content in ${getSourceLanguage()}`}
                required
                dir={isTeluguToEnglish ? "ltr" : "ltr"}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                {getSourceLanguage()} Tags
                <span className="text-xs text-gray-500 ml-2">
                  Press Enter, comma, or click Add Tag
                </span>
              </label>
              <TagInput
                tags={isTeluguToEnglish ? formData.teluguTags : formData.englishTags}
                onAddTag={isTeluguToEnglish ? handleAddTeluguTag : handleAddEnglishTag}
                onRemoveTag={isTeluguToEnglish ? handleRemoveTeluguTag : handleRemoveEnglishTag}
                onAutoGenerate={handleGenerateSourceTags}
                showAutoGenerate={true}
                placeholder={`Add custom ${getSourceLanguage()} tags or click Auto Generate`}
                disabled={loading.generateSourceTags}
                inputDir={isTeluguToEnglish ? "ltr" : "ltr"}
              />
              {loading.generateSourceTags && (
                <div className="flex items-center gap-2 text-purple-600 text-xs sm:text-sm mt-2">
                  <svg
                    className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating relevant {getSourceLanguage().toLowerCase()} tags from your content...
                </div>
              )}
            </div>
          </div>

          {/* Auto Translate Button */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={
                loading.autoTranslate ||
                !(isTeluguToEnglish ? formData.teluguTitle : formData.englishTitle) ||
                !(isTeluguToEnglish ? formData.teluguContent : formData.englishContent)
              }
              className="w-full bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg font-semibold"
            >
              {loading.autoTranslate ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Translating to {getTargetLanguage()} and Optimizing Tags...
                </>
              ) : (
                `🚀 Auto Translate to ${getTargetLanguage()}`
              )}
            </button>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center">
              This will translate content to {getTargetLanguage()} and generate matching tags
            </p>
          </div>

          {/* Target Language Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
                {getTargetLanguage()} Content {!isTeluguToEnglish && "(Target)"}
              </h2>
              {(!isTeluguToEnglish ? formData.teluguTags : formData.englishTags).length > 0 && (
                <button
                  type="button"
                  onClick={!isTeluguToEnglish ? clearAllTeluguTags : clearAllEnglishTags}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium"
                >
                  Clear All Tags
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                {getTargetLanguage()} Title *
              </label>
              <EnhancedInput
                name={!isTeluguToEnglish ? "teluguTitle" : "englishTitle"}
                value={!isTeluguToEnglish ? formData.teluguTitle : formData.englishTitle}
                onChange={handleInputChange}
                dir="ltr"
                placeholder={`${getTargetLanguage()} title will auto-fill after translation`}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                {getTargetLanguage()} Content *
              </label>
              <EnhancedTextArea
                name={!isTeluguToEnglish ? "teluguContent" : "englishContent"}
                value={!isTeluguToEnglish ? formData.teluguContent : formData.englishContent}
                onChange={handleInputChange}
                dir="ltr"
                placeholder={`${getTargetLanguage()} content will auto-fill after translation`}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                {getTargetLanguage()} Tags
                <span className="text-xs text-gray-500 ml-2">
                  Press Enter, comma, or click Add Tag
                </span>
              </label>
              <TagInput
                tags={!isTeluguToEnglish ? formData.teluguTags : formData.englishTags}
                onAddTag={!isTeluguToEnglish ? handleAddTeluguTag : handleAddEnglishTag}
                onRemoveTag={!isTeluguToEnglish ? handleRemoveTeluguTag : handleRemoveEnglishTag}
                inputDir="ltr"
                placeholder={`Add custom ${getTargetLanguage()} tags`}
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
              disabled={
                loading.submit ||
                !formData.englishTitle ||
                !formData.teluguTitle
              }
              className="w-full sm:flex-1 bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-lg font-semibold"
            >
              {loading.submit ? "📤 Publishing..." : "📰 Publish News Article"}
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-3 sm:p-4 rounded-md text-sm ${
                message.includes("success")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : message.includes("Failed")
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              <div className="flex items-center">
                {message.includes("success") && "✅ "}
                {message.includes("Failed") && "❌ "}
                <span className="ml-2">{message}</span>
              </div>
            </div>
          )}
        </form>

        {/* Preview Section */}
        {preview && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Article Preview
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Review your bilingual news article before publishing
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {/* English Preview */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm mr-2">
                    English
                  </span>
                  Version
                </h3>
                <div className="border-2 border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                  <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800">
                    {preview.englishTitle}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                    {preview.englishContent}
                  </p>
                  {preview.englishTags.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                        Tags:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {preview.englishTags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-200 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                          >
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
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs sm:text-sm mr-2">
                    Telugu
                  </span>
                  Version
                </h3>
                <div className="border-2 border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                  <h4
                    className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800"
                    dir="ltr"
                  >
                    {preview.teluguTitle}
                  </h4>
                  <p
                    className="text-gray-700 whitespace-pre-line mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base"
                    dir="ltr"
                  >
                    {preview.teluguContent}
                  </p>
                  {preview.teluguTags.length > 0 && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                        ట్యాగ్లు:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {preview.teluguTags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-green-200 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                          >
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

