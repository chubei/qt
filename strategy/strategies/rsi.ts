import { ActionClient } from "../common/action_client.ts";
import { Indicator, shouldConsiderTicker } from "../common/interface.ts";

class Rsi {
  holding: string | null = null;

  constructor(readonly tickerFilter: [string] | null) {}

  update(indicator: Indicator): "buy" | "sell" | "skip" {
    if (indicator.rsi === null) {
      return "skip";
    }

    if (this.holding === null) {
      if (
        shouldConsiderTicker(indicator.ticker, this.tickerFilter) &&
        indicator.rsi < 50
      ) {
        this.holding = indicator.ticker;
        return "buy";
      }
    } else if (this.holding === indicator.ticker) {
      if (indicator.rsi > 50) {
        this.holding = null;
        return "sell";
      }
    }
    return "skip";
  }
}

const rsi = new Rsi(["AAPL"]);
const client = await ActionClient.newFile("rsi");

export default async function (operation: { new: Indicator }) {
  const indicator = operation.new;
  const time = new Date(indicator.time);
  switch (rsi.update(indicator)) {
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
