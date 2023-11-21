import { Value } from "../common/interface";
import { Ma } from "./ma12.ts";

const ma5 = new Ma(5);

export default function (value: Value) {
  return ma5.process(value.price_in_dollar);
}
