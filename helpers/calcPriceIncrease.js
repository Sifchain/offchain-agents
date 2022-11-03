module.exports.calcPriceIncrease = ({ newPrice, oldPrice }) => {
  return (newPrice - oldPrice) / oldPrice;
};
