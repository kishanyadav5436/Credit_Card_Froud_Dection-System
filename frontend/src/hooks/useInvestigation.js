import { useQuery } from "@tanstack/react-query";
import { getInvestigation } from "../api/investigations";

function useInvestigation(transactionId) {
  return useQuery({
    queryKey: ["investigation", transactionId],
    queryFn: () => getInvestigation(transactionId),
    enabled: Boolean(transactionId),
  });
}

export default useInvestigation;