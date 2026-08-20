"use client";

import { useEffect } from "react";

export default function DatabaseHeartbeat() {
  useEffect(() => {
    // Keep DB connection warm
    const pingKeepAlive = () => {
      fetch("/api/cron/keep-alive", { cache: "no-store" }).catch(() => {});
    };

    // Check updates for bookmarked mangas
    const pingCheckUpdates = () => {
      fetch("/api/cron/check-updates", { cache: "no-store" }).catch(() => {});
    };

    // Delay initial pings to not compete with SSR page queries
    const initialKeepAliveTimeout = setTimeout(pingKeepAlive, 10000);
    const initialUpdateTimeout = setTimeout(pingCheckUpdates, 30000);

    // Periodic heartbeat every 5 minutes to keep database active
    const keepAliveInterval = setInterval(pingKeepAlive, 300000);

    // Periodic check for new chapters every 15 minutes
    const updateInterval = setInterval(pingCheckUpdates, 900000);

    return () => {
      clearTimeout(initialKeepAliveTimeout);
      clearTimeout(initialUpdateTimeout);
      clearInterval(keepAliveInterval);
      clearInterval(updateInterval);
    };
  }, []);

  return null;
}
