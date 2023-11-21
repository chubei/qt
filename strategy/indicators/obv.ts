import { Value } from "../common/interface.ts";

let previousDayPrice: { [key: string]: number } = {};
let obv: { [key: string]: number } = {};

const run = async (obj: Value) => {
  let price = obj.price_in_dollar;
  let volume = obj.volume;
  let ticker = obj.ticker;

  if (previousDayPrice[ticker]) {
    if (price > previousDayPrice[ticker]) {
      obv[ticker] = (obv[ticker] ?? 0) + volume;
    } else if (price === previousDayPrice[ticker]) {
      obv[ticker] = volume;
    } else {
      obv[ticker] = (obv[ticker] ?? 0) - volume;
    }
  }

  previousDayPrice[ticker] = price;

  return obv[ticker];
};

export default run;
