"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type SiteLiveRefreshProps = {
  tenantId: string;
};

type SiteUpdateMessage = {
  type: "site-updated";
  tenantId: string;
  timestamp: string;
};

const CHANNEL_NAME =
  "nelled-business-site-updates";

const STORAGE_KEY =
  "nelled-business-site-update";

function isSiteUpdateMessage(
  value: unknown,
): value is SiteUpdateMessage {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const message =
    value as Partial<SiteUpdateMessage>;

  return (
    message.type === "site-updated" &&
    typeof message.tenantId ===
      "string" &&
    typeof message.timestamp ===
      "string"
  );
}

export function SiteLiveRefresh({
  tenantId,
}: SiteLiveRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    let refreshTimeout:
      | ReturnType<typeof setTimeout>
      | null = null;

    function refreshSite(
      message: unknown,
    ) {
      if (
        !isSiteUpdateMessage(message) ||
        message.tenantId !== tenantId
      ) {
        return;
      }

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      refreshTimeout = setTimeout(
        () => {
          router.refresh();
        },
        150,
      );
    }

    let channel:
      | BroadcastChannel
      | null = null;

    if ("BroadcastChannel" in window) {
      channel =
        new BroadcastChannel(
          CHANNEL_NAME,
        );

      channel.addEventListener(
        "message",
        (event: MessageEvent) => {
          refreshSite(event.data);
        },
      );
    }

    function handleStorage(
      event: StorageEvent,
    ) {
      if (
        event.key !== STORAGE_KEY ||
        !event.newValue
      ) {
        return;
      }

      try {
        const message =
          JSON.parse(
            event.newValue,
          ) as unknown;

        refreshSite(message);
      } catch {
        // Ignora mensagens inválidas.
      }
    }

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      if (refreshTimeout) {
        clearTimeout(
          refreshTimeout,
        );
      }

      channel?.close();

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, [router, tenantId]);

  return null;
}