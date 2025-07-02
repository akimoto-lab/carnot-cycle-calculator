import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CarnotResults, PVDataPoint, CarnotInputs, StatePoint } from '../types';
import { ChartLineIcon } from './Icons';

interface PVDiagramProps {
  results: CarnotResults;
  inputs: CarnotInputs;
}

const generateCurveData = (
    startPoint: StatePoint,
    endPoint: StatePoint,
    type: 'isothermal' | 'adiabatic',
    params: { mRs: number, T: number, gamma: number }
): PVDataPoint[] => {
    const points: PVDataPoint[] = [];
    const steps = 50;
    const { mRs, T, gamma } = params;
    
    const v_start = startPoint.v;
    const v_end = endPoint.v;
    const p_start = startPoint.p;

    for (let i = 0; i <= steps; i++) {
        const v = v_start + (v_end - v_start) * i / steps;
        let p;
        if (type === 'isothermal') {
            p = (mRs * T) / v;
        } else { // adiabatic
            const constant = p_start * Math.pow(v_start, gamma);
            p = constant / Math.pow(v, gamma);
        }
        points.push({ v: v, p: p / 1000 }); // Convert Pa to kPa for plotting
    }
    return points;
};


const PVDiagram: React.FC<PVDiagramProps> = ({ results, inputs }) => {
    const { s1, s2, s3, s4 } = results.states;
    const { tempHigh: tH, tempLow: tL, gamma } = inputs;

    // m*R_s can be derived from any state point, e.g., state 1
    const mRs = (s1.p * s1.v) / s1.t;

    const commonParams = { mRs, gamma };

    const isothermal12 = generateCurveData(s1, s2, 'isothermal', { ...commonParams, T: tH });
    const adiabatic23 = generateCurveData(s2, s3, 'adiabatic', { ...commonParams, T: 0 }); // T not used
    const isothermal34 = generateCurveData(s3, s4, 'isothermal', { ...commonParams, T: tL });
    const adiabatic41 = generateCurveData(s4, s1, 'adiabatic', { ...commonParams, T: 0 }); // T not used

    const CustomTooltip: React.FC<any> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-700">{`体積 (V): ${payload[0].payload.v.toExponential(3)} m³`}</p>
                    <p className="text-sm text-gray-700">{`圧力 (P): ${payload[0].value.toFixed(2)} kPa`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ChartLineIcon className="w-6 h-6"/>P-V 線図</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart margin={{ top: 5, right: 20, left: 30, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="v"
                            type="number"
                            domain={[0, 'dataMax']}
                            tickFormatter={(tick) => {
                                if (tick === 0) return '0';
                                if (tick > 10000 || (tick < 0.01 && tick > 0)) {
                                    return tick.toExponential(1);
                                }
                                return tick.toLocaleString(undefined, { maximumFractionDigits: 2 });
                            }}
                            label={{ value: '体積 V (m³)', position: 'insideBottom', offset: -15, fill: '#6b7280' }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            dataKey="p"
                            type="number"
                            domain={[0, 'dataMax']}
                            tickFormatter={(tick) => tick.toFixed(0)}
                            label={{ value: '圧力 P (kPa)', angle: -90, position: 'insideLeft', offset: -20, fill: '#6b7280' }}
                            stroke="#9ca3af"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#374151', paddingTop: '20px' }}/>
                        <Line data={isothermal12} dataKey="p" name="1→2 等温膨張" stroke="#fb923c" strokeWidth={3} dot={false} />
                        <Line data={adiabatic23} dataKey="p" name="2→3 断熱膨張" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line data={isothermal34} dataKey="p" name="3→4 等温圧縮" stroke="#38bdf8" strokeWidth={3} dot={false} />
                        <Line data={adiabatic41} dataKey="p" name="4→1 断熱圧縮" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PVDiagram;