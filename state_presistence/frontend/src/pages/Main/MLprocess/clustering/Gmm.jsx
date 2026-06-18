import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function Gmm({ onNext }) {
  const [nComponents, setNComponents] = useState(3);
  const [covarianceType, setCovarianceType] = useState('full');

  const handleNext = () => {
    onNext({
      n_components: parseInt(nComponents),
      covariance_type: covarianceType
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Components</label>
          <input 
            type="number" 
            min="2"
            value={nComponents} 
            onChange={(e) => setNComponents(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">The number of mixture components.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Covariance Type</label>
          <select 
            value={covarianceType} 
            onChange={(e) => setCovarianceType(e.target.value)}
            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
          >
            <option value="full">Full</option>
            <option value="tied">Tied</option>
            <option value="diag">Diag</option>
            <option value="spherical">Spherical</option>
          </select>
          <p className="text-xs text-slate-500 mt-2">String describing the type of covariance parameters to use.</p>
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
