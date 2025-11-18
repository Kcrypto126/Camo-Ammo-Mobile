import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    console.log("[Dashboard] Signing out...");
    signOut();
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Dashboard
        </Text>
        <Text className="text-gray-600">
          You are successfully signed in!
        </Text>
      </View>

      <TouchableOpacity
        className="bg-red-600 rounded-lg py-4 items-center mt-4"
        onPress={handleSignOut}
      >
        <Text className="text-white font-semibold text-base">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

