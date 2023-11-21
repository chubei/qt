import {} from "./../init_lambda.ts";

let previousDayPrice: {[key: string]: number} = {};
let obv: {[key: string]: number} = {};

interface Value {
    ticker: string,
    price_in_dollar: string,
    volume: string,
    time: number,
    asset_type: string
}

const run = async (obj: Value) => {
    let price = parseFloat(obj.price_in_dollar);
    let volume = parseFloat(obj.volume);
    let ticker = obj.ticker;

    if (previousDayPrice[ticker]) {
        if (price > previousDayPrice[ticker]) {
            obv[ticker] = (obv[ticker] ?? 0) + volume;
        } else if (price === previousDayPrice[ticker]) {
            obv[ticker] = volume;
        } else {
            obv[ticker] = (obv[ticker] ?? 0) - volume;
        }
    }

    previousDayPrice[ticker] = price;

    return obv[ticker];
}

export default run;