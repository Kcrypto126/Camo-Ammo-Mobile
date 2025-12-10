import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { Badge } from "./Badge";

interface ActiveViewersProps {
  entityType: string;
  entityId: string;
}

export function ActiveViewers({ entityType, entityId }: ActiveViewersProps) {
  const viewers = useQuery(api.activeViewers.getActiveViewers, {
    entityType,
    entityId,
  });
  const registerViewer = useMutation(api.activeViewers.registerViewer);
  const unregisterViewer = useMutation(api.activeViewers.unregisterViewer);

  // Register/unregister viewer on mount/unmount
  useEffect(() => {
    const register = async () => {
      try {
        await registerViewer({ entityType, entityId });
      } catch (error) {
        console.error("Failed to register viewer:", error);
      }
    };

    register();
    // Re-register every 15 seconds to keep active
    const interval = setInterval(register, 15000);

    return () => {
      clearInterval(interval);
      unregisterViewer({ entityType, entityId }).catch(console.error);
    };
  }, [entityType, entityId, registerViewer, unregisterViewer]);

  if (!viewers || viewers.length === 0) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-2 flex-wrap mb-2">
      <Text className="text-xs text-gray-400">Active viewers:</Text>
      {viewers.map((viewer) => (
        <Badge key={viewer.userId} type="secondary" className="text-xs">
          {viewer.name}
        </Badge>
      ))}
    </View>
  );
}
