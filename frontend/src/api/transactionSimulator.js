import { calculateRisk } from "./fraudEngine";
import { createAlertFromTransaction } from "./alerts";

const merchants = [
  "Amazon India",
  "Flipkart",
  "Myntra",
  "Swiggy",
  "Uber",
];

const customers = [
  "Rahul Sharma",
  "Amit Verma",
  "Priya Singh",
  "Neha Gupta",
];

export function simulateTransaction() {
  const transaction = {
    id: `TXN-${Date.now()}`,

    customerName:
      customers[
        Math.floor(Math.random() * customers.length)
      ],

    merchant:
      merchants[
        Math.floor(Math.random() * merchants.length)
      ],

    amount:
      Math.floor(Math.random() * 90000) + 1000,

    velocity: Math.floor(Math.random() * 5),

    isNewDevice: Math.random() > 0.55,

    locationMismatch: Math.random() > 0.65,

    timestamp: new Date().toISOString(),
  };

  const risk = calculateRisk(transaction);

  const result = {
    ...transaction,
    ...risk,
  };

  if (risk.score >= 60) {
    createAlertFromTransaction(result);
  }

  return result;
}