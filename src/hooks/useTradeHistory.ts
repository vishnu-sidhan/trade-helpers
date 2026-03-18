import { useLocalStorage } from './useLocalStorage';
import type { CalculatorInputs } from '../lib/calculations';

export interface SavedTrade {
  id: string;
  date: string;
  inputs: CalculatorInputs;
  targetProfit: number; // Base high
  riskPerLot: number;
  slType: string;
  slPremium: number;
}

export function useTradeHistory() {
  const [trades, setTrades] = useLocalStorage<SavedTrade[]>('savedTrades', []);

  const addTrade = (trade: Omit<SavedTrade, 'id' | 'date'>) => {
    const newTrade: SavedTrade = {
      ...trade,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setTrades((prev) => [newTrade, ...prev]);
  };

  const removeTrade = (id: string) => {
    setTrades((prev) => prev.filter(t => t.id !== id));
  };

  const clearJournal = () => {
    setTrades([]);
  };

  const importTrades = (importedTrades: SavedTrade[]) => {
    setTrades(importedTrades);
  };

  return { trades, addTrade, removeTrade, clearJournal, importTrades };
}
