import { SignInModal } from "@/components/ui/SignInModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export default function WelcomePage() {
  const [showModal, setShowModal] = useState(false);

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
        <View className="w-full items-center">
          <TouchableOpacity
            onPress={() => {
              console.log("[WelcomePage] Sign in button pressed");
              setShowModal(true);
            }}
            className="bg-orange-500 max-w-[490px] w-full rounded-lg py-4 px-6 flex-row items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Arrow Icon */}
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#000"
              style={{ marginRight: 8 }}
            />
            {/* Sign In Text */}
            <Text className="text-black text-lg font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign In Modal */}
      <SignInModal visible={showModal} onClose={() => setShowModal(false)} />
    </ImageBackground>
  );
}
