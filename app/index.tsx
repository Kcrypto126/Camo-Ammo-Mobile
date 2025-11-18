// import BiometricSignIn from "@/components/ui/biometric-signin.tsx";
// import { SignInButton } from "@/components/ui/signin.tsx";
// import { useAuth } from "@/hooks/use-auth.ts";
// import { useBiometricAuth } from "@/hooks/use-biometric-auth.ts";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ImageBackground, Text, View } from "react-native";

export default function WelcomePage() {
  // const { isEnabled } = useBiometricAuth();
  // const { signIn } = useAuth();

  const handleBiometricSuccess = () => {
    // Biometric authentication successful, trigger OIDC sign-in silently
    // signIn("google");
  };

  return (
    <ImageBackground
      source={require("../assets/images/file_5JpYHgTxiv7txVsQFGXP90wl.jpg")}
      resizeMode="cover"
      className="flex-1 w-full h-full relative justify-center items-center"
      imageStyle={{ width: "100%", height: "100%" }}
    >
      {/* Overlay */}
      {/* Tailwind's `bg-gradient-to-b` and `via-*` don't work natively in React Native.
          Instead, use Expo LinearGradient for gradients on mobile. */}
      <View
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ImageBackground
          source={require("../assets/images/file_5JpYHgTxiv7txVsQFGXP90wl.jpg")}
          imageStyle={{ width: "100%", height: "100%" }}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.7)",
              "rgba(142, 69, 18, 0.5)",
              "rgba(0,0,0,0.8)",
            ]}
            locations={[0, 0.5, 1]}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </ImageBackground>
      </View>

      {/* Content */}
      <View className="flex-1 z-10 w-full justify-center items-center px-4">
        <Text
          className="text-4xl md:text-5xl font-bold text-white text-center mb-3 drop-shadow-lg shadow-black"
          style={{
            textShadowColor: "#000000dd",
            textShadowOffset: { width: 0, height: 3 },
            textShadowRadius: 10,
          }}
        >
          Camo & Ammo
        </Text>
        <Text
          className="text-lg text-white/90 text-center mb-9 drop-shadow-md shadow-black"
          style={{
            textShadowColor: "#000000aa",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
          }}
        >
          Track Your Hunt. Master Your Territory.
        </Text>
        {/* <View className="w-full space-y-4">
          {isEnabled && <BiometricSignIn onSuccess={handleBiometricSuccess} />}
          <SignInButton
            size="lg"
            className="h-14 w-full px-8 text-lg shadow-2xl"
          />
        </View> */}
      </View>
    </ImageBackground>
  );
}
