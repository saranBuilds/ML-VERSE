import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Knn({ onNext }) {
  const [nNeighbors, setNNeighbors] = useState(5);
  const [weights, setWeights] = useState('uniform');
  const [metric, setMetric] = useState('minkowski');

  const handleNext = () => {
    onNext({
      n_neighbors: parseInt(nNeighbors),
      weights,
      metric,
      n_jobs: -1
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Neighbors (n_neighbors)</label>
          <input 
            type="number" 
            value={nNeighbors} 
            onChange={(e) => setNNeighbors(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Number of neighbors to use by default for queries.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Weights</label>
          <select 
            value={weights} 
            onChange={(e) => setWeights(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="uniform">Uniform</option>
            <option value="distance">Distance</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Weight function used in prediction. 'Uniform' means all points are weighted equally.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Distance Metric</label>
          <select 
            value={metric} 
            onChange={(e) => setMetric(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="minkowski">Minkowski</option>
            <option value="euclidean">Euclidean</option>
            <option value="manhattan">Manhattan</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">The distance metric to use for the tree.</p>
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
