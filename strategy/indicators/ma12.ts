import { Value } from "../common/interface";

export class Ma {
  history: number[] = [];

  constructor(readonly windowSize: number) {}

  process(value: number): number | null {
    this.history.push(value);

    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    if (this.history.length === this.windowSize) {
      return this.history.reduce((a, b) => a + b, 0) / this.windowSize;
    }

    return null;
  }
}

const tickerToMa12 = new Map<string, Ma>();

export default function (value: Value) {
  let ma12 = tickerToMa12.get(value.ticker);
  if (!ma12) {
    ma12 = new Ma(12);
    tickerToMa12.set(value.ticker, ma12);
  }
  return ma12.process(value.price_in_dollar);
}
