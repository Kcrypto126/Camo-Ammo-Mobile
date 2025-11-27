import AddFriendDialog from "@/components/friends/AddFriendDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import {
  Check,
  MapPin,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FriendsPanelProps {
  onViewProfile?: (userId: Id<"users">) => void;
}

export default function FriendsPanel({ onViewProfile }: FriendsPanelProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  const friends = useQuery(api.friends.getFriends);
  const pendingRequests = useQuery(api.friends.getPendingRequests);
  const friendsLocations = useQuery(api.locationSharing.getFriendsLocations);

  const sendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptRequest = useMutation(api.friends.acceptFriendRequest);
  const rejectRequest = useMutation(api.friends.rejectFriendRequest);
  const removeFriend = useMutation(api.friends.removeFriend);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest({ requestId: requestId as never });
      showToast("Friend request accepted!");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message: errorMessage } = error.data as {
          code: string;
          message: string;
        };
        showToast(errorMessage);
      } else {
        showToast("Failed to accept request");
      }
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest({ requestId: requestId as never });
      showToast("Friend request rejected");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message: errorMessage } = error.data as {
          code: string;
          message: string;
        };
        showToast(errorMessage);
      } else {
        showToast("Failed to reject request");
      }
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend({ friendId: friendId as never });
      showToast("Friend removed");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message: errorMessage } = error.data as {
          code: string;
          message: string;
        };
        showToast(errorMessage);
      } else {
        showToast("Failed to remove friend");
      }
    }
  };

  const getFriendLocation = (friendId: string) => {
    return friendsLocations?.find((loc) => loc.userId === friendId);
  };

  const renderTabContent = () => {
    if (activeTab === "friends") {
      if (!friends) {
        return (
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">Loading friends...</Text>
          </View>
        );
      }
      if (friends.length === 0) {
        return (
          <View className="py-8 items-center">
            <Users size={48} color="#9ca3af" style={{ opacity: 0.5 }} />
            <Text className="text-sm text-gray-400 mt-2">No friends yet</Text>
            <Text className="text-xs text-gray-500 mt-2 text-center px-4">
              Add friends to share locations and plan hunts together
            </Text>
          </View>
        );
      }
      return (
        <View className="p-4 pb-6">
          {friends.map((friend) => {
            const location = getFriendLocation(friend._id);
            return (
              <View
                key={friend._id}
                className="p-3 bg-gray-800 border border-gray-700 rounded-lg mb-3"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <TouchableOpacity
                    className="flex-1"
                    style={{ minWidth: 0 }}
                    onPress={() => onViewProfile?.(friend._id as Id<"users">)}
                    disabled={!onViewProfile}
                    activeOpacity={onViewProfile ? 0.7 : 1}
                  >
                    <Text className="font-medium text-white" numberOfLines={1}>
                      {friend.name || "Unknown"}
                    </Text>
                    <Text
                      className="text-xs text-gray-400 mt-1"
                      numberOfLines={1}
                    >
                      {friend.email}
                    </Text>
                    {location && (
                      <View className="flex-row items-center gap-1 mt-2">
                        <MapPin size={12} color="#10b981" />
                        <Text className="text-xs text-green-500">
                          Sharing location
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Button
                    type="ghost"
                    onPress={() => handleRemoveFriend(friend._id)}
                  >
                    <UserMinus size={16} color="#fff" />
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    if (activeTab === "requests") {
      if (!pendingRequests) {
        return (
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">Loading requests...</Text>
          </View>
        );
      }
      if (pendingRequests.length === 0) {
        return (
          <View className="py-8 items-center">
            <Users size={48} color="#9ca3af" style={{ opacity: 0.5 }} />
            <Text className="text-sm text-gray-400 mt-2">
              No pending requests
            </Text>
          </View>
        );
      }
      return (
        <View className="p-4 pb-6">
          {pendingRequests.map((request) => (
            <View
              key={request._id}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg mb-3"
            >
              <View className="space-y-3">
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      request.fromUser?._id &&
                      onViewProfile?.(request.fromUser._id as Id<"users">)
                    }
                    disabled={!request.fromUser?._id || !onViewProfile}
                    activeOpacity={onViewProfile ? 0.7 : 1}
                  >
                    <Text className="font-medium text-white">
                      {request.fromUser?.name || "Unknown"}
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-400 mt-1">
                    {request.fromUser?.email}
                  </Text>
                  {request.message && (
                    <View className="mt-2 p-2 bg-gray-700 rounded">
                      <Text className="text-sm text-gray-300">
                        {request.message}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row gap-2 mt-2">
                  <Button
                    type="primary"
                    onPress={() => handleAccept(request._id)}
                    className="flex-1"
                  >
                    <View className="flex-row items-center gap-1">
                      <Check size={16} color="#fff" />
                      <Text className="text-white font-semibold">Accept</Text>
                    </View>
                  </Button>
                  <Button
                    type="outline"
                    onPress={() => handleReject(request._id)}
                    className="flex-1"
                  >
                    <View className="flex-row items-center gap-1">
                      <X size={16} color="#fff" />
                      <Text className="text-white font-semibold">Decline</Text>
                    </View>
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-gray-900">
      <View className="p-4 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Users size={20} color="#f97316" />
            <Text className="text-lg font-semibold text-white">Friends</Text>
          </View>
          <Button type="primary" onPress={() => setShowAddDialog(true)}>
            <View className="flex-row items-center gap-1">
              <UserPlus size={16} color="#000" />
              <Text className="font-semibold">Add</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Tabs */}
      <View className="mx-4 mt-4 flex-row border-b border-gray-800">
        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "friends" ? "border-orange-500" : "border-transparent"
          }`}
          onPress={() => setActiveTab("friends")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "friends" ? "text-orange-500" : "text-gray-400"
              }`}
            >
              Friends
            </Text>
            {friends && friends.length > 0 && (
              <Badge type="secondary">{friends.length}</Badge>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "requests"
              ? "border-orange-500"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("requests")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "requests" ? "text-orange-500" : "text-gray-400"
              }`}
            >
              Requests
            </Text>
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge type="destructive">{pendingRequests.length}</Badge>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        {renderTabContent()}
      </ScrollView>

      <AddFriendDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </View>
  );
}
