import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Global Tourism & Aviation Data Visualization
              </h1>
              <p className="text-xl opacity-90">
                Explore international tourism trends and aviation safety data through interactive visualizations.
                Discover patterns, compare countries, and analyze historical travel data.
              </p>
            </div>
          </div>
        </section>
        
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

export default App;