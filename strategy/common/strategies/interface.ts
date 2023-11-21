export interface Value {
    ticker: string,
    price: number,
    time: number,
    obv: number,
}

export interface StrategyExecution {
    run(v: { new: Value }): void;
}