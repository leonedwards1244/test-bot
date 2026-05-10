import Bottleneck from 'bottleneck';
import { config } from '../utils/config';

export const globalRateLimiter = new Bottleneck({
  reservoir: config.rateLimit.requestsPerMinute,
  reservoirRefreshAmount: config.rateLimit.requestsPerMinute,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 1,
  minTime: 250
});

export function wrap<T extends any[]>(fn: (...args: T) => Promise<unknown>) {
  return (...args: T) => globalRateLimiter.schedule(() => fn(...args));
}
