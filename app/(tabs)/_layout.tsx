import { useAuth } from "@/hooks/use-auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log("[TabsLayout] Auth state changed:", {
      isAuthenticated,
      segments,
    });
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="hq" />
      <Stack.Screen name="map" />
      <Stack.Screen name="scouting" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="mytools" />
      <Stack.Screen name="ProfileSetupPage" />
    </Stack>
  );
}
