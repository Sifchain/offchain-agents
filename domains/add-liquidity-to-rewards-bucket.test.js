const { parseCoins } = require("@cosmjs/stargate");
const {
  addLiquidityToRewardsBucket,
} = require("./add-liquidity-to-rewards-bucket");

describe("addLiquidityToRewardsBucket", () => {
  let ports;

  beforeEach(() => {
    ports = setupMockPorts();
  });

  test("should add liquidity successfully", async () => {
    const summary = await addLiquidityToRewardsBucket({ ports });

    expect(ports.getSigningClient).toHaveBeenCalledWith(
      ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
    );
    expect(ports.addLiquidityToRewardsBucket).toHaveBeenCalledWith({
      signingClient: "any-signingClient",
      account: { address: "sif1234" },
      amount: parseCoins(ports.env.AMOUNT),
    });
    expect(summary).toEqual({
      amount: parseCoins(ports.env.AMOUNT).toString(),
    });
  });

  // Add more tests for edge cases, error handling, etc.
});

function setupMockPorts() {
  return {
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH: "my-mnemonic",
      AMOUNT: "1000token",
    },
    getSigningClient: jest.fn().mockResolvedValue({
      signingClient: "any-signingClient",
      account: {
        address: "sif1234",
      },
    }),
    addLiquidityToRewardsBucket: jest.fn().mockResolvedValue({
      /* Mocked response */
    }),
    // Mock any other necessary ports methods
  };
}
