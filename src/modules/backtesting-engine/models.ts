export interface SlippageModel {
  calculateFillPrice(requestedPrice: number | undefined, klineOpen: number, side: 'Buy' | 'Sell'): number;
}

export interface CommissionModel {
  calculateCommission(executedQuantity: number, fillPrice: number): number;
}

export class FixedSlippageModel implements SlippageModel {
  private slippagePercent: number;

  constructor(slippagePercent: number = 0.0001) {
    this.slippagePercent = slippagePercent;
  }

  calculateFillPrice(requestedPrice: number | undefined, klineOpen: number, side: 'Buy' | 'Sell'): number {
    const basePrice = requestedPrice !== undefined ? requestedPrice : klineOpen;
    const slippage = basePrice * this.slippagePercent;
    return side === 'Buy' ? basePrice + slippage : basePrice - slippage;
  }
}

export class FixedCommissionModel implements CommissionModel {
  private commissionRate: number;
  private minCommission: number;

  constructor(commissionRate: number = 0.0003, minCommission: number = 15) {
    this.commissionRate = commissionRate;
    this.minCommission = minCommission;
  }

  calculateCommission(executedQuantity: number, fillPrice: number): number {
    const commission = executedQuantity * fillPrice * this.commissionRate;
    return Math.max(commission, this.minCommission);
  }
}
