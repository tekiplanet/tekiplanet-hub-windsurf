import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Transaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

interface WalletStore {
  wallets: Record<string, {
    balance: number;
    transactions: Transaction[];
  }>;
  addBalance: (userId: string, amount: number) => void;
  deductBalance: (userId: string, amount: number) => void;
  addTransaction: (userId: string, transaction: Omit<Transaction, 'userId'>) => void;
  getBalance: (userId: string) => number;
  getTransactions: (userId: string) => Transaction[];
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: {},
      addBalance: (userId, amount) => 
        set((state) => ({
          wallets: {
            ...state.wallets,
            [userId]: {
              balance: (state.wallets[userId]?.balance || 0) + amount,
              transactions: state.wallets[userId]?.transactions || []
            }
          }
        })),
      deductBalance: (userId, amount) =>
        set((state) => ({
          wallets: {
            ...state.wallets,
            [userId]: {
              balance: (state.wallets[userId]?.balance || 0) - amount,
              transactions: state.wallets[userId]?.transactions || []
            }
          }
        })),
      addTransaction: (userId, transaction) =>
        set((state) => ({
          wallets: {
            ...state.wallets,
            [userId]: {
              balance: state.wallets[userId]?.balance || 0,
              transactions: [
                { ...transaction, userId },
                ...(state.wallets[userId]?.transactions || [])
              ]
            }
          }
        })),
      getBalance: (userId) => get().wallets[userId]?.balance || 0,
      getTransactions: (userId) => get().wallets[userId]?.transactions || [],
    }),
    {
      name: 'wallet-storage'
    }
  )
); 