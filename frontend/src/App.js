import React from 'react';
import SectionManager from './components/SectionManager';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Tautulli Custom API Manager</h1>
        <SectionManager />
      </div>
    </div>
  );
}

export default App;