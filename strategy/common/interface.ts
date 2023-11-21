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
  obv: number | null;
  ma5: number | null;
  ma12: number | null;
  ma22: number | null;
  rsi: number | null;
}

export function shouldConsiderTicker(
  ticker: string,
  tickerFilter: [string] | null,
) {
  if (tickerFilter === null) {
    return true;
  }

  return tickerFilter.includes(ticker);
}
