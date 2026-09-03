"use client";
import { useEffect, useState } from "react";

export type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";

interface NetworkInformation {
  effectiveType?: EffectiveConnectionType;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as NavigatorWithConnection).connection;
}

export function useConnectionType(): EffectiveConnectionType | undefined {
  const [effectiveType, setEffectiveType] = useState<EffectiveConnectionType | undefined>(
    () => getConnection()?.effectiveType
  );

  useEffect(() => {
    const connection = getConnection();
    if (!connection?.addEventListener) return;
    const handleChange = () => setEffectiveType(connection.effectiveType);
    connection.addEventListener("change", handleChange);
    return () => connection.removeEventListener?.("change", handleChange);
  }, []);

  return effectiveType;
}
