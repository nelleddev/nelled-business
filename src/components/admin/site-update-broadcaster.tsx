"use client";

import { useEffect } from "react";

type SiteUpdateBroadcasterProps = {
  tenantId: string;
  shouldBroadcast: boolean;
};

const CHANNEL_NAME = "nelled-business-site-updates";
const STORAGE_KEY = "nelled-business-site-update";

export function SiteUpdateBroadcaster({
  tenantId,
  shouldBroadcast,
}: SiteUpdateBroadcasterProps) {
  useEffect(() => {
    if (!shouldBroadcast) {
      return;
    }

    const message = {
      type: "site-updated",
      tenantId,
      timestamp: new Date().toISOString(),
    };

    if ("BroadcastChannel" in window) {
      const channel =
        new BroadcastChannel(CHANNEL_NAME);

      channel.postMessage(message);
      channel.close();
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(message),
    );
  }, [tenantId, shouldBroadcast]);

  return null;
}