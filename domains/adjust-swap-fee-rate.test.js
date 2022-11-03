const { Decimal } = require("@cosmjs/math");
const deepmerge = require("deepmerge");

const { adjustSwapFeeRate } = require("./adjust-swap-fee-rate");

// avoid console log during tests
let originalConsoleTable;
beforeEach(() => {
  originalConsoleTable = console.table;
  console.table = () => {};
});
afterEach(() => {
  console.table = originalConsoleTable;
});

test("no swaps, decrement rowan swap fee rate", async () => {
  const ports = setup({});
  await adjustSwapFeeRate({ ports });
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.getSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.getSwapFeeParams).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.queryDB).toHaveBeenCalledTimes(1);
  expect(ports.queryDB).toHaveBeenCalledWith(
    "select count(height) as count_swap_txs from events_audit where type='swap_successful' and swap_begin_token='rowan' and height>$1 and height<=$2",
    [1200 - 300, 1200]
  );
  expect(ports.updateSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.updateSwapFeeParams).toHaveBeenCalledWith({
    signingClient: "any-signingClient",
    account: { address: "sif1234" },
    defaultRate: Decimal.fromUserInput("0.03", 18),
    tokenParams: {
      rowan: Decimal.fromUserInput("0.79", 18),
    },
  });
});

test("1 swap, dont update", async () => {
  const ports = setup({
    queryDB: jest.fn(() => ({ rows: [{ count_swap_txs: "1" }] })),
  });
  await adjustSwapFeeRate({ ports });
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.getSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.getSwapFeeParams).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.queryDB).toHaveBeenCalledTimes(1);
  expect(ports.queryDB).toHaveBeenCalledWith(
    "select count(height) as count_swap_txs from events_audit where type='swap_successful' and swap_begin_token='rowan' and height>$1 and height<=$2",
    [1200 - 300, 1200]
  );
  expect(ports.updateSwapFeeParams).not.toHaveBeenCalled();
});

test("no swaps and rowan swap fee rate < increment", async () => {
  const ports = setup({
    getSwapFeeParams: jest.fn(() => ({
      defaultRate: Decimal.fromUserInput("0.03", 18),
      tokenParams: {
        rowan: Decimal.fromUserInput("0.001", 18),
      },
    })),
  });
  await adjustSwapFeeRate({ ports });
  expect(ports.getPool).toHaveBeenCalledTimes(1);
  expect(ports.getPool).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
    symbol: "cusdc",
  });
  expect(ports.getSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.getSwapFeeParams).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.queryDB).toHaveBeenCalledTimes(1);
  expect(ports.queryDB).toHaveBeenCalledWith(
    "select count(height) as count_swap_txs from events_audit where type='swap_successful' and swap_begin_token='rowan' and height>$1 and height<=$2",
    [1200 - 300, 1200]
  );
  expect(ports.updateSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.updateSwapFeeParams).toHaveBeenCalledWith({
    signingClient: "any-signingClient",
    account: { address: "sif1234" },
    defaultRate: Decimal.fromUserInput("0.03", 18),
    tokenParams: {
      rowan: Decimal.zero(18),
    },
  });
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
      getPool: jest.fn(() => ({ height: 1200 })),
      queryDB: jest.fn(() => ({ rows: [{ count_swap_txs: "0" }] })),
      getSwapFeeParams: jest.fn(() => ({
        defaultRate: Decimal.fromUserInput("0.03", 18),
        tokenParams: {
          rowan: Decimal.fromUserInput("0.80", 18),
        },
      })),
      updateSwapFeeParams: jest.fn(),
      env: {
        ADMIN_CLP_DEX_MNEMONIC_PATH: "my-mnemonic",
        MAX_SWAP_FEE: "0.5",
        INTRA_EPOCH_LENGTH: "300",
        SF_INCREMENT: "0.01",
        POOL_SYMBOL: "cusdc",
      },
    },
    portsFromTests
  );
}
