import React from 'react';
import { CarnotInputs } from '../types';
import { CalculatorIcon, AlertTriangleIcon } from './Icons';

interface InputPanelProps {
  inputs: CarnotInputs;
  setInputs: React.Dispatch<React.SetStateAction<CarnotInputs>>;
  onCalculate: () => void;
  error: string | null;
}

const InputField: React.FC<{
  label: string;
  id: keyof CarnotInputs;
  value: number;
  unit: string;
  step: number;
  onChange: (id: keyof CarnotInputs, value: number) => void;
  tooltip: string;
}> = ({ label, id, value, unit, step, onChange, tooltip }) => (
  <div className="relative">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="group relative flex items-center">
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        step={step}
        onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
        className="bg-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-24"
      />
      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">{unit}</span>
      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded py-1 px-2 border border-gray-700 shadow-lg z-10">
        {tooltip}
      </div>
    </div>
  </div>
);

const InputPanel: React.FC<InputPanelProps> = ({ inputs, setInputs, onCalculate, error }) => {
  const handleInputChange = (id: keyof CarnotInputs, value: number) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">入力パラメータ</h2>
      <div className="space-y-5">
        <InputField
          label="高温熱源の温度 (T_H)"
          id="tempHigh"
          value={inputs.tempHigh}
          unit="K"
          step={10}
          onChange={handleInputChange}
          tooltip="高温熱源の絶対温度（ケルビン）"
        />
        <InputField
          label="低温熱源の温度 (T_L)"
          id="tempLow"
          value={inputs.tempLow}
          unit="K"
          step={10}
          onChange={handleInputChange}
          tooltip="低温熱源の絶対温度（ケルビン）"
        />
        <InputField
          label="気体の質量 (m)"
          id="mass"
          value={inputs.mass}
          unit="kg"
          step={0.01}
          onChange={handleInputChange}
          tooltip="作動流体の質量（キログラム）"
        />
        <InputField
          label="比気体定数 (R_s)"
          id="gasConstantSpecific"
          value={inputs.gasConstantSpecific}
          unit="J/(kg·K)"
          step={1}
          onChange={handleInputChange}
          tooltip="単位質量あたりの気体定数 (例: 空気 ≈ 287)"
        />
        <InputField
          label="初期体積 (V1)"
          id="volume1"
          value={inputs.volume1}
          unit="m³"
          step={0.01}
          onChange={handleInputChange}
          tooltip="状態1（等温膨張前）の体積（立方メートル）"
        />
        <InputField
          label="吸収熱量 (Q_H)"
          id="heatHigh"
          value={inputs.heatHigh / 1000}
          unit="kJ"
          step={1}
          onChange={(id, value) => handleInputChange(id, value * 1000)}
          tooltip="等温膨張時に吸収する熱量（キロジュール）"
        />
        <InputField
          label="比熱比 (γ)"
          id="gamma"
          value={inputs.gamma}
          unit=""
          step={0.01}
          onChange={handleInputChange}
          tooltip="定圧比熱と定積比熱の比 (単原子分子: ~1.67, 二原子分子: ~1.4)"
        />
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={onCalculate}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
      >
        <CalculatorIcon className="w-5 h-5" />
        計算実行
      </button>
    </div>
  );
};

export default InputPanel;