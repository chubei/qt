# Dozer as a Quantitative Trading Platform

## Strategy Dozer

TODO

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
  volume int
}
Table actions {
  action string // Deposit, Buy, Sell, nullable
  amount_in_dollar float // nullable
  ticker string // nullable
  time timestamp
  price_in_dollar float // nullable
}
Table net_worth {
  time timestamp
  cash_in_dollar float
  market_value_in_dollar float
}
```
