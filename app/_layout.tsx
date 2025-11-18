import { AuthProvider } from "@/contexts/AuthContext";
import { useConvexAuth } from "convex/react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "../global.css";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log("[RootLayout] Auth check:", { isAuthenticated, segments });
    const inAuthGroup = segments[0] === "(tabs)";

    // Wait until auth is resolved
    if (isLoading) return;

    if (!isAuthenticated && inAuthGroup) {
      router.replace("/");
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
