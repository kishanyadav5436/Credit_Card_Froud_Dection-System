import { useEffect, useState } from "react";
import { subscribeToAlerts } from "../api/alerts";

function useAlertStream() {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(true);

    const unsubscribe = subscribeToAlerts((newAlert) => {
      setAlerts((currentAlerts) => [
        newAlert,
        ...currentAlerts,
      ]);
    });

    return () => {
      unsubscribe();
      setConnected(false);
    };
  }, []);

  return {
    alerts,
    connected,
  };
}

export default useAlertStream;