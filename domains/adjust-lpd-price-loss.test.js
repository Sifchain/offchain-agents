const deepmerge = require("deepmerge");

const { calcPriceIncrease } = require("../helpers/calcPriceIncrease");

const { adjustLpdPriceLoss } = require("./adjust-lpd-price-loss");

// avoid console log during tests
let originalConsoleTable;
beforeEach(() => {
  originalConsoleTable = console.table;
  console.table = () => {};
});
afterEach(() => {
  console.table = originalConsoleTable;
});

test("do not execute updateLPDParams when dryRun is true", async () => {
  const ports = setup({ env: { DRY_RUN: "true" } });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).not.toHaveBeenCalled();
});

test("execute updateLPDParams once when dryRun is false", async () => {
  const ports = setup();
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
});

test("price dropped by 11%", async () => {
  const ports = setup({
    getPriceWindow: jest.fn(() => ({
      initialPrice: 0.9,
      currentPrice: 0.8,
      initialHeight: 100000,
      currentHeight: 100000,
    })),
  });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
  expect(ports.updateLPDParams).toHaveBeenCalledWith({
    account: "any-account",
    blockRate: 0.020326804281281197,
    endBlock: 100550,
    isActive: true,
    mod: 100,
    signingClient: "any-signingClient",
    startBlock: 99950,
  });
});

test("price increased by 10 folds", async () => {
  const ports = setup({
    getPriceWindow: jest.fn(() => ({
      initialPrice: 0.1,
      currentPrice: 1.1,
      initialHeight: 100000,
      currentHeight: 100000,
    })),
  });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
  expect(ports.updateLPDParams).toHaveBeenCalledWith({
    account: "any-account",
    blockRate: 0.0005023529535284066,
    endBlock: 100550,
    isActive: true,
    mod: 100,
    signingClient: "any-signingClient",
    startBlock: 99950,
  });
});

test("price dropped by 50% w/ max rate mod enabled", async () => {
  const ports = setup({
    getPriceWindow: jest.fn(() => ({
      initialPrice: 1.0,
      currentPrice: 0.5,
      initialHeight: 100000,
      currentHeight: 100000,
    })),
  });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
  expect(ports.updateLPDParams).toHaveBeenCalledWith({
    account: "any-account",
    blockRate: 0.0446975079232772,
    endBlock: 100550,
    isActive: true,
    mod: 100,
    signingClient: "any-signingClient",
    startBlock: 99950,
  });
});

test("price dropped by 50% w/ max rate mod disabled", async () => {
  const ports = setup({
    getPriceWindow: jest.fn(() => ({
      initialPrice: 1.0,
      currentPrice: 0.5,
      initialHeight: 100000,
      currentHeight: 100000,
    })),
    env: {
      ENABLE_MAX_RATE_MOD: "false",
    },
  });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
  expect(ports.updateLPDParams).toHaveBeenCalledWith({
    account: "any-account",
    blockRate: 0.12296440126290142,
    endBlock: 100550,
    isActive: true,
    mod: 100,
    signingClient: "any-signingClient",
    startBlock: 99950,
  });
});

test("initial price increased over 2000 mods", async () => {
  const ports = setup({
    getPriceWindow: jest.fn(() => ({
      initialPrice: 0.1,
      currentPrice: 0.2,
      initialHeight: 1,
      currentHeight: 2000 * 100,
    })),
    env: {
      ENABLE_MAX_RATE_MOD: "false",
    },
  });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
  expect(ports.updateLPDParams).toHaveBeenCalledWith({
    account: "any-account",
    blockRate: 0.053755459863113586,
    endBlock: 200550,
    isActive: true,
    mod: 100,
    signingClient: "any-signingClient",
    startBlock: 199950,
  });
});

test("initial price increased over 5000 mods hits max rate", async () => {
  const ports = setup({
    getPriceWindow: jest.fn(() => ({
      initialPrice: 0.01,
      currentPrice: 0.01,
      initialHeight: 1,
      currentHeight: 5000 * 100,
    })),
    env: {
      ENABLE_MAX_RATE_MOD: "false",
    },
  });
  await adjustLpdPriceLoss({
    ports,
  });
  expect(ports.updateLPDParams).toHaveBeenCalledTimes(1);
  expect(ports.updateLPDParams).toHaveBeenCalledWith({
    account: "any-account",
    blockRate: 0.3,
    endBlock: 500550,
    isActive: true,
    mod: 100,
    signingClient: "any-signingClient",
    startBlock: 499950,
  });
});

function setup(portsFromTests = {}) {
  return deepmerge(
    {
      getSigningClient: jest.fn(() => ({
        signingClient: "any-signingClient",
        account: "any-account",
      })),
      getPriceWindow: jest.fn(() => ({
        initialPrice: 1,
        currentPrice: 1,
        pastPrice: 1,
        priceChange: 1,
        initialHeight: 1,
        currentHeight: 1,
      })),
      updateLPDParams: jest.fn(),
      calcPriceIncrease,
      env: {
        ADMIN_CLP_DEX_MNEMONIC_PATH: "any-mnemonic",
        IS_ACTIVE: "true",
        DRY_RUN: "false",
        SYMBOLL: "cusdc",
        BLOCK_WINDOW: 600,
        MOD: 100,
        DAILY_RATE: 0.075,
        EPOCH_LENGTH: 14400,
        MAX_RATE: 0.3,
        ENABLE_MAX_RATE_MOD: "true",
        INITIAL_BLOCK: 100000,
        BLOCK_WINDOW_OFFSET: 50,
      },
    },
    portsFromTests
  );
}
