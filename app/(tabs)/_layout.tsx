import { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log("[TabsLayout] Auth state changed:", { isAuthenticated, segments });
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerTitle: "Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
    </Tabs>
  );
}

