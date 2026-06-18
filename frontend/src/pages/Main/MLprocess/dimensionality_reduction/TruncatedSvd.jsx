import React, { useState } from 'react';

export default function TruncatedSvd({ onNext }) {
  const [nComponents, setNComponents] = useState(2);

  const handleNext = () => {
    onNext({
      n_components: parseInt(nComponents)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Components</label>
          <input
            type="number"
            min="1"
            value={nComponents}
            onChange={(e) => setNComponents(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Desired dimensionality of output data.</p>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all hover:-translate-y-0.5"
        >
          Confirm & Proceed
        </button>
      </div>
    </div>
  );
}
