import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { showToast } from "@/components/ui/Toast";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { Fingerprint } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface BiometricPromptProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BiometricPrompt({
  userId,
  open,
  onOpenChange,
}: BiometricPromptProps) {
  const [isEnabling, setIsEnabling] = useState(false);
  const { enableBiometric } = useBiometricAuth();

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      const success = await enableBiometric(userId);
      if (success) {
        showToast("Biometric authentication enabled!");
        onOpenChange(false);
      } else {
        showToast("Failed to enable biometric authentication");
      }
    } catch (error) {
      showToast("Failed to enable biometric authentication");
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <View className="gap-4">
        <View className="gap-1 items-center">
          <View className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6800]/10">
            <Fingerprint size={32} color="#ff6800" />
          </View>
          <Text className="text-xl font-bold text-white text-center">
            Enable Biometric Sign-In
          </Text>
          <Text className="text-sm text-gray-400 text-center">
            Use your fingerprint or Face ID to quickly sign in to your account
            on this device.
          </Text>
        </View>
        <View className="flex-col gap-2 mt-4">
          <Button
            onPress={handleEnable}
            disabled={isEnabling}
            className="w-full"
          >
            {isEnabling ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white">Setting up...</Text>
              </View>
            ) : (
              <Text className="text-white">Enable Biometric Sign-In</Text>
            )}
          </Button>
          <Button
            type="ghost"
            onPress={() => onOpenChange(false)}
            className="w-full"
            disabled={isEnabling}
          >
            <Text className="text-white">Maybe Later</Text>
          </Button>
        </View>
      </View>
    </Dialog>
  );
}
