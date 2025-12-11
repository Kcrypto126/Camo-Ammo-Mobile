import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Eye,
  RefreshCw,
  Shield,
  User,
  UserCog,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

interface MemberManagementPageProps {
  onBack: () => void;
  onViewProfile: (userId: Id<"users">) => void;
}

function UserAvatar({ user }: { user: { avatar?: string; name?: string } }) {
  // Get avatar URL from storage if it's a storage ID
  const avatarUrl = useQuery(
    api.profile.getPhotoUrl,
    user.avatar && user.avatar.startsWith("kg")
      ? { storageId: user.avatar as never }
      : "skip"
  );

  const displayUrl =
    avatarUrl || (user.avatar?.startsWith("kg") ? undefined : user.avatar);

  return (
    <Avatar
      src={displayUrl}
      fallback={
        user.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "?"
      }
      size={48}
    />
  );
}

export default function MemberManagementPage({
  onBack,
  onViewProfile,
}: MemberManagementPageProps) {
  const users = useQuery(api.roles.listUsers);
  const myRole = useQuery(api.roles.getMyRole);
  const addMemberNumbers = useMutation(
    api.users.addMemberNumbersToExistingUsers
  );
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await addMemberNumbers();
      showToast(result.message);
    } catch (error) {
      showToast("Failed to run migration");
      console.error(error);
    } finally {
      setIsMigrating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Shield size={14} color="#fff" />;
    if (role === "admin") return <UserCog size={14} color="#fff" />;
    return <User size={14} color="#fff" />;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" => {
    if (role === "owner") return "default";
    if (role === "admin") return "secondary";
    return "default";
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Member Management
            </Text>
            <Text className="text-xs text-gray-400">
              Manage user roles and permissions
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
        {/* Migration button - only show for owners */}
        {myRole === "owner" && users && users.some((u) => !u.memberNumber) && (
          <Card className="border-[#ff6800]/50 bg-[#ff6800]/5 mb-4">
            <CardContent className="p-4">
              <View className="gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-white">
                    Migration Available
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Some users don't have member numbers. Click to assign them.
                  </Text>
                </View>
                <Button
                  onPress={handleMigration}
                  disabled={isMigrating}
                  type="primary"
                >
                  <View className="flex-row items-center gap-2">
                    {isMigrating ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <RefreshCw size={16} color="#ffffff" />
                    )}
                    <Text className="text-white">
                      {isMigrating ? "Adding..." : "Add Member Numbers"}
                    </Text>
                  </View>
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        {users === undefined ? (
          <View className="gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </View>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <Text className="text-sm text-gray-400 text-center">
                No members found
              </Text>
            </CardContent>
          </Card>
        ) : (
          <View className="gap-3">
            {users.map((user) => (
              <Card key={user._id}>
                <CardContent className="p-4">
                  <View className="flex-row items-center gap-4">
                    <UserAvatar user={user} />
                    <View className="flex-1" style={{ minWidth: 0 }}>
                      <View className="flex-row items-center gap-2 mb-1 flex-wrap">
                        <Text
                          className="font-semibold text-white"
                          numberOfLines={1}
                        >
                          {user.name || "Unknown"}
                        </Text>
                        {/* {user.memberNumber && (
                          <Badge type="default" className="text-xs">
                            <Text className="text-yellow-500">
                              {user.memberNumber}
                            </Text>
                          </Badge>
                        )} */}
                        <Badge
                          type={getRoleBadgeVariant(user.role || "member")}
                        >
                          <View className="flex-row items-center gap-1">
                            {getRoleIcon(user.role || "member")}
                            <Text className="text-xs text-white">
                              {(user.role || "member").toUpperCase()}
                            </Text>
                          </View>
                        </Badge>
                        {user.accountStatus &&
                          user.accountStatus !== "active" && (
                            <Badge
                              type={
                                user.accountStatus === "banned"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              <Text className="text-xs">
                                {user.accountStatus.toUpperCase()}
                              </Text>
                            </Badge>
                          )}
                      </View>
                      <Text className="text-sm text-gray-400" numberOfLines={1}>
                        {user.email}
                      </Text>
                      {user.city && user.state && (
                        <Text className="text-xs text-gray-400">
                          {user.city}, {user.state}
                        </Text>
                      )}
                    </View>
                    <Button
                      type="ghost"
                      onPress={() => onViewProfile(user._id)}
                      className="!px-0 !py-0"
                    >
                      <View className="flex-row items-center gap-1">
                        <Eye size={16} color="#ffffff" />
                        <Text className="text-white">View</Text>
                      </View>
                    </Button>
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
