import { z } from 'zod';

export const MarketSchema = z.enum(['HK', 'US', 'SH', 'SZ']);

export const KLineSchema = z.object({
  symbol: z.string(),
  market: MarketSchema,
  period: z.string().optional(), // e.g., '1m', '5m', '1d'
  timestamp: z.string(), // ISO 8601
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  turnover: z.number().optional(),
});

export type KLine = z.infer<typeof KLineSchema>;

export const QuoteSchema = z.object({
  symbol: z.string(),
  market: MarketSchema,
  timestamp: z.string(),
  lastPrice: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  prevClose: z.number().optional(),
  volume: z.number(),
  turnover: z.number(),
});

export type Quote = z.infer<typeof QuoteSchema>;

export const OrderStatusSchema = z.enum([
  'Pending',
  'Submitted',
  'Filled',
  'PartiallyFilled',
  'Cancelled',
  'Rejected',
]);

export const OrderSideSchema = z.enum(['Buy', 'Sell']);

export const OrderSchema = z.object({
  orderId: z.string(),
  symbol: z.string(),
  market: MarketSchema,
  side: OrderSideSchema,
  price: z.number().optional(), // optional for market orders
  quantity: z.number(),
  executedQuantity: z.number(),
  status: OrderStatusSchema,
  commission: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;
