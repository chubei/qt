import {} from "./init_lambda.ts";
import { Basic } from "../strategies/basic.ts";
import { Indicator } from "./interface.ts";

const strategies = [new Basic()];

const run = async (v: { new: Indicator }) => {
  for (const strategy of strategies) {
    await strategy.run(v);
  }
};

export default run;
