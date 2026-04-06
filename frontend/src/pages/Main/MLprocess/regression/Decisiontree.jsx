import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function DecisionTree({ onNext }) {
  const [maxDepth, setMaxDepth] = useState("");
  const [minSamplesSplit, setMinSamplesSplit] = useState(2);

  const handleNext = () => {
    onNext({
      max_depth: maxDepth ? parseInt(maxDepth) : null,
      min_samples_split: parseInt(minSamplesSplit) || 2,
      random_state: 42
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Max Depth</label>
          <input 
            type="number" 
            placeholder="None"
            value={maxDepth} 
            onChange={(e) => setMaxDepth(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Maximum depth of the tree. Leave blank for unconstrained.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Min Samples to Split</label>
          <input 
            type="number" 
            value={minSamplesSplit} 
            onChange={(e) => setMinSamplesSplit(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The minimum number of samples required to split an internal node.</p>
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
