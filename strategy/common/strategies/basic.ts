import {StrategyExecution, Value} from "./interface.ts";
import {ActionClient} from "../action_client.ts";

let client: ActionClient = await ActionClient.new(12345);

/*
 Enter position when one of conditions is met:
 - OBV > 0

 Exit position when one of conditions is met:
 - OBV < 0
 - 5% profit
 - 60 price changes
*/

const PROFIT_MARGIN = 0.01;
const MAX_PRICE_CHANGES = 10;

let previousDayPrice: {[key: string]: number} = {};

let entryPoint: {[key: string]: {price: number, date: Date, priceChanges: number}} = {};

let testEntryCondition = (indicator: number) => {
    return indicator > 0;
};

let testExitCondition = (ticker: string, price: number, indicator: number) => {
    if (indicator < 0) {
        console.log(`${ticker} exiting because of obv < 0`);
        return true;
    }

    if (entryPoint[ticker]?.price && price > entryPoint[ticker]?.price * (1 + PROFIT_MARGIN)) {
        console.log(`${ticker} exiting because of profit ${PROFIT_MARGIN * 100}% reached`);
        return true;
    }


    if (entryPoint[ticker]?.priceChanges > MAX_PRICE_CHANGES) {
        console.log(`${ticker} exiting because of max price changes reached`);
        return true;
    }
};

export class Basic implements StrategyExecution {
    async run(v: { new: Value }): void {
        let obj = v.new;
        let price = obj.price;
        let date = new Date(obj.time);
        let ticker = obj.ticker;
        let indicator = obj.obv;

        previousDayPrice[ticker] = price;

        if (entryPoint[ticker]?.date) {
            if (testExitCondition(ticker, price, indicator)) {
                console.log(`Exit point ${ticker} ${entryPoint[ticker].price} -> ${price}`);
                console.log(`Profit ${Math.round(((price / entryPoint[ticker].price ) - 1) * 1000000) / 10000}%`);

                entryPoint[ticker].price = 0;
                entryPoint[ticker].date = null;

                await client.sell(date, ticker, price);
            } else {
                await client.skip(date, ticker, price);
                entryPoint[ticker].priceChanges += 1;
            }
        } else {
            if (testEntryCondition(indicator)) {
                entryPoint[ticker] = {
                    price,
                    date,
                    priceChanges: 0
                };

                console.log(`Entry point ${ticker} ${entryPoint[ticker].price} ${entryPoint[ticker].date}`);
                await client.buy(date, ticker, price);
            } else {
                await client.skip(date, ticker, price);
            }
        }
    }
}