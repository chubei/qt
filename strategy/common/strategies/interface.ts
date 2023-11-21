export interface Value {
    ticker: string,
    price_in_dollar: number,
    time: number,
    indicator: number
}

export interface StrategyExecution {
    run(v: { new: { value: Value } }): void;
}