
// ユーザーが入力するパラメータ
export interface CarnotInputs {
  tempHigh: number; // 高温熱源の温度 T_H [K]
  tempLow: number;  // 低温熱源の温度 T_L [K]
  mass: number;     // 気体の質量 m [kg]
  gasConstantSpecific: number; // 比気体定数 R_s [J/(kg·K)]
  volume1: number;   // 状態1の体積 V1 [m^3]
  heatHigh: number;  // 吸収熱量 Q_H [J]
  gamma: number;    // 比熱比 γ (Cp/Cv)
}

// 各状態点の物理量
export interface StatePoint {
  p: number; // 圧力 P [Pa]
  v: number; // 体積 V [m^3]
  t: number; // 温度 T [K]
}

// 計算結果
export interface CarnotResults {
  states: {
    s1: StatePoint;
    s2: StatePoint;
    s3: StatePoint;
    s4: StatePoint;
  };
  heatHigh: number; // 吸収した熱量 Q_H [J]
  heatLow: number;  // 放出した熱量 Q_L [J]
  work: number;     // 正味の仕事 W [J]
  efficiency: number; // 熱効率 η
  theoreticalEfficiency: number; // 理論熱効率
  entropy: {
    s_low: number;  // 低エントロピー値 (状態4, 1) [J/K]
    s_high: number; // 高エントロピー値 (状態2, 3) [J/K]
  };
}

// P-V線図のプロット用データ点
export interface PVDataPoint {
  v: number;
  p: number;
}