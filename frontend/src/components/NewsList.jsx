import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await newsAPI.getAllNews();
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg sm:text-xl text-gray-600">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Bilingual News Articles</h1>
          <span className="text-gray-600 text-sm sm:text-base">{news.length} articles</span>
        </div>
        
        <div className="grid gap-4 sm:gap-6">
          {news.map((article) => (
            <div key={article._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                {/* English Version */}
                <div className="md:border-r md:border-gray-200 md:pr-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{article.englishTitle}</h2>
                  <img src={article.imageUrl} alt="" />
                  <p className="text-gray-600 whitespace-pre-line mb-4 text-sm sm:text-base">{article.englishContent}</p>
                  {article.englishTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {article.englishTags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Telugu Version */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{article.teluguTitle}</h2>
                  <img src={article.imageUrl} alt="" />
                  <p className="text-gray-600 whitespace-pre-line mb-4 text-sm sm:text-base">{article.teluguContent}</p>
                  {article.teluguTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {article.teluguTags.map((tag, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
                <span className="text-xs sm:text-sm text-gray-500">
                  Published on: {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-lg sm:text-xl">No news articles found.</p>
            <p className="text-gray-400 text-sm sm:text-base">Create your first bilingual news article from the admin dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;