import axios from 'axios';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export interface BridgeQuote {
  destinationChain: string;
  sourceAmount: string;
  estimatedFee: string;
  totalAmount: string;
}

export async function fetchLayerZeroQuote(destinationChain: string, amount: string): Promise<BridgeQuote> {
  const payload = {
    destinationChain,
    amount
  };

  const url = `${config.layerzero.apiUrl}/quote`;
  logger.debug('Requesting LayerZero quote', { url, payload });

  const response = await axios.post<BridgeQuote>(url, payload, {
    timeout: 12000
  });

  return response.data;
}

export async function publishBridgeTransfer(payload: Record<string, unknown>): Promise<string> {
  const url = `${config.layerzero.apiUrl}/bridge`; 
  logger.debug('Publishing bridge transfer', { url, payload });

  const response = await axios.post<{ transactionId: string }>(url, payload, {
    timeout: 20000
  });

  return response.data.transactionId;
}

export function buildLayerZeroPayload(
  sourceAddress: string,
  destinationAddress: string,
  destinationChain: string,
  amountSol: number
): Record<string, unknown> {
  return {
    sourceAddress,
    destinationAddress,
    destinationChain,
    amountSol,
    timestamp: new Date().toISOString()
  };
}
