
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CarnotResults } from '../types';
import { SparklesIcon } from './Icons';

interface TSDiagramProps {
  results: CarnotResults;
}

const TSDiagram: React.FC<TSDiagramProps> = ({ results }) => {
    const { states, entropy } = results;

    // P-V線図と色と凡例を合わせるために、各過程のデータを個別に定義
    const data12 = [{ s: entropy.s_low,  t: states.s1.t }, { s: entropy.s_high, t: states.s2.t }]; // 等温膨張
    const data23 = [{ s: entropy.s_high, t: states.s2.t }, { s: entropy.s_high, t: states.s3.t }]; // 断熱膨張
    const data34 = [{ s: entropy.s_high, t: states.s3.t }, { s: entropy.s_low,  t: states.s4.t }]; // 等温圧縮
    const data41 = [{ s: entropy.s_low,  t: states.s4.t }, { s: entropy.s_low,  t: states.s1.t }]; // 断熱圧縮

    const CustomTooltip: React.FC<any> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/80 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm text-gray-700">{`エントロピー変化量 (ΔS): ${payload[0].payload.s.toFixed(2)} J/K`}</p>
                    <p className="text-sm text-gray-700">{`温度 (T): ${payload[0].value.toFixed(2)} K`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-indigo-600"/>T-S 線図</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="s"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(tick) => tick.toFixed(1)}
                            label={{ value: 'エントロピー変化量 ΔS (J/K)', position: 'insideBottom', offset: -15, fill: '#6b7280' }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            dataKey="t"
                            type="number"
                            domain={['dataMin - 50', 'dataMax + 50']}
                            tickFormatter={(tick) => tick.toFixed(0)}
                            label={{ value: '温度 T (K)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280' }}
                            stroke="#9ca3af"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#374151', paddingTop: '20px' }}/>
                        
                        <Line data={data12} dataKey="t" name="1→2 等温膨張" stroke="#fb923c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line data={data23} dataKey="t" name="2→3 断熱膨張" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line data={data34} dataKey="t" name="3→4 等温圧縮" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line data={data41} dataKey="t" name="4→1 断熱圧縮" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TSDiagram;
