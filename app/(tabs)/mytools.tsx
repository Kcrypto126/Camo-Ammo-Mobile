import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";

export default function MyToolsPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-gray-900">
      <Text className="text-white text-xl font-bold p-4">My Tools</Text>
      <View className="flex-1 items-center justify-center px-4 gap-6">
        <Text className="text-gray-400 text-center mb-8">
          My Tools content will be displayed here
        </Text>
        <Button type="danger" onPress={handleLogout} className="w-full">
          <Text className="text-red-400 font-semibold text-center">
            Log Out
          </Text>
        </Button>
      </View>
    </View>
  );
}
