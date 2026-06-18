import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Dbscan({ onNext }) {
  const [eps, setEps] = useState(0.5);
  const [minSamples, setMinSamples] = useState(5);

  const handleNext = () => {
    onNext({
      eps: parseFloat(eps),
      min_samples: parseInt(minSamples)
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Epsilon (eps)</label>
          <input 
            type="number" 
            step="0.1"
            min="0.1"
            value={eps} 
            onChange={(e) => setEps(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The maximum distance between two samples for one to be considered as in the neighborhood of the other.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Min Samples</label>
          <input 
            type="number" 
            min="1"
            value={minSamples} 
            onChange={(e) => setMinSamples(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The number of samples in a neighborhood for a point to be considered as a core point.</p>
        </div>
      </div>

      <div className="flex justify-start">
        <button
          onClick={handleNext}
          className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Play className="w-4 h-4 mr-2" fill="currentColor" />
          Save & Proceed to Training
        </button>
      </div>
    </div>
  );
}
