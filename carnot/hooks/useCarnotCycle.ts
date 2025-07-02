
import { useCallback } from 'react';
import { CarnotInputs, CarnotResults, StatePoint } from '../types';

export const useCarnotCycle = () => {
  const calculateCarnotCycle = useCallback((inputs: CarnotInputs): CarnotResults | { error: string } => {
    const { tempHigh: tH, tempLow: tL, mass, gasConstantSpecific: rS, volume1, heatHigh: qH, gamma } = inputs;

    // --- 入力値の検証 ---
    if (tH <= 0 || tL <= 0 || mass <= 0 || rS <= 0 || volume1 <= 0 || qH <= 0 || gamma <= 1) {
      return { error: '温度、質量、比気体定数、体積、熱量は正の値で、γ > 1 である必要があります。' };
    }
    if (tH <= tL) {
      return { error: '高温熱源(T_H)は低温熱源(T_L)より高温である必要があります。' };
    }

    // --- 各状態点の計算 ---

    // m*R_s を計算
    const mRs = mass * rS;
    
    // 状態1 (等温膨張 開始) - P1を計算
    // PV = mR_sT より P = mR_sT / V
    const t1 = tH;
    const v1 = volume1;
    const p1 = (mRs * t1) / v1;
    if (isNaN(p1) || p1 <= 0) {
        return { error: '入力値から有効な初期圧力を計算できません。' };
    }
    const s1: StatePoint = { p: p1, v: v1, t: t1 };

    // 状態2 (等温膨張 終了 / 断熱膨張 開始)
    // Q_H = m*R_s*T_H * ln(V2/V1) より V2を計算
    const t2 = tH;
    const v2 = v1 * Math.exp(qH / (mRs * tH));
    if (isNaN(v2) || v2 <= v1) {
        return { error: '熱量Q_Hが小さすぎるか、無効な値です。' };
    }
    const p2 = (mRs * t2) / v2;
    const s2: StatePoint = { p: p2, v: v2, t: t2 };

    // 状態3 (断熱膨張 終了 / 等温圧縮 開始)
    const t3 = tL;
    // T2 * V2^(γ-1) = T3 * V3^(γ-1)  => V3 = V2 * (T2/T3)^(1/(γ-1))
    const v3 = v2 * Math.pow(t2 / t3, 1 / (gamma - 1));
    const p3 = (mRs * t3) / v3;
    const s3: StatePoint = { p: p3, v: v3, t: t3 };

    // 状態4 (等温圧縮 終了 / 断熱圧縮 開始)
    const t4 = tL;
    // T1 * V1^(γ-1) = T4 * V4^(γ-1) => V4 = V1 * (T1/T4)^(1/(γ-1))
    const v4 = v1 * Math.pow(t1 / t4, 1 / (gamma - 1));
    const p4 = (mRs * t4) / v4;
    const s4: StatePoint = { p: p4, v: v4, t: t4 };
    
    // --- 熱量、仕事、効率の計算 ---
    // Q_H: 入力値
    const heatHigh = qH;

    // Q_L: 等温圧縮 (3->4) で放出する熱量 (絶対値)
    // Q = m*R_s*T * ln(V_final/V_initial) -> V4/V3 < 1 なので、絶対値を取るために ln(V3/V4)
    const heatLow = mRs * tL * Math.log(v3 / v4);
    
    // W: サイクル全体での正味の仕事
    const work = heatHigh - heatLow;

    // η: 熱効率
    const efficiency = work / heatHigh;

    // η_th: 理論熱効率
    const theoreticalEfficiency = 1 - tL / tH;

    // エントロピー変化 (T-S線図用)
    // ΔS = Q_H / T_H
    const entropyChange = heatHigh / tH;

    return {
      states: { s1, s2, s3, s4 },
      heatHigh,
      heatLow,
      work,
      efficiency,
      theoreticalEfficiency,
      entropy: {
        s_low: 0, // 基準エントロピーを0とする
        s_high: entropyChange,
      }
    };
  }, []);

  return { calculateCarnotCycle };
};