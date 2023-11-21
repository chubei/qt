import { Indicator, StrategyExecution } from "../common/interface.ts";
import { ActionClient } from "../common/action_client.ts";

const client: ActionClient = await ActionClient.newFile("obv");

/*
 Enter position when one of conditions is met:
 - OBV > 0

 Exit position when one of conditions is met:
 - OBV < 0
 - 5% profit
 - 60 price changes
*/

const PROFIT_MARGIN = 0.05;
const MAX_PRICE_CHANGES = 60;

interface Holding {
  ticker: string;
  buyingPrice: number;
  numQuotesSinceBuying: number;
}

function testEntryCondition(
  indicator: Indicator,
  tickerFilter: [string] | null,
): boolean {
  if (tickerFilter !== null && tickerFilter.indexOf(indicator.ticker) === -1) {
    return false;
  }
  return indicator.obv > 0;
}

function testExitCondition(
  holding: Holding,
  indicator: Indicator,
): boolean {
  if (indicator.obv < 0) {
    return true;
  }

  if (indicator.price > holding.buyingPrice * (1 + PROFIT_MARGIN)) {
    return true;
  }

  if (holding.numQuotesSinceBuying >= MAX_PRICE_CHANGES) {
    return true;
  }

  return false;
}

class Obv {
  holding: Holding | null = null;

  constructor(readonly tickerFilter: [string] | null) {}

  update(indicator: Indicator): "buy" | "sell" | "skip" {
    if (this.holding === null) {
      if (testEntryCondition(indicator, this.tickerFilter)) {
        this.holding = {
          ticker: indicator.ticker,
          buyingPrice: indicator.price,
          numQuotesSinceBuying: 0,
        };
        return "buy";
      }
    } else if (this.holding.ticker === indicator.ticker) {
      this.holding.numQuotesSinceBuying += 1;
      if (testExitCondition(this.holding, indicator)) {
        this.holding = null;
        return "sell";
      }
    }

    return "skip";
  }
}

const obv = new Obv(["AAPL"]);

export default async function (operation: { new: Indicator }) {
  const indicator = operation.new;
  const time = new Date(indicator.time);
  switch (obv.update(indicator)) {
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
