import React, { useState } from 'react';
import { MapPin, ArrowDown } from 'lucide-react';

const LLMarkApp = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePin = () => {
    const scrollPos = window.scrollY;
    console.log(`📍 Pinned at ${scrollPos}px`);
    alert(`Marked position: ${scrollPos}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 font-sans text-gray-800">
      
      {/* Sidebar / List Area (Hidden for now) */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 mb-2 w-64 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold text-sm mb-2 text-gray-600">Context Marks</h3>
          <div className="text-xs text-gray-400 italic">No marks yet...</div>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="group bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-2xl transition-all flex items-center justify-center"
      >
        <MapPin className="w-6 h-6" />
        {isExpanded && <span className="ml-2 pr-2 text-sm font-medium">Close</span>}
      </button>

      {/* Quick Mark Button (Only visible when expanded) */}
      {isExpanded && (
        <button 
          onClick={handlePin}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Drop Anchor Here"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default LLMarkApp;