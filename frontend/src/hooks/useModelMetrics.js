import { useQuery } from "@tanstack/react-query";
import { getModelMetrics } from "../api/models";

function useModelMetrics() {
  return useQuery({
    queryKey: ["model-metrics"],
    queryFn: getModelMetrics,
  });
}

export default useModelMetrics;