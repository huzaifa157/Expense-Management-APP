import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENCY_KEY = "currency_preference";

export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "PKR", symbol: "₨" },
  { code: "INR", symbol: "₹" },
];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  useEffect(() => {
    const loadCurrency = async () => {
      const stored = await AsyncStorage.getItem(CURRENCY_KEY);
      const match = CURRENCIES.find((c) => c.code === stored);
      if (match) setCurrency(match);
    };

    loadCurrency();
  }, []);

  const changeCurrency = async (code) => {
    const match = CURRENCIES.find((c) => c.code === code);
    if (!match) return;

    setCurrency(match);
    await AsyncStorage.setItem(CURRENCY_KEY, code);
  };

  const formatCurrency = (amount) => `${currency.symbol}${Number(amount || 0).toFixed(2)}`;

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
