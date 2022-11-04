# Offchain Agents

This repository is a collection of off-chain agents some for chain monitoring others are used to change chain parameters from time to time.

# Getting Started

The system requirements are:

- Install Node.js 16
  - We recommend using [nvm to manage Node.js](https://github.com/nvm-sh/nvm#installing-and-updating) versions
- Rename `.env.example` to `.env`
  - Make sure you fill in all the fields
- We are using `yarn` / [Classic Yarn 1.x](https://classic.yarnpkg.com/en/docs/install#mac-stable)
  - Recommended version is Yarn v1.22.x
  - You can use `npm`, recommended version is npm 8.x

Clone this repository and install its dependencies:

```bash
git clone https://github.com/Sifchain/offchain-agents.git
cd offchain-agents
yarn install
```

# Available Agents

## Adjust Liquidity Protection to TVL

This agent is scheduled to run every 30 minutes. It retrieves the latest total TVL from the pool balances and set the update the liquidity protection max treshold value to be set to 2% of the latest TVL value.

The agent can be tested locally using the following command:

```bash
yarn sls:invoke:local adjust-liqp-tvl
```

## Adjust LPD rate to align with rowan price drop

This agent is scheduled to run every 30 minutes. It updates the LPD rate to align rowan price to the LPD 7.5% model.

The agent can be tested locally using the following command:

```bash
yarn sls:invoke:local adjust-lpd-price-loss
```

## Margin Market Maker

This agent is scheduled to run every 10 minutes. It opens new positions in all asset available in the margin user balance that are also margin-enabled. It also closes positions that are 24 hrs old. The opened position collateral amount is based on max collateral amount calculated using `calcMaxCollateralAmount` which limit pool price impact to 1%.

The agent can be tested locally using the following command:

```bash
yarn sls:invoke:local margin-market-maker
```

## Margin Auto Close Positions

This agent is scheduled to run every 30 minutes. It closes existing positions with profit execeeding 200%. One single position with the highest profit % (exceeding 200%) will be closed every 30 minutes.

The agent can be tested locally using the following command:

```bash
yarn sls:invoke:local margin-auto-close-positions
```

## Adjust Swap Fee Rate

This agent is scheduled to run every 2 minutes. It dynamically update the Rowan swap fee rate based on swap activities.

The agent can be tested locally using the following command:

```bash
yarn sls:invoke:local adjust-swap-fee-rate
```

## Reset Swap Fee Rate

This agent is scheduled to run every 4 hours. It dynamically reset the Rowan swap fee rate to max swap fee rate.

The agent can be tested locally using the following command:

```bash
yarn sls:invoke:local reset-swap-fee-rate
```
