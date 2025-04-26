import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Global Tourism Explorer</h3>
            <p className="text-gray-400">
              Visualizing international tourism trends and aviation safety data from around the world.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
            <ul className="text-gray-400 space-y-2">
              <li>
                <a 
                  href="https://www.kaggle.com/code/abmsayem/trends-and-insights-of-global-tourism/input"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kaggle: Global Tourism Dataset
                </a>
              </li>
              <li>
                <a 
                  href="https://www.kaggle.com/code/abmsayem/trends-and-insights-of-global-tourism/input?select=global-fatalities-from-aviation-accidents-and-hijackings.csv"
                  className="hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Aviation Safety Database
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Technologies</h3>
            <ul className="text-gray-400 space-y-2">
              <li>React</li>
              <li>D3.js</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Global Tourism Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;