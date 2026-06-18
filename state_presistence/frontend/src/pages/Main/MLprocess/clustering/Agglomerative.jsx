import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Agglomerative({ onNext }) {
  const [nClusters, setNClusters] = useState(3);
  const [linkage, setLinkage] = useState('ward');

  const handleNext = () => {
    onNext({
      n_clusters: parseInt(nClusters),
      linkage
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Clusters</label>
          <input 
            type="number" 
            min="2"
            value={nClusters} 
            onChange={(e) => setNClusters(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The number of clusters to find.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Linkage</label>
          <select 
            value={linkage} 
            onChange={(e) => setLinkage(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="ward">Ward</option>
            <option value="complete">Complete</option>
            <option value="average">Average</option>
            <option value="single">Single</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">Which linkage criterion to use.</p>
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
