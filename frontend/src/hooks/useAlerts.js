import { useQuery } from "@tanstack/react-query";
import { getAlerts } from "../api/alerts";

function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
  });
}

export default useAlerts;