import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getTransactions,
  getStoredTransactions,
} from "../api/transactions";

function useTransactions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const transactions = await getTransactions();
      const storedTransactions =
        getStoredTransactions();

      return [
        ...storedTransactions,
        ...transactions,
      ];
    },
  });

  useEffect(() => {
    const handleTransactionCreated = () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    };

    window.addEventListener(
      "fraudguard-transaction-created",
      handleTransactionCreated
    );

    return () => {
      window.removeEventListener(
        "fraudguard-transaction-created",
        handleTransactionCreated
      );
    };
  }, [queryClient]);

  return query;
}

export default useTransactions;