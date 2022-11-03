const { Decimal } = require("@cosmjs/math");
const deepmerge = require("deepmerge");

const { resetSwapFeeRate } = require("./reset-swap-fee-rate");

// avoid console log during tests
let originalConsoleTable;
beforeEach(() => {
  originalConsoleTable = console.table;
  console.table = () => {};
});
afterEach(() => {
  console.table = originalConsoleTable;
});

test("reset rowan swap fee rate", async () => {
  const ports = setup({});
  await resetSwapFeeRate({ ports });
  expect(ports.getSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.getSwapFeeParams).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.updateSwapFeeParams).toHaveBeenCalledTimes(1);
  expect(ports.updateSwapFeeParams).toHaveBeenCalledWith({
    signingClient: "any-signingClient",
    account: { address: "sif1234" },
    defaultRate: Decimal.fromUserInput("0.03", 18),
    tokenParams: {
      rowan: Decimal.fromUserInput("0.5", 18),
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
      getSwapFeeParams: jest.fn(() => ({
        defaultRate: Decimal.fromUserInput("0.03", 18),
        tokenParams: {
          rowan: Decimal.fromUserInput("0.30", 18),
        },
      })),
      updateSwapFeeParams: jest.fn(),
      env: {
        ADMIN_CLP_DEX_MNEMONIC_PATH: "my-mnemonic",
        MAX_SWAP_FEE: "0.5",
      },
    },
    portsFromTests
  );
}
