/*
Helper functions
*/

/**
 * Round a number to a selected place (position)
 * @param {number} num - The number to round up
 * @param {number} precision - Precision of the rounding: number of places (positions) to round the number up to
 * @return {number} - The rounded number
 */
function roundTo(num, precision) {
  return Math.round((num + Number.EPSILON) * 10 ** precision) / 10 ** precision;
}

/**
 * Calculate average execution price of supplied orders
 * @param {array} orders - Array of order objects
 * @return {number} - Average entry price of all orders
 */
function avgExecutionPrice(orders) {
  const totalCost = orders.reduce((sum, order) => {
    return sum + order.executionPrice * order.size;
  }, 0);
  const totalSize = orders.reduce((sum, order) => {
    return sum + order.size;
  }, 0);

  return totalCost / totalSize;
}

/**
 * Calculates return per unit of the financial instrument
 * @param {number} avgEntryPrice - The trade's average entry price
 * @param {number} avgExitPrice - The trade's average exit price
 * @param {boolean} tradeSide - The trade's side - {true} for a long position, {false} for a short position
 * @return {number} - Return per unit of financial instrument
 */
function returnPerUnit(avgEntryPrice, avgExitPrice, tradeSide = true) {
  return tradeSide ? avgExitPrice - avgEntryPrice : avgEntryPrice - avgExitPrice;
}

/**
 * Calculates trade's return percentage
 * @param {number} avgEntryPrice - The trade's average entry price
 * @param {number} returnPerUnit - The trade's return per unit
 * @return {number} - Trade's return percentage
 */
function returnPercentage(avgEntryPrice, returnPerUnit) {
  return roundTo((returnPerUnit / avgEntryPrice) * 100, 2);
}

/**
 * Calculates trade's return percentage
 * @param {number} avgEntryPrice - The trade's average entry price
 * @param {number} returnPerUnit - The trade's return per unit
 * @return {number} - Trade's return percentage
 */
function returnTotal(avgEntryPrice, returnPerUnit) {
  return roundTo((returnPerUnit / avgEntryPrice) * 100, 2);
}

/**
 * Calculates trade's risk-reward value based on entry and stop-loss price
 * @param {number} entryPrice - The trade's entry price
 * @param {number} stopLossPrice - The trade's stop-loss price
 * @param {number} targetPrice - The trade's target price
 * @return {number} - The trade's risk-reward value rounded to second decimal (0.00)
 */
function riskRewardRatio(entryPrice, stopLossPrice, targetPrice) {
  const ratio = (targetPrice - entryPrice) / (entryPrice - stopLossPrice);
  return roundTo(ratio, 2);
}

/**
 * Calculates trade's risk-reward value based on entry and stop-loss price
 * @param {number} avgEntryPrice - The trade's entry price
 * @param {number} stopLossPrice - The trade's stop-loss price
 * @param {number} targetPrice - The trade's target price
 * @return {number} - The trade's risk-reward value rounded to second decimal (0.00)
 */
function positionSize(avgEntryPrice, stopLossPrice, targetPrice) {
  // TODO
  // Average target price? Is that doable?
  // Average stopLoss price? Is that doable?
  // How do I track multiple stop loss prices and multiple target prices?
  // Do I add percentages in the document or is it just part of UI's functionality?
  // It might be easier to do just in the UI.
  // Prices of entries, targets and stop losses are not imporant or problematic,
  // number of shares/units and it's calculation is the issue and thing to do.
}
