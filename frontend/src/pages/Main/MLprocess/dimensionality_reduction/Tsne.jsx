import React, { useState } from 'react';

export default function Tsne({ onNext }) {
  const [nComponents, setNComponents] = useState(2);
  const [perplexity, setPerplexity] = useState(30.0);
  const [learningRate, setLearningRate] = useState('auto');

  const handleNext = () => {
    onNext({
      n_components: parseInt(nComponents),
      perplexity: parseFloat(perplexity),
      learning_rate: learningRate === 'auto' ? 'auto' : parseFloat(learningRate)
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
            max="3"
            value={nComponents}
            onChange={(e) => setNComponents(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Dimension of the embedded space (typically 2 or 3).</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Perplexity</label>
          <input
            type="number"
            min="5"
            max="50"
            step="0.1"
            value={perplexity}
            onChange={(e) => setPerplexity(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Related to the number of nearest neighbors (usually between 5 and 50).</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Learning Rate</label>
          <input
            type="text"
            value={learningRate}
            onChange={(e) => setLearningRate(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
            placeholder="auto or float (e.g., 200.0)"
          />
          <p className="text-xs text-slate-500 mt-2">The learning rate for t-SNE optimization.</p>
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
