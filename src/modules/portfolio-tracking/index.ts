import { Order, Quote } from '../../shared/models/market-data';

export interface Position {
  symbol: string;
  market: string;
  quantity: number;
  averageCost: number;
}

export class PortfolioTracker {
  private positions: Map<string, Position> = new Map();
  private cash: number;
  private initialCash: number;

  constructor(initialCash: number = 1000000) {
    this.initialCash = initialCash;
    this.cash = initialCash;
  }

  handleOrderUpdate(order: Order) {
    if (order.status !== 'Filled') return;

    const key = `${order.symbol}.${order.market}`;
    const currentPosition = this.positions.get(key) || {
      symbol: order.symbol,
      market: order.market,
      quantity: 0,
      averageCost: 0,
    };

    const fillPrice = order.price || 0;
    const commission = order.commission || 0;
    const totalCost = order.executedQuantity * fillPrice;

    if (order.side === 'Buy') {
      const newQuantity = currentPosition.quantity + order.executedQuantity;
      const newTotalCost = currentPosition.quantity * currentPosition.averageCost + totalCost;
      currentPosition.averageCost = newTotalCost / newQuantity;
      currentPosition.quantity = newQuantity;
      this.cash -= (totalCost + commission);
    } else {
      const newQuantity = currentPosition.quantity - order.executedQuantity;
      // Realized P&L is reflected in cash balance
      this.cash += (totalCost - commission);
      currentPosition.quantity = newQuantity;
    }

    if (currentPosition.quantity === 0) {
      this.positions.delete(key);
    } else {
      this.positions.set(key, currentPosition);
    }
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getCash(): number {
    return this.cash;
  }

  getTotalEquity(quotes: Map<string, number>): number {
    let equity = this.cash;
    for (const position of this.getPositions()) {
      const fullSymbol = `${position.symbol}.${position.market}`;
      const currentPrice = quotes.get(fullSymbol) || quotes.get(position.symbol) || position.averageCost;
      equity += position.quantity * currentPrice;
    }
    return equity;
  }
}
