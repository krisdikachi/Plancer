'use client';

import { useEffect } from "react";

interface OneSignalProviderProps {
  children: React.ReactNode;
}

export default function OneSignalProvider({ children }: OneSignalProviderProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && "OneSignal" in window) {
      (window as any).OneSignal = (window as any).OneSignal || [];
      (window as any).OneSignal.push(() => {
        (window as any).OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          notifyButton: {
            enable: true,
          },
        });
      });
    }
  }, []);

  return <>{children}</>;
} 