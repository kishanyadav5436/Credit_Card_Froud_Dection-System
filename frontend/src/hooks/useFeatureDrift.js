import { useQuery } from "@tanstack/react-query";
import { getFeatureDrift } from "../api/models";

function useFeatureDrift() {
  return useQuery({
    queryKey: ["feature-drift"],
    queryFn: getFeatureDrift,
  });
}

export default useFeatureDrift;