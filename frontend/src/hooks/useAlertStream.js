import { useState } from "react";

function useAlertStream() {
  const [connected] = useState(false);

  return {
    alerts: [],
    connected,
  };
}

export default useAlertStream;