import { Value } from "../common/interface";

class Ma {
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

const ma12 = new Ma(12);

export default function (value: Value) {
  return ma12.process(value.price_in_dollar);
}
