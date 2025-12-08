import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Eye,
  RotateCcw,
  Shield,
  User,
  UserCog,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface ArchivedMembersPageProps {
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

export default function ArchivedMembersPage({
  onBack,
  onViewProfile,
}: ArchivedMembersPageProps) {
  const users = useQuery(api.roles.listArchivedUsers);
  const unarchiveUser = useMutation(api.roles.unarchiveUser);
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null
  );
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false);

  const handleUnarchive = async () => {
    if (!selectedUserId) return;

    try {
      await unarchiveUser({ userId: selectedUserId });
      showToast("Member restored successfully");
      setShowUnarchiveDialog(false);
      setSelectedUserId(null);
    } catch (error) {
      showToast("Failed to restore member");
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Shield size={16} color="currentColor" />;
    if (role === "admin") return <UserCog size={16} color="currentColor" />;
    return <User size={16} color="currentColor" />;
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
              Archived Members
            </Text>
            <Text className="text-xs text-gray-400">
              View and restore archived members
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
                No archived members
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
                      <View className="flex-row items-center gap-2 flex-wrap mb-1">
                        <Text
                          className="font-semibold text-white"
                          numberOfLines={1}
                        >
                          {user.name || "Unknown"}
                        </Text>
                        {user.memberNumber && (
                          <Badge type="default" className="text-xs">
                            <Text className="text-yellow-500">
                              {user.memberNumber}
                            </Text>
                          </Badge>
                        )}
                        <Badge
                          type={getRoleBadgeVariant(user.role || "member")}
                        >
                          <View className="flex-row items-center gap-1">
                            {getRoleIcon(user.role || "member")}
                            <Text className="text-xs">
                              {(user.role || "member").toUpperCase()}
                            </Text>
                          </View>
                        </Badge>
                        <Badge type="secondary">
                          <Text className="text-xs">ARCHIVED</Text>
                        </Badge>
                      </View>
                      <Text className="text-sm text-gray-400" numberOfLines={1}>
                        {user.email}
                      </Text>
                      {user.archivedAt && (
                        <Text className="text-xs text-gray-400">
                          Archived on{" "}
                          {format(new Date(user.archivedAt), "MMM d, yyyy")}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row gap-2">
                      <Button
                        type="ghost"
                        onPress={() => onViewProfile(user._id)}
                      >
                        <View className="flex-row items-center gap-1">
                          <Eye size={16} color="#ffffff" />
                          <Text className="text-white">View</Text>
                        </View>
                      </Button>
                      <Button
                        type="primary"
                        onPress={() => {
                          setSelectedUserId(user._id);
                          setShowUnarchiveDialog(true);
                        }}
                      >
                        <View className="flex-row items-center gap-1">
                          <RotateCcw size={16} color="#ffffff" />
                          <Text className="text-white">Restore</Text>
                        </View>
                      </Button>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Unarchive Confirmation Dialog */}
      <Dialog
        visible={showUnarchiveDialog}
        onClose={() => setShowUnarchiveDialog(false)}
      >
        <View className="gap-4">
          <View className="gap-1">
            <Text className="text-lg font-bold text-white">Restore Member</Text>
            <Text className="text-sm text-gray-400">
              Are you sure you want to restore this member from the archive?
              They will regain access to their account.
            </Text>
          </View>
          <View className="flex-row gap-3 mt-4">
            <Button
              type="outline"
              onPress={() => setShowUnarchiveDialog(false)}
              className="flex-1"
            >
              <Text className="text-white">Cancel</Text>
            </Button>
            <Button type="primary" onPress={handleUnarchive} className="flex-1">
              <Text className="text-white">Restore</Text>
            </Button>
          </View>
        </View>
      </Dialog>
    </View>
  );
}
