# Dozer as a Quantitative Trading Platform

## Strategy Dozer

First start trading dozer and deposit some fund.

```bash
cd trading
dozer run
deno run --allow-all deposit.ts ${strategy1} ${strategy2}
```

Now run the strategy.

```bash
cd strategy
dozer run
```

You can check the net worth change in `http://localhost:9080/net_worth`.

### Temporary workaround

Because Dozer crashes if lambda starts async tasks, currently we're using
`ActionClient.newFile` to output the actions to a JSONL file, instead of
directly ingesting to trading application.

After the strategy finishes, run the following command to ingest:

```bash
deno run --allow-all trading/mock/ingest_from_file.ts ${strategy1_output} ${strategy2_output} ...
```

`ingest_from_file` adds Deposit action at the beginning automatically, so don't
have to run `deposit.ts`.

## Trading Dozer

Go to `./trading`.

```bash
dozer run
```

This starts the trading application.

To test the trading application with mock data:

```bash
deno run --allow-all ingest_mock_data.ts
```

## Schema

```dbml
Table price {
  ticker string
  time timestamp
  price_in_dollar float
  volume float
}

// Explaination of actions
//
// - Deposit: `amount_in_dollar` is not null. Deposit `amount_in_dollar` to the account. Account cash value increases.
// - Buy: `ticker` and `price_in_dollar` are not null. Buy the given asset at given price using all remaining cash. Account cash becomes 0.
// - Sell: `ticker` and `price_in_dollar` are not null. Sell all the given asset at given price. Account asset value becomes 0.
// - null: `ticker` and `price_in_dollar` are not null. If account is holding given asset, its asset value can change based on the price.
Table actions {
  strategy string // The strategy this action belongs to. Every strategy has its own account.
  action string // Deposit, Buy, Sell, nullable
  amount_in_dollar float // nullable
  ticker string // nullable
  time timestamp
  price_in_dollar float // nullable
}

Table net_worth {
  strategy string
  time timestamp
  cash_in_dollar float
  asset_value_in_dollar float
}
```
