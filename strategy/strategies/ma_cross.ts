import { ActionClient } from "../common/action_client.ts";
import { Indicator, shouldConsiderTicker } from "../common/interface.ts";

class MaCross {
  holding: string | null = null;

  constructor(readonly tickerFilter: [string] | null) {}

  update(indicator: Indicator): "buy" | "sell" | "skip" {
    if (indicator.ma5 === null || indicator.ma22 === null) {
      return "skip";
    }

    if (this.holding === null) {
      if (
        shouldConsiderTicker(indicator.ticker, this.tickerFilter) &&
        indicator.ma5 > indicator.ma22 && indicator.price > indicator.ma5
      ) {
        this.holding = indicator.ticker;
        return "buy";
      }
    } else if (this.holding === indicator.ticker) {
      if (indicator.ma5 < indicator.ma22 && indicator.price < indicator.ma5) {
        this.holding = null;
        return "sell";
      }
    }
    return "skip";
  }
}

const maCross = new MaCross(["AAPL"]);
const client = await ActionClient.newGrpc("ma cross", 12345);

export default async function (operation: { new: Indicator }) {
  const indicator = operation.new;
  const time = new Date(indicator.time);
  switch (maCross.update(indicator)) {
    case "buy":
      await client.buy(time, indicator.ticker, indicator.price);
      break;
    case "sell":
      await client.sell(time, indicator.ticker, indicator.price);
      break;
    case "skip":
      await client.skip(time, indicator.ticker, indicator.price);
      break;
  }
}
