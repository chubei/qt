export interface Value {
  ticker: string;
  price_in_dollar: number;
  volume: number;
  time: string;
  asset_type: string;
}

export interface Indicator {
  ticker: string;
  price: number;
  time: number;
  obv: number;
}

export interface StrategyExecution {
  run(v: { new: Indicator }): void;
}
