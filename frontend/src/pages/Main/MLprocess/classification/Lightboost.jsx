import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function LightBoost({ onNext }) {
  const [nEstimators, setNEstimators] = useState(100);
  const [learningRate, setLearningRate] = useState(0.1);
  const [numLeaves, setNumLeaves] = useState(31);

  const handleNext = () => {
    onNext({
      n_estimators: parseInt(nEstimators),
      learning_rate: parseFloat(learningRate),
      num_leaves: parseInt(numLeaves),
      random_state: 42,
      n_jobs: -1
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Estimators</label>
          <input 
            type="number" 
            value={nEstimators} 
            onChange={(e) => setNEstimators(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Learning Rate</label>
          <input 
            type="number" 
            step="0.01"
            value={learningRate} 
            onChange={(e) => setLearningRate(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Leaves (num_leaves)</label>
          <input 
            type="number" 
            value={numLeaves} 
            onChange={(e) => setNumLeaves(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Main parameter to control the complexity of the tree model.</p>
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
