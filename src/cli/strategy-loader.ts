import fs from 'fs';
import path from 'path';

export interface StrategyMetadata {
  name: string;
  className: string;
  filePath: string;
  description: string;
  params: any[]; // Parameter definitions for Inquirer
}

export class StrategyLoader {
  private static strategyDir = path.join(__dirname, '../modules/strategy-framework');

  static listStrategies(): StrategyMetadata[] {
    const files = fs.readdirSync(this.strategyDir);
    const strategies: StrategyMetadata[] = [];

    for (const file of files) {
      if (file.endsWith('.ts') && !file.startsWith('base-strategy') && !file.startsWith('hello-world')) {
        const filePath = path.join(this.strategyDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const classMatch = content.match(/export class (\w+) extends BaseStrategy/);
        if (classMatch) {
          const className = classMatch[1];
          // Try to dynamically load to get the static params
          let params: any[] = [];
          try {
            const module = require(filePath);
            if (module[className] && module[className].params) {
              params = module[className].params;
            }
          } catch {
            // Fallback if dynamic load fails during scan
          }

          strategies.push({
            name: file.replace('.ts', ''),
            className,
            filePath,
            description: this.extractDescription(content) || 'No description provided.',
            params
          });
        }
      }
    }

    return strategies;
  }

  static async createStrategy(strategyName: string, config: any): Promise<any> {
    const strategies = this.listStrategies();
    const meta = strategies.find(s => s.name === strategyName || s.className === strategyName);
    
    if (!meta) {
      throw new Error(`Strategy '${strategyName}' not found.`);
    }

    const module = await import(meta.filePath);
    const StrategyClass = module[meta.className];
    
    // Most strategies in this project take an array of configs in constructor
    return new StrategyClass(Array.isArray(config) ? config : [config]);
  }

  private static extractDescription(content: string): string | null {
    // Attempt to find a comment or a property that looks like a description
    const match = content.match(/\/\/ description: (.*)/i);
    return match ? match[1].trim() : null;
  }
}
