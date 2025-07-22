"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const PROMO_BANNER_KEY = "promoBannerDismissed";

export default function PromoBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setVisible(!localStorage.getItem(PROMO_BANNER_KEY));
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(PROMO_BANNER_KEY, "true");
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center">
      <div className="bg-gradient-to-r from-blue-500 to-green-600 text-white px-6 py-3 rounded-b-xl shadow-lg flex items-center gap-4 max-w-2xl w-full mx-2 mt-2">
        <span className="font-semibold">
          🎉 Plancer is <span className="underline">free for a limited time</span>! Promo ends <b>August 18 2025</b>.
        </span>
        <button
          onClick={handleClose}
          className="ml-auto text-white hover:text-gray-200 focus:outline-none"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}