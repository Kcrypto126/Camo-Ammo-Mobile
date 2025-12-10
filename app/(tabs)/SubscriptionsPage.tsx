import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, CreditCard } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

interface SubscriptionsPageProps {
  onBack: () => void;
}

export default function SubscriptionsPage({ onBack }: SubscriptionsPageProps) {
  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">Subscriptions</Text>
            <Text className="text-xs text-gray-400">
              View and manage member subscriptions
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
              <CreditCard
                size={48}
                color="#9ca3af"
                style={{ marginBottom: 12 }}
              />
              <Text className="text-sm font-semibold text-white mb-1">
                No Active Subscriptions
              </Text>
              <Text className="text-sm text-gray-400 text-center">
                No subscription data available at this time
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}
