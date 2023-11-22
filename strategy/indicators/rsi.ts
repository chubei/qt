import { Value } from "../common/interface.ts";
import { Ma } from "./ma12.ts";

class Rsi {
  averageGain: Ma;
  averageLoss: Ma;
  previousPrice: number | null = null;

  constructor(readonly windowSize: number) {
    this.averageGain = new Ma(windowSize);
    this.averageLoss = new Ma(windowSize);
  }

  process(price: number): number | null {
    if (this.previousPrice === null) {
      this.previousPrice = price;
      return null;
    }

    const change = price - this.previousPrice;
    this.previousPrice = price;

    let gain, loss;
    if (change > 0) {
      gain = change;
      loss = 0;
    } else {
      gain = 0;
      loss = -change;
    }

    const averageGain = this.averageGain.process(gain);
    const averageLoss = this.averageLoss.process(loss);

    if (averageGain === null || averageLoss === null) {
      return null;
    }

    const relativeStrength = averageGain / averageLoss;
    const rsi = 100 - (100 / (1 + relativeStrength));

    return rsi;
  }
}

const tickerToMsi = new Map<string, Rsi>();

export default function (value: Value) {
  let rsi = tickerToMsi.get(value.ticker);
  if (!rsi) {
    rsi = new Rsi(14);
    tickerToMsi.set(value.ticker, rsi);
  }
  return rsi.process(value.price_in_dollar);
}
