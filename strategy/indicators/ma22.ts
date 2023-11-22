import { Value } from "../common/interface";
import { Ma } from "./ma12.ts";

const tickerToMa22 = new Map<string, Ma>();

export default function (value: Value) {
  let ma22 = tickerToMa22.get(value.ticker);
  if (!ma22) {
    ma22 = new Ma(22);
    tickerToMa22.set(value.ticker, ma22);
  }
  return ma22.process(value.price_in_dollar);
}
