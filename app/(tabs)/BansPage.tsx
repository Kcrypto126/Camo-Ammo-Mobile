import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Ban } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

interface BansPageProps {
  onBack: () => void;
}

export default function BansPage({ onBack }: BansPageProps) {
  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">Banned Users</Text>
            <Text className="text-xs text-gray-400">
              Manage user bans and restrictions
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <CardContent className="py-12">
            <View className="items-center">
              <Ban size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
              <Text className="text-sm font-semibold text-white mb-1">
                No Banned Users
              </Text>
              <Text className="text-sm text-gray-400 text-center">
                No users have been banned from the platform
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
