export class RateLimiter {
  private queue: (() => void)[] = [];
  private tokens: number;
  private maxTokens: number;
  private interval: number;
  private lastRefill: number = Date.now();

  constructor(maxTokens: number, interval: number) {
    this.tokens = maxTokens;
    this.maxTokens = maxTokens;
    this.interval = interval;
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.scheduleNextRefill();
    });
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    if (timePassed > this.interval) {
      this.tokens = this.maxTokens;
      this.lastRefill = now;
      this.processQueue();
    }
  }

  private processQueue() {
    while (this.tokens > 0 && this.queue.length > 0) {
      this.tokens--;
      const resolve = this.queue.shift();
      resolve?.();
    }
  }

  private scheduleNextRefill() {
    const now = Date.now();
    const timeUntilNextRefill = this.interval - (now - this.lastRefill);
    setTimeout(() => {
      this.refill();
    }, Math.max(0, timeUntilNextRefill));
  }
}
