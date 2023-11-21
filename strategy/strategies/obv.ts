import {ActionClient} from "../common/action_client.ts";
import {} from "../common/init_lambda.ts";

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
const MAX_PRICE_CHANGES = 3;

let previousDayPrice: {[key: string]: number} = {};
let obv: {[key: string]: number} = {};

let entryPoint: {[key: string]: {price: number, date: Date, priceChanges: number}} = {
};

let testEntryCondition = (ticker: string) => {
    if (obv[ticker] > 0) {
        return true;
    }
};

let testExitCondition = (ticker: string, price: number) => {
    if (obv[ticker] < 0) {
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

let balance: {[key: string]: number} = {};

interface Value {
    new: {
        value: {
            ticker: string,
            price_in_dollar: string,
            volume: string,
            time: number,
            asset_type: string
        }
    }
}
const run = async (obj: Value) => {
    let newValue = obj.new.value;
    let price = parseFloat(newValue.price_in_dollar);
    let volume = parseFloat(newValue.volume);
    let date = new Date(newValue.time);
    let ticker = newValue.ticker;

    if (previousDayPrice[ticker]) {
        if (price > previousDayPrice[ticker]) {
            obv[ticker] = (obv[ticker] ?? 0) + volume;
        } else if (price === previousDayPrice[ticker]) {
            obv[ticker] = volume;
        } else {
            obv[ticker] = (obv[ticker] ?? 0) - volume;
        }
    } else {
        balance[ticker] = 1000;
    }

    previousDayPrice[ticker] = price;

    if (entryPoint[ticker]?.date) {
        if (testExitCondition(ticker, price)) {
            balance[ticker] *= price / entryPoint[ticker].price;

            console.log(`Exit point ${ticker} ${price} ${volume}`);
            console.log(`Balance ${ticker} ${balance[ticker]}`);

            entryPoint[ticker].price = 0;
            entryPoint[ticker].date = null;

            await client.sell(date, ticker, price);
        } else {
            entryPoint[ticker].priceChanges += 1;
        }
    } else {
        if (testEntryCondition(ticker)) {
            entryPoint[ticker] = {
                price,
                date,
                priceChanges: 0
            };

            console.log(`Entry point ${ticker} ${entryPoint[ticker].price} ${entryPoint[ticker].date}`);
            await client.buy(date, ticker, price);
        }
    }
}

export default run;