const { getPoolBySymbolAndHeight } = require("./getPoolBySymbolAndHeight");
const { calcPriceIncrease } = require("./calcPriceIncrease");

module.exports.getPriceWindow = async ({
  symbol,
  blockWindow,
  initialBlock,
}) => {
  try {
    const {
      pool: { swap_price_native: _initialPrice },
      height: _initialHeight,
    } = await getPoolBySymbolAndHeight({
      symbol,
      height: initialBlock,
    });

    const initialPrice = Number(_initialPrice);
    const initialHeight = Number(_initialHeight);

    const {
      pool: { swap_price_native: _currentPrice },
      height: _currentHeight,
    } = await getPoolBySymbolAndHeight({
      symbol,
    });

    const currentPrice = Number(_currentPrice);
    const currentHeight = Number(_currentHeight);

    const {
      pool: { swap_price_native: _pastPrice },
      height: _pastHeight,
    } = await getPoolBySymbolAndHeight({
      symbol,
      height: currentHeight - blockWindow,
    });

    const pastPrice = Number(_pastPrice);
    const pastHeight = Number(_pastHeight);

    const priceChange = calcPriceIncrease({
      newPrice: currentPrice,
      oldPrice: pastPrice,
    });

    return {
      initialPrice,
      initialHeight,
      currentPrice,
      currentHeight,
      pastPrice,
      pastHeight,
      priceChange,
    };
  } catch {
    console.log(`failed to retrieve initial, current and past price from pool`);
    process.exit();
  }
};
