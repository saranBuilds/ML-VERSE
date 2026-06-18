import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function RandomForest({ onNext }) {
  const [nEstimators, setNEstimators] = useState(100);
  const [criterion, setCriterion] = useState('gini');
  const [maxDepth, setMaxDepth] = useState('');

  const handleNext = () => {
    onNext({
      n_estimators: parseInt(nEstimators),
      criterion,
      max_depth: maxDepth ? parseInt(maxDepth) : null,
      n_jobs: -1,
      random_state: 42
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Trees (n_estimators)</label>
          <input 
            type="number" 
            value={nEstimators} 
            onChange={(e) => setNEstimators(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The number of trees in the forest.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Criterion</label>
          <select 
            value={criterion} 
            onChange={(e) => setCriterion(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="gini">Gini Impurity</option>
            <option value="entropy">Entropy</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">The function to measure the quality of a split.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Max Depth (Leave blank for infinite)</label>
          <input 
            type="number" 
            value={maxDepth} 
            onChange={(e) => setMaxDepth(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
            placeholder="No limit"
          />
          <p className="text-xs text-slate-500 mt-2">The maximum depth of the tree.</p>
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
