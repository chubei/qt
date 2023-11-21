import { Value } from "../common/interface";
import { Ma } from "./ma12.ts";

const ma22 = new Ma(22);

export default function (value: Value) {
  return ma22.process(value.price_in_dollar);
}
