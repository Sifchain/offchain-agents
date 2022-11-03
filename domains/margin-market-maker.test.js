const deepmerge = require("deepmerge");

const { marginMarketMaker } = require("./margin-market-maker");
const {
  calcMaxCollateralAmount,
} = require("../helpers/calcMaxCollateralAmount");

// avoid console log during tests
let originalConsoleTable;
beforeEach(() => {
  originalConsoleTable = console.table;
  console.table = () => {};
});
afterEach(() => {
  console.table = originalConsoleTable;
});

test("no positions and no balances yet", async () => {
  const ports = setup({});
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).not.toHaveBeenCalled();
  expect(ports.closeMtps).not.toHaveBeenCalled();
  expect(ports.getPool).not.toHaveBeenCalled();
  expect(ports.openMtp).not.toHaveBeenCalled();
});

test("no positions, one balance and no margin-enabled pools yet", async () => {
  const ports = setup({
    getUserBalances: jest.fn(() => ({
      balances: [{ amount: "1000000000", denom: "cusdc" }],
    })),
    getMarginParams: jest.fn(() => ({ pools: [] })),
  });
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).not.toHaveBeenCalled();
  expect(ports.closeMtps).not.toHaveBeenCalled();
  expect(ports.getPool).not.toHaveBeenCalled();
  expect(ports.openMtp).not.toHaveBeenCalled();
});

test("no positions, one balance and one margin-enabled pool", async () => {
  const ports = setup({
    getUserBalances: jest.fn(() => ({
      balances: [{ amount: "1000000000", denom: "cusdc" }],
    })),
    getMarginParams: jest.fn(() => ({ pools: ["cusdc"] })),
  });
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).not.toHaveBeenCalled();
  expect(ports.closeMtps).not.toHaveBeenCalled();
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.openMtp).toHaveBeenCalledTimes(1);
  expect(ports.openMtp).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    collateralAsset: "cusdc",
    collateralAmount: "1000000000",
    borrowAsset: "rowan",
    position: "long",
    leverage: 5.0,
  });
});

test("1 recent position", async () => {
  const ports = setup({
    getMtpsByAddressAndHeight: jest.fn(() => ({
      height: 1,
      mtps: [{ id: 12 }],
    })),
    getEvent: jest.fn(() => ({ height: 1, logs: [] })),
    getUserBalances: jest.fn(() => ({
      balances: [{ amount: "1000000000", denom: "cusdc" }],
    })),
    getMarginParams: jest.fn(() => ({ pools: ["cusdc"] })),
  });
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).toHaveBeenCalledTimes(1);
  expect(ports.getEvent).toHaveBeenCalledWith({
    events: `margin/mtp_open.id=12`,
  });
  expect(ports.closeMtps).not.toHaveBeenCalled();
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.openMtp).toHaveBeenCalledTimes(1);
  expect(ports.openMtp).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    collateralAsset: "cusdc",
    collateralAmount: "1000000000",
    borrowAsset: "rowan",
    position: "long",
    leverage: 5.0,
  });
});

test("1 old position", async () => {
  const ports = setup({
    getMtpsByAddressAndHeight: jest.fn(() => ({
      height: 14402,
      mtps: [{ id: 12 }],
    })),
    getEvent: jest.fn(() => ({ height: 1, logs: [] })),
    getUserBalances: jest.fn(() => ({
      balances: [{ amount: "1000000000", denom: "cusdc" }],
    })),
    getMarginParams: jest.fn(() => ({ pools: ["cusdc"] })),
  });
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).toHaveBeenCalledTimes(1);
  expect(ports.getEvent).toHaveBeenCalledWith({
    events: `margin/mtp_open.id=12`,
  });
  expect(ports.closeMtps).toHaveBeenCalledTimes(1);
  expect(ports.closeMtps).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    ids: [12],
  });
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.openMtp).toHaveBeenCalledTimes(1);
  expect(ports.openMtp).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    collateralAsset: "cusdc",
    collateralAmount: "1000000000",
    borrowAsset: "rowan",
    position: "long",
    leverage: 5.0,
  });
});

test("max positions reached", async () => {
  const ports = setup({
    getMtpsByAddressAndHeight: jest.fn(() => ({
      height: 14402,
      mtps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    })),
    getEvent: jest
      .fn()
      .mockImplementationOnce(() => ({ height: 1, logs: [] }))
      .mockImplementationOnce(() => ({ height: 1, logs: [] }))
      .mockImplementationOnce(() => ({ height: 14400, logs: [] }))
      .mockImplementationOnce(() => ({ height: 14400, logs: [] })),
    env: {
      MAX_POSITIONS: 2,
    },
  });
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).toHaveBeenCalledTimes(1);
  expect(ports.getEvent).toHaveBeenCalledWith({
    events: `margin/mtp_open.id=1`,
  });
  expect(ports.closeMtps).toHaveBeenCalledTimes(1);
  expect(ports.closeMtps).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    ids: [1],
  });
  expect(ports.getPool).not.toHaveBeenCalled();
  expect(ports.openMtp).not.toHaveBeenCalled();
});

test("pool health below min pool health", async () => {
  const ports = setup({
    getPool: jest.fn(() => ({
      pool: {
        health: 0.8,
        externalAsset: { symbol: "cusdc" },
      },
    })),
    getUserBalances: jest.fn(() => ({
      balances: [{ amount: "1000000000", denom: "cusdc" }],
    })),
    getMarginParams: jest.fn(() => ({ pools: ["cusdc"] })),
    env: {
      MIN_POOL_HEALTH: 0.9,
    },
  });
  await marginMarketMaker({
    ports,
  });
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledTimes(1);
  expect(ports.getMtpsByAddressAndHeight).toHaveBeenCalledWith({
    address: "sif1234",
  });
  expect(ports.getEvent).not.toHaveBeenCalled();
  expect(ports.closeMtps).not.toHaveBeenCalled();
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.openMtp).not.toHaveBeenCalled();
});

function setup(portsFromTests = {}) {
  return deepmerge(
    {
      getSigningClient: jest.fn(() => ({
        signingClient: "any-signingClient",
        account: {
          address: "sif1234",
        },
        queryClient: "any-queryClient",
      })),
      getMtpsByAddressAndHeight: jest.fn(() => ({ height: 1, mtps: [] })),
      getPool: jest.fn(() => ({
        pool: {
          health: 1.0,
          externalAsset: { symbol: "cusdc" },
        },
      })),
      getEvent: jest.fn(() => ({ height: 1, logs: [] })),
      openMtp: jest.fn(),
      closeMtps: jest.fn(),
      getMarginParams: jest.fn(() => ({ pools: [] })),
      getUserBalances: jest.fn(() => ({
        balances: [],
      })),
      calcMaxCollateralAmount,
      env: {
        USER_MARGIN_MNEMONIC_PATH: "my-mnemonic",
        COLLATERAL_AMOUNT: "1000000000",
        COLLATERAL_ASSET: "cusdc",
        BORROW_ASSET: "rowan",
        LEVERAGE: 5.0,
        POSITION: "long",
        DURATION: 14400,
        MAX_POSITIONS: 100,
        MIN_POOL_HEALTH: 0.9,
        MAX_POSITIONS_TO_CLOSE: 1,
      },
    },
    portsFromTests
  );
}
