import { useQuery } from "@tanstack/react-query";
import {
  getAlerts,
  getStoredAlerts,
} from "../api/alerts";

function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const alerts = await getAlerts();
      const storedAlerts = getStoredAlerts();

      return [
        ...storedAlerts,
        ...alerts,
      ];
    },
  });
}

export default useAlerts;