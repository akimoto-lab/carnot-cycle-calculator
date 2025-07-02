import React, { useState } from 'react';
import { CarnotInputs, CarnotResults } from '../types';
import { BeakerIcon, ChevronDownIcon } from './Icons';

interface CalculationDetailsProps {
    results: CarnotResults;
    inputs: CarnotInputs;
}

const format = (value: number, precision = 3) => {
    if (value === 0) return '0';
    const absValue = Math.abs(value);
    if (absValue > 1e4 || absValue < 1e-2) {
        return value.toExponential(precision);
    }
    return value.toFixed(precision);
};


const FormulaItem: React.FC<{ title: string, formula: React.ReactNode, calculation: React.ReactNode, result: React.ReactNode, unit: string }> = ({ title, formula, calculation, result, unit }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
        <div className="font-mono text-sm space-y-2">
            <p className="text-indigo-600">{formula}</p>
            <p className="text-gray-500 break-words leading-relaxed">{calculation}</p>
            <p className="text-gray-900">≈ {result} <span className="font-sans text-gray-500">{unit}</span></p>
        </div>
    </div>
);


const CalculationDetails: React.FC<CalculationDetailsProps> = ({ results, inputs }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { mass, gasConstantSpecific: rS, gamma, tempHigh: tH, tempLow: tL, heatHigh: qH } = inputs;
    const { states, heatLow, work, efficiency, theoreticalEfficiency, entropy } = results;
    const { s1, s2, s3, s4 } = states;

    const mRs = mass * rS;

    return (
        <div className="border-t border-gray-200 pt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800"
                aria-expanded={isOpen}
                aria-controls="calculation-details-panel"
            >
                <span className="flex items-center gap-2"><BeakerIcon className="w-5 h-5"/>計算過程</span>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div id="calculation-details-panel" className="mt-4 space-y-6">
                    <div>
                        <p className="text-gray-600 text-sm mb-4">
                            まず、入力された値から計算の基礎となる値を算出します。「m⋅Rₛ」は気体の状態方程式で繰り返し使われる係数です。状態1の圧力(P₁)は、理想気体の状態方程式から導出されます。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormulaItem title="m⋅Rₛ" formula={<>mRₛ = m ⋅ Rₛ</>} calculation={<>mRₛ = {format(mass)} ⋅ {format(rS)}</>} result={format(mRs)} unit="J/K"/>
                             <FormulaItem title="状態1の圧力 (P₁)" formula={<>P₁ = mRₛ ⋅ T_H / V₁</>} calculation={<>P₁ = ({format(mRs)} ⋅ {format(tH)}) / {format(s1.v)}</>} result={format(s1.p)} unit="Pa"/>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-md font-semibold text-indigo-600 border-b border-indigo-600/20 pb-2">状態変化 1 → 2 (等温膨張)</h3>
                        <p className="text-gray-600 text-sm mt-3 mb-4">
                            高温熱源(T_H)に接しながら、気体が熱(Q_H)を吸収して膨張する過程です。温度はT_Hで一定に保たれます。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormulaItem title="状態2の体積 (V₂)" formula={<>V₂ = V₁ ⋅ exp(Q_H / (mRₛ ⋅ T_H))</>} calculation={<>V₂ = {format(s1.v)} ⋅ exp({format(qH)} / ({format(mRs)} ⋅ {format(tH)}))</>} result={format(s2.v)} unit="m³"/>
                            <FormulaItem title="状態2の圧力 (P₂)" formula={<>P₂ = mRₛ ⋅ T_H / V₂</>} calculation={<>P₂ = ({format(mRs)} ⋅ {format(tH)}) / {format(s2.v)}</>} result={format(s2.p)} unit="Pa"/>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-indigo-600 border-b border-indigo-600/20 pb-2">状態変化 2 → 3 (断熱膨張)</h3>
                        <p className="text-gray-600 text-sm mt-3 mb-4">
                            外部との熱のやり取りを断った状態で、気体が膨張する過程です。気体は内部エネルギーを使って仕事をするため、温度がT_HからT_Lまで下がります。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormulaItem title="状態3の体積 (V₃)" formula={<>V₃ = V₂ ⋅ (T_H / T_L)^(1/(γ-1))</>} calculation={<>V₃ = {format(s2.v)} ⋅ ({format(tH)} / {format(tL)})^(1/({gamma}-1))</>} result={format(s3.v)} unit="m³"/>
                            <FormulaItem title="状態3の圧力 (P₃)" formula={<>P₃ = mRₛ ⋅ T_L / V₃</>} calculation={<>P₃ = ({format(mRs)} ⋅ {format(tL)}) / {format(s3.v)}</>} result={format(s3.p)} unit="Pa"/>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-indigo-600 border-b border-indigo-600/20 pb-2">状態変化 3 → 4 (等温圧縮)</h3>
                        <p className="text-gray-600 text-sm mt-3 mb-4">
                           低温熱源(T_L)に接しながら、外部から仕事をされて気体が圧縮される過程です。発生した熱(Q_L)は低温熱源に放出され、温度はT_Lで一定に保たれます。
                        </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormulaItem title="状態4の体積 (V₄)" formula={<>V₄ = V₁ ⋅ (T_H / T_L)^(1/(γ-1))</>} calculation={<>V₄ = {format(s1.v)} ⋅ ({format(tH)} / {format(tL)})^(1/({gamma}-1))</>} result={format(s4.v)} unit="m³"/>
                            <FormulaItem title="状態4の圧力 (P₄)" formula={<>P₄ = mRₛ ⋅ T_L / V₄</>} calculation={<>P₄ = ({format(mRs)} ⋅ {format(tL)}) / {format(s4.v)}</>} result={format(s4.p)} unit="Pa"/>
                        </div>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold text-indigo-600 border-b border-indigo-600/20 pb-2">状態変化 4 → 1 (断熱圧縮)</h3>
                      <p className="text-gray-600 text-sm mt-3">
                        外部との熱のやり取りを断った状態で、外部から仕事をされて気体が圧縮される過程です。これにより温度がT_LからT_Hまで上昇し、最初の状態1に戻ります。
                      </p>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-indigo-600 border-b border-indigo-600/20 pb-2">エントロピー</h3>
                         <p className="text-gray-600 text-sm mt-3 mb-4">
                           エントロピーは、系の「乱雑さ」や「無秩序さ」を表す物理量です。カルノーサイクルでは、等温過程で熱の出入りがあるときにのみ変化します。T-S線図の横軸はこのエントロピー変化(ΔS)を示します。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormulaItem 
                                title="エントロピー変化 (ΔS)" 
                                formula={<>ΔS = Q_H / T_H</>} 
                                calculation={<>ΔS = {format(qH)} / {format(tH)}</>} 
                                result={format(entropy.s_high)} 
                                unit="J/K"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-md font-semibold text-indigo-600 border-b border-indigo-600/20 pb-2">熱量・仕事・効率</h3>
                         <p className="text-gray-600 text-sm mt-3 mb-4">
                            サイクル全体での熱の出入りと仕事、そしてこのサイクルの効率を計算します。
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormulaItem title="放出熱量 (Q_L)" formula={<>Q_L = mRₛ ⋅ T_L ⋅ ln(V₃/V₄)</>} calculation={<>Q_L = {format(mRs)} ⋅ {format(tL)} ⋅ ln({format(s3.v)}/{format(s4.v)})</>} result={format(heatLow)} unit="J"/>
                           <FormulaItem title="正味の仕事 (W)" formula={<>W = Q_H - Q_L</>} calculation={<>W = {format(qH)} - {format(heatLow)}</>} result={format(work)} unit="J"/>
                           <FormulaItem title="熱効率 (η)" formula={<>η = W / Q_H</>} calculation={<>η = {format(work)} / {format(qH)}</>} result={(efficiency * 100).toFixed(2)} unit="%"/>
                           <FormulaItem title="理論熱効率 (η_th)" formula={<>η_th = 1 - T_L / T_H</>} calculation={<>η_th = 1 - {format(tL)} / {format(tH)}</>} result={(theoreticalEfficiency * 100).toFixed(2)} unit="%"/>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default CalculationDetails;