import React from 'react';
import { CarnotResults, StatePoint, CarnotInputs } from '../types';
import { ChartBarIcon, CpuChipIcon, FireIcon, TrendingUpIcon } from './Icons';
import CalculationDetails from './CalculationDetails';

interface ResultsDisplayProps {
  results: CarnotResults;
  inputs: CarnotInputs;
}

const formatValueWithPower = (value: number): React.ReactNode => {
  if (value === 0) return '0.000';
  if (Math.abs(value) > 10000 || (Math.abs(value) < 0.01 && value !== 0)) {
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);
    return (
      <>
        {mantissa.toFixed(3)} × 10<sup>{exponent}</sup>
      </>
    );
  }
  return value.toFixed(3);
};


const StatePointCard: React.FC<{ label: string, state: StatePoint }> = ({ label, state }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm font-bold text-indigo-600 mb-2">{label}</p>
        <div className="space-y-1 text-sm text-gray-600">
            <p>圧力 (P): <span className="font-mono text-gray-900">{formatValueWithPower(state.p / 1000)}</span> kPa</p>
            <p>体積 (V): <span className="font-mono text-gray-900">{formatValueWithPower(state.v)}</span> m³</p>
            <p>温度 (T): <span className="font-mono text-gray-900">{state.t.toFixed(2)}</span> K</p>
        </div>
    </div>
);

const ResultMetric: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode, unit: string, tooltip: string }> = ({ icon, label, value, unit, tooltip }) => (
    <div className="relative group bg-gray-50 p-4 rounded-lg flex items-start gap-4 border border-gray-200">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value} <span className="text-base font-normal text-gray-500">{unit}</span></p>
        </div>
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded py-1 px-2 border border-gray-700 shadow-lg z-10">
            {tooltip}
        </div>
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, inputs }) => {
  const { states, heatHigh, heatLow, work, theoreticalEfficiency } = results;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ChartBarIcon className="w-6 h-6"/>計算結果</h2>

      <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><CpuChipIcon className="w-5 h-5"/>状態点</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatePointCard label="状態 1" state={states.s1} />
              <StatePointCard label="状態 2" state={states.s2} />
              <StatePointCard label="状態 3" state={states.s3} />
              <StatePointCard label="状態 4" state={states.s4} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FireIcon className="w-5 h-5"/>熱量・仕事・効率</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultMetric icon={<TrendingUpIcon className="w-5 h-5 text-green-500"/>} label="吸収熱量 (Q_H)" value={formatValueWithPower(heatHigh)} unit="J" tooltip="高温熱源から吸収した熱量" />
                <ResultMetric icon={<TrendingUpIcon className="w-5 h-5 text-red-500 rotate-180"/>} label="放出熱量 (Q_L)" value={formatValueWithPower(heatLow)} unit="J" tooltip="低温熱源へ放出した熱量" />
                <ResultMetric icon={<TrendingUpIcon className="w-5 h-5 text-blue-500"/>} label="正味の仕事 (W)" value={formatValueWithPower(work)} unit="J" tooltip="1サイクルあたりに取り出せる仕事 (W = Q_H - Q_L)" />
                <ResultMetric 
                  icon={<TrendingUpIcon className="w-5 h-5 text-purple-500"/>}
                  label="理論熱効率 (η_th)" 
                  value={(theoreticalEfficiency * 100).toFixed(2)} 
                  unit="%"
                  tooltip="理論上の最大熱効率 (η = 1 - T_L / T_H)"
                />
            </div>
          </div>
          
          <CalculationDetails results={results} inputs={inputs} />
      </div>
    </div>
  );
};

export default ResultsDisplay;