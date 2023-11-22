import { Value } from "../common/interface";
import { Ma } from "./ma12.ts";

const tickerToMa5 = new Map<string, Ma>();

export default function (value: Value) {
  let ma5 = tickerToMa5.get(value.ticker);
  if (!ma5) {
    ma5 = new Ma(5);
    tickerToMa5.set(value.ticker, ma5);
  }
  return ma5.process(value.price_in_dollar);
}
