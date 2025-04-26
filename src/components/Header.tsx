import React from 'react';
import { Globe } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="text-primary" size={28} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Global Tourism Explorer</h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <a href="#tourism-trends" className="text-gray-600 hover:text-primary transition-colors">
              Tourism Trends
            </a>
            <a href="#regional-analysis" className="text-gray-600 hover:text-primary transition-colors">
              Regional Analysis
            </a>
            <a href="#aviation-safety" className="text-gray-600 hover:text-primary transition-colors">
              Aviation Safety
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;