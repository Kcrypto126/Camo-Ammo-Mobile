import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Shield, UserCog } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

interface AdministratorsPageProps {
  onBack: () => void;
}

export default function AdministratorsPage({ onBack }: AdministratorsPageProps) {
  const users = useQuery(api.roles.listUsers);

  const admins = users?.filter((u) => u.role === "owner" || u.role === "admin") || [];

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">Administrators</Text>
            <Text className="text-xs text-gray-400">View all admins and owners</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {users === undefined ? (
          <View className="gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </View>
        ) : admins.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <View className="items-center">
                <Shield size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
                <Text className="text-sm font-semibold text-white mb-1">
                  No Administrators
                </Text>
                <Text className="text-sm text-gray-400 text-center">
                  No administrators have been assigned yet
                </Text>
              </View>
            </CardContent>
          </Card>
        ) : (
          <View className="gap-3">
            {admins.map((admin) => (
              <Card key={admin._id}>
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-4">
                    <Avatar
                      src={
                        admin.avatar?.startsWith("kg")
                          ? undefined
                          : admin.avatar || undefined
                      }
                      fallback={
                        admin.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?"
                      }
                      size={48}
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap mb-1">
                        <Text className="font-semibold text-white" numberOfLines={1}>
                          {admin.name || "Unknown"}
                        </Text>
                        <Badge
                          type={admin.role === "owner" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          <View className="flex-row items-center gap-1">
                            {admin.role === "owner" ? (
                              <Shield size={12} color="currentColor" />
                            ) : (
                              <UserCog size={12} color="currentColor" />
                            )}
                            <Text className="text-xs">
                              {(admin.role || "admin").toUpperCase()}
                            </Text>
                          </View>
                        </Badge>
                      </View>
                      <Text className="text-sm text-gray-400" numberOfLines={1}>
                        {admin.email}
                      </Text>
                      {admin.city && admin.state && (
                        <Text className="text-xs text-gray-400">
                          {admin.city}, {admin.state}
                        </Text>
                      )}
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
