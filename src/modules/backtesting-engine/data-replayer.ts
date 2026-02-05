import { KLine } from '../../shared/models/market-data';
import { BaseStrategy } from '../strategy-framework/base-strategy';

export class DataReplayer {
  private klines: KLine[];
  private currentIndex: number = 0;

  constructor(klines: KLine[]) {
    this.klines = klines;
  }

  hasNext(): boolean {
    return this.currentIndex < this.klines.length;
  }

  next(): KLine | null {
    if (this.hasNext()) {
      return this.klines[this.currentIndex++];
    }
    return null;
  }

  reset() {
    this.currentIndex = 0;
  }
}
