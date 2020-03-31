/*
Helper functions
*/

const averageBuyPrice = (capital, tradeOrder) => {
  /*
 Input
 tradeCapital: number - total planned value of the trade
 tradeOrder: [ 
    {
    executed: boolean,  (if not executed, not included in the calculation)
    price: number,
    percentage: number (percentage of total trade)
    }
 ], array - all trade orders that should be calculated
 
*/
  let totalBought = 0;
  let totalCost = 0;

  tradeOrder.forEach(order => {
    if (order.executed === true) {
      const availableCapital = (capital * order.percentage) / 100;

      totalBought += order.price / availableCapital;
      totalCost += availableCapital;
    }
  });

  return totalCost / totalBought;
};

const averageSellPrice = (asset, tradeOrder) => {
  /*
   Input
   asset: number - total planned asset amount to sell in this trade
   tradeOrder: [ 
      {
      executed: boolean,  (if not executed, not included in the calculation)
      price: number,
      percentage: number (percentage of total trade)
      }
   ], array - all trade orders that should be calculated
   
  */
  let totalProfit = 0;
  let totalAmount = 0;

  tradeOrder.forEach(order => {
    if (order.executed === true) {
      const availableAsset = (assetAmount * order.percentage) / 100;

      totalProfit += order.price * availableAsset;
      totalAmount += availableAsset;
    }
  });

  return totalProfit / totalAmount;
};
