"use client";

import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function PwaRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {
      // The studio remains fully usable when service workers are unavailable.
    });
  }, []);

  return null;
}
