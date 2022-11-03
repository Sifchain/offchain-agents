const { Decimal } = require("@cosmjs/math");
const deepmerge = require("deepmerge");

const { marginAutoClosePositions } = require("./margin-auto-close-positions");
const { arrayToMap } = require("../helpers/arrayToMap");
const {
  calcMarginPositionProfitPercentage,
} = require("../helpers/calcMarginPositionProfitPercentage");

// avoid console log during tests
let originalConsoleTable;
beforeEach(() => {
  originalConsoleTable = console.table;
  console.table = () => {};
});
afterEach(() => {
  console.table = originalConsoleTable;
});

test("no positions to close", async () => {
  const ports = setup({});
  await marginAutoClosePositions({ ports });
  expect(ports.getAllMtps).toHaveBeenCalledTimes(1);
  expect(ports.getAllMtps).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
});

test("1 position with no profit", async () => {
  const ports = setup({
    getAllMtps: jest.fn(() => ({
      mtps: [
        {
          id: 1,
          mtpHealth: Decimal.fromUserInput("1.25", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
        },
      ],
      total: 1,
    })),
  });
  await marginAutoClosePositions({ ports });
  expect(ports.getAllMtps).toHaveBeenCalledTimes(1);
  expect(ports.getAllMtps).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.adminCloseMtps).not.toHaveBeenCalled();
});

test("1 position to close with profit exceeding 200%", async () => {
  const ports = setup({
    getAllMtps: jest.fn(() => ({
      mtps: [
        {
          id: 1,
          mtpHealth: Decimal.fromUserInput("2.0", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
        },
      ],
      total: 1,
    })),
  });
  await marginAutoClosePositions({ ports });
  expect(ports.getAllMtps).toHaveBeenCalledTimes(1);
  expect(ports.getAllMtps).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
});

test("2 positions with profits exceeding 200% and highest profit % closed", async () => {
  const ports = setup({
    getAllMtps: jest.fn(() => ({
      mtps: [
        {
          id: 1,
          mtpHealth: Decimal.fromUserInput("2.0", 18).atomics,
          leverage: Decimal.fromUserInput("5.0", 18).atomics,
          address: "sif1234",
        },
        {
          id: 2,
          mtpHealth: Decimal.fromUserInput("2.5", 18).atomics,
          leverage: Decimal.fromUserInput("5.0", 18).atomics,
          address: "sif5678",
        },
      ],
      total: 1,
    })),
  });
  await marginAutoClosePositions({ ports });
  expect(ports.getAllMtps).toHaveBeenCalledTimes(1);
  expect(ports.getAllMtps).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.adminCloseMtps).toHaveBeenCalledTimes(1);
  expect(ports.adminCloseMtps).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    mtpsToClose: [{ id: 2, mtpAddress: "sif5678" }],
  });
});

test("10 positions while 5 positions with profits exceeding 200% and highest profit % closed", async () => {
  const ports = setup({
    getAllMtps: jest.fn(() => ({
      mtps: [
        {
          id: 1,
          mtpHealth: Decimal.fromUserInput("1.0", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif1",
        },
        {
          id: 2,
          mtpHealth: Decimal.fromUserInput("2.5", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif2",
        },
        {
          id: 3,
          mtpHealth: Decimal.fromUserInput("1.2", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif3",
        },
        {
          id: 4,
          mtpHealth: Decimal.fromUserInput("3.0", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif4",
        },
        {
          id: 5,
          mtpHealth: Decimal.fromUserInput("1.1", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif5",
        },
        {
          id: 6,
          mtpHealth: Decimal.fromUserInput("0.5", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif6",
        },
        {
          id: 7,
          mtpHealth: Decimal.fromUserInput("1.9", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif7",
        },
        {
          id: 8,
          mtpHealth: Decimal.fromUserInput("1.25", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif8",
        },
        {
          id: 9,
          mtpHealth: Decimal.fromUserInput("2.3", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif9",
        },
        {
          id: 10,
          mtpHealth: Decimal.fromUserInput("2.8", 18).atomics,
          leverage: Decimal.fromUserInput("5", 18).atomics,
          address: "sif10",
        },
      ],
      total: 1,
    })),
  });
  await marginAutoClosePositions({ ports });
  expect(ports.getAllMtps).toHaveBeenCalledTimes(1);
  expect(ports.getAllMtps).toHaveBeenCalledWith({
    queryClient: "any-queryClient",
  });
  expect(ports.adminCloseMtps).toHaveBeenCalledTimes(1);
  expect(ports.adminCloseMtps).toHaveBeenCalledWith({
    account: { address: "sif1234" },
    signingClient: "any-signingClient",
    mtpsToClose: [{ id: 4, mtpAddress: "sif4" }],
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
      arrayToMap,
      getAllMtps: jest.fn(() => ({ mtps: [], total: 0 })),
      calcMarginPositionProfitPercentage,
      adminCloseMtps: jest.fn(),
      env: {
        ADMIN_MARGIN_MNEMONIC_PATH: "my-mnemonic",
        PROFIT_PERCENTAGE_THRESHOLD: "200",
      },
    },
    portsFromTests
  );
}
