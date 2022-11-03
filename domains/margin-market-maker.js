const nativeAsset = "rowan";

module.exports.marginMarketMaker = marginMarketMaker;

async function marginMarketMaker({ ports }) {
  const collateralAmount = ports.env.COLLATERAL_AMOUNT;
  const collateralAsset = ports.env.COLLATERAL_ASSET;
  const borrowAsset = ports.env.BORROW_ASSET;
  const leverage = Number(ports.env.LEVERAGE);
  const position = ports.env.POSITION;
  const duration = Number(ports.env.DURATION);
  const maxPositions = Number(ports.env.MAX_POSITIONS);
  const minPoolHealth = Number(ports.env.MIN_POOL_HEALTH);
  const maxPositionsToClose = Number(ports.env.MAX_POSITIONS_TO_CLOSE);

  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.USER_MARGIN_MNEMONIC_PATH
  );

  // 1) if there are any positions as old as duration, pick the first one and close the position
  // 2) if max positions reached then exit
  // 3) get margin params / margin-enabled pools
  // 4) get user margin wallet balances
  // 5) skip user margin wallet balances that dont match margin-enabled pools
  // 6) query pools that match margin balances
  // 7) if min pool health reched then skip
  // 8) calc max collateral amount for available asset
  // 9) skip user margin wallet balances that are smaller than max collateral amount
  // 10) open positions for available asset using max collateral amounts

  // 1) if there are any positions as old as duration, pick the first one and close the position
  // query list of existing positions:
  // https://api.sifchain.io/margin/mtps-by-address?address=<ADDRESS>
  // for each mtp:
  // query block height when opened:
  // https://api.sifchain.io/cosmos/tx/v1beta1/txs?events=margin/mtp_open.id=<MTP_ID>
  // substract current block height from `/margin/mtps-by-address` to margin/mtp_open event query block height and if result is gth or eq to distance then close position
  // /sifnode.margin.v1.MsgClose (signer, id)
  // and break the loop

  const { height: currentHeight, mtps } = await ports.getMtpsByAddressAndHeight(
    {
      address: account.address,
    }
  );

  const summary = {
    address: account.address,
    collateralAmount,
    collateralAsset,
    borrowAsset,
    leverage,
    position,
    duration,
    maxPositions,
    minPoolHealth,
    currentHeight,
    closedPosition: false,
  };

  const positionsToClose = [];

  for (let mtp of mtps) {
    const { height: openHeight } = await ports.getEvent({
      events: `margin/mtp_open.id=${mtp.id}`,
    });
    const actualDuration = currentHeight - openHeight;
    if (actualDuration >= duration) {
      positionsToClose.push(mtp.id);
      if (positionsToClose.length >= maxPositionsToClose) {
        break;
      }
    }
  }

  if (positionsToClose.length > 0) {
    await ports.closeMtps({
      signingClient,
      account,
      ids: positionsToClose,
    });
  }

  summary.closedPositions = positionsToClose.length;

  // 2) if max positions reached then exit
  // if count(mtps - closed mtps) gth or eq to maxPositions then exit
  const maxPositionsReached =
    mtps.length - positionsToClose.length >= maxPositions;
  summary.maxPositionsReached = maxPositionsReached;

  if (maxPositionsReached) {
    return summary;
  }

  // 3) get margin params / margin-enabled pools
  const { pools: marginEnabledPools } = await ports.getMarginParams({
    queryClient,
  });

  // 4) get user margin wallet balances
  const { balances } = await ports.getUserBalances({ queryClient, account });

  // 5) skip user margin wallet balances that dont match margin-enabled pools
  let marginBalances = balances.filter(({ denom }) =>
    marginEnabledPools.includes(denom)
  );

  const hasEnoughBalances = marginBalances.length > 0;
  summary.hasEnoughBalances = hasEnoughBalances;

  if (!hasEnoughBalances) {
    return summary;
  }

  // 6) query pools that match margin balances
  let pools = (
    await Promise.all(
      marginBalances.map(
        async ({ denom }) => await ports.getPool({ queryClient, symbol: denom })
      )
    )
  )
    // 7) if min pool health then skip
    .filter(({ pool: { health } }) => health >= minPoolHealth)
    // 8) calc max collateral amount for available asset
    .map(({ pool }) => ({
      ...pool,
      maxCollateralAmount: ports.calcMaxCollateralAmount({
        balance: pool.externalBalance,
        liabilities: pool.externalLiabilities,
        priceImpact: 1,
        leverage: 5,
      }),
    }));

  if (!pools.length) {
    return summary;
  }

  // 8b) convert to map
  pools = pools.reduce(
    (acc, cur) => ({ ...acc, [cur.externalAsset.symbol]: cur }),
    {}
  );

  // 9) skip user margin wallet balances that are smaller than max collateral amount
  marginBalances = marginBalances.filter(
    ({ amount, denom }) => Number(amount) < pools[denom].maxCollateralAmount
  );

  // 10) open positions for available asset using max collateral amounts
  // open a new position
  // /sifnode.margin.v1.MsgOpen (signer, collateral_amount, collateral_asset, borrow_asset, position, leverage)

  await ports.openMtp({
    signingClient,
    account,
    collateralAsset,
    collateralAmount,
    borrowAsset,
    position,
    leverage,
  });

  return summary;
}
