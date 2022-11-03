module.exports.getUserBalances = getUserBalances;

async function getUserBalances({ queryClient, account }) {
  const balances = await queryClient.bank.allBalances(account.address);

  return { balances };
}
