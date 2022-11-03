const { FEE = "10000000000000", GAS = "280000" } = process.env;

module.exports.gasFee = {
  amount: [
    {
      denom: "rowan",
      amount: FEE,
    },
  ],
  gas: GAS,
};
