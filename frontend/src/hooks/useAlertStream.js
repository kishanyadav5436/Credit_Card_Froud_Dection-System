import { useEffect, useState } from "react";
import { subscribeToAlerts } from "../api/alerts";

function useAlertStream() {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const handleNewAlert = (event) => {
      setAlerts((currentAlerts) => [
        event.detail,
        ...currentAlerts,
      ]);
    };

    window.addEventListener(
      "fraudguard-alert-created",
      handleNewAlert
    );

    const unsubscribe =
      subscribeToAlerts((newAlert) => {
        setAlerts((currentAlerts) => [
          newAlert,
          ...currentAlerts,
        ]);
      });

    return () => {
      unsubscribe();

      window.removeEventListener(
        "fraudguard-alert-created",
        handleNewAlert
      );

      setConnected(false);
    };
  }, []);

  return {
    alerts,
    connected,
  };
}

export default useAlertStream;