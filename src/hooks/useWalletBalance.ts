import { useState, useEffect } from 'react';

export function useWalletBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching wallet balance from an API
    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        // Replace this with actual API call in production
        const mockBalance = 1000; // Mock balance for testing
        setBalance(mockBalance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return {
    balance,
    isLoading,
  };
} 