import React, { useState, useEffect, useCallback } from 'react';
import { CarnotInputs, CarnotResults } from './types';
import { useCarnotCycle } from './hooks/useCarnotCycle';
import InputPanel from './components/InputPanel';
import ResultsDisplay from './components/ResultsDisplay';
import PVDiagram from './components/PVDiagram';
import TSDiagram from './components/TSDiagram';
import { ThermometerIcon, GithubIcon } from './components/Icons';

const DEFAULT_INPUTS: CarnotInputs = {
  tempHigh: 600,     // K
  tempLow: 300,      // K
  mass: 1.0,         // kg
  gasConstantSpecific: 287, // J/(kg·K) for air
  volume1: 1.0,      // m^3
  heatHigh: 100000,  // J (100 kJ)
  gamma: 1.4,        // for diatomic gas
};

function App(): React.ReactNode {
  const [inputs, setInputs] = useState<CarnotInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CarnotResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { calculateCarnotCycle } = useCarnotCycle();

  const handleCalculate = useCallback(() => {
    const result = calculateCarnotCycle(inputs);
    if ('error' in result) {
      setError(result.error);
      setResults(null);
    } else {
      setResults(result);
      setError(null);
    }
  }, [inputs, calculateCarnotCycle]);

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <ThermometerIcon className="w-10 h-10 text-indigo-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">カルノーサイクル計算機</h1>
              <p className="text-sm sm:text-md text-gray-500 mt-1">Carnot Cycle Calculator</p>
            </div>
          </div>
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-7 h-7" />
          </a>
        </header>

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <InputPanel inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} error={error} />
          </div>

          <div className="lg:col-span-2">
            {results ? (
              <div className="space-y-8">
                <ResultsDisplay results={results} inputs={inputs} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PVDiagram results={results} inputs={inputs} />
                  <TSDiagram results={results} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 h-full flex items-center justify-center border border-gray-200 shadow-sm">
                <p className="text-gray-500">入力値を設定して「計算」ボタンを押してください。</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;