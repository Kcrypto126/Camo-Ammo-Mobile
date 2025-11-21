import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

interface BiometricAuthState {
  isAvailable: boolean;
  isEnabled: boolean;
  isSupported: boolean;
}

// Storage helper that uses SecureStore on React Native and localStorage on web
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    isEnabled: false,
    isSupported: false,
  });

  useEffect(() => {
    // Check if WebAuthn is supported
    const isSupported =
      typeof window !== "undefined" &&
      window.PublicKeyCredential !== undefined &&
      navigator.credentials !== undefined;

    // Check if biometric is enabled in storage
    const checkEnabled = async () => {
      const enabled = (await storage.getItem("biometric_enabled")) === "true";
      return enabled;
    };

    // Check if platform authenticator (fingerprint/Face ID) is available
    if (
      isSupported &&
      typeof window !== "undefined" &&
      window.PublicKeyCredential
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(async (available) => {
          const isEnabled = await checkEnabled();
          setState({
            isSupported,
            isAvailable: available,
            isEnabled: isEnabled && available,
          });
        })
        .catch(async () => {
          setState({
            isSupported,
            isAvailable: false,
            isEnabled: false,
          });
        });
    } else {
      checkEnabled().then((isEnabled) => {
        setState({
          isSupported: false,
          isAvailable: false,
          isEnabled: false,
        });
      });
    }
  }, []);

  const enableBiometric = useCallback(
    async (userId: string) => {
      try {
        if (!state.isAvailable) {
          throw new Error("Biometric authentication not available");
        }

        // Create a credential
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
          {
            challenge,
            rp: {
              name: "Hunt Tracker",
              id:
                typeof window !== "undefined" && window.location
                  ? window.location.hostname
                  : "localhost",
            },
            user: {
              id: new TextEncoder().encode(userId),
              name: userId,
              displayName: "Hunter",
            },
            pubKeyCredParams: [
              { alg: -7, type: "public-key" }, // ES256
              { alg: -257, type: "public-key" }, // RS256
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
            attestation: "none",
          };

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        });

        if (credential) {
          // Store credential ID and enable flag
          await storage.setItem("biometric_enabled", "true");
          await storage.setItem(
            "biometric_credential_id",
            btoa(
              String.fromCharCode(
                ...new Uint8Array((credential as PublicKeyCredential).rawId)
              )
            )
          );

          setState((prev) => ({ ...prev, isEnabled: true }));
          return true;
        }

        return false;
      } catch (error) {
        console.error("Failed to enable biometric:", error);
        return false;
      }
    },
    [state.isAvailable]
  );

  const authenticateWithBiometric = useCallback(async () => {
    try {
      if (!state.isEnabled) {
        return false;
      }

      const credentialId = await storage.getItem("biometric_credential_id");
      if (!credentialId) {
        return false;
      }

      // Create authentication challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          challenge,
          allowCredentials: [
            {
              id: Uint8Array.from(atob(credentialId), (c) => c.charCodeAt(0)),
              type: "public-key",
            },
          ],
          timeout: 60000,
          userVerification: "required",
        };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      return !!assertion;
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      return false;
    }
  }, [state.isEnabled]);

  const disableBiometric = useCallback(async () => {
    await storage.removeItem("biometric_enabled");
    await storage.removeItem("biometric_credential_id");
    setState((prev) => ({ ...prev, isEnabled: false }));
  }, []);

  return {
    ...state,
    enableBiometric,
    authenticateWithBiometric,
    disableBiometric,
  };
}
