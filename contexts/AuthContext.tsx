import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const secureStorage = {
    getItem: async (key: string) => {
      return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: any) => {
      await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string) => {
      await SecureStore.deleteItemAsync(key);
    },
  };

  return (
    <ConvexAuthProvider
      client={convex}
      storage={
        window.localStorage === undefined ? secureStorage : window.localStorage
      }
    >
      {children}
    </ConvexAuthProvider>
  );
}
