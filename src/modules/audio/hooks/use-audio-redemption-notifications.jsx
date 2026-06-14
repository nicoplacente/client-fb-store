"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { socket } from "@/modules/auth/libs/socket";

export default function useAudioRedemptionNotifications(userId) {
  useEffect(() => {
    if (!userId) {
      if (socket.connected) {
        socket.disconnect();
      }

      socket.connect();
      return undefined;
    }

    const handleUpdate = (payload = {}) => {
      if (payload.message) {
        toast.info(payload.message);
      }

      window.dispatchEvent(
        new CustomEvent("audio-redemption-updated", {
          detail: {
            redemptionId: payload.redemptionId,
            status: payload.status,
          },
        }),
      );
    };

    socket.on("audio:redemption:update", handleUpdate);

    if (socket.connected) {
      socket.disconnect();
    }

    socket.connect();

    return () => {
      socket.off("audio:redemption:update", handleUpdate);
    };
  }, [userId]);
}
