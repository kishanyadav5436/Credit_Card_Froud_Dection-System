import { useMutation } from "@tanstack/react-query";
import { checkFraud } from "../api/fraud";

function useFraudCheck() {
  return useMutation({
    mutationFn: checkFraud,
  });
}

export default useFraudCheck;