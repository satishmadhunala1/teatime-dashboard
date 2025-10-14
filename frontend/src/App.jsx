import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import NewsList from './components/NewsList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="text-2xl font-bold">Bilingual News</Link>
              <div className="flex gap-6">
                <Link to="/" className="hover:text-blue-200 transition-colors">
                  Admin Dashboard
                </Link>
                <Link to="/news" className="hover:text-blue-200 transition-colors">
                  View News
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/news" element={<NewsList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;