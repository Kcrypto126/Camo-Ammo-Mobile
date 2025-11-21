import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Footprints,
  ThumbsUp,
  Truck,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

// Simple toast substitute since sonner is not available in React Native
function showToast(type: "success" | "error", message: string) {
  Alert.alert(type === "success" ? "Success" : "Error", message);
}

export function NotificationBell() {
  const notifications = useQuery(api.forums.getMyNotifications);
  const markAsRead = useMutation(api.forums.markNotificationRead);
  const updateVehicleStatus = useMutation(
    api.vehicleRecovery.updateRequestStatus
  );
  const closeVehicleRequest = useMutation(api.vehicleRecovery.closeRequest);
  const updateDeerStatus = useMutation(api.deerRecovery.updateRequestStatus);
  const closeDeerRequest = useMutation(api.deerRecovery.closeRequest);
  const [open, setOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      showToast("error", "Failed to mark notification as read");
    }
  };

  const handleFollowUpAction = async (
    type: string,
    requestId: string,
    action: "still_waiting" | "in_progress" | "close"
  ) => {
    setProcessingId(requestId);
    try {
      if (action === "close") {
        if (type === "vehicle_recovery_followup") {
          await closeVehicleRequest({
            requestId: requestId as Id<"vehicleRecoveryRequests">,
          });
        } else {
          await closeDeerRequest({
            requestId: requestId as Id<"deerRecoveryRequests">,
          });
        }
        showToast("success", "Request closed successfully");
      } else {
        if (type === "vehicle_recovery_followup") {
          await updateVehicleStatus({
            requestId: requestId as Id<"vehicleRecoveryRequests">,
            requestStatus: action,
          });
        } else {
          await updateDeerStatus({
            requestId: requestId as Id<"deerRecoveryRequests">,
            requestStatus: action,
          });
        }
        showToast("success", "Status updated successfully");
      }
    } catch (error) {
      showToast("error", "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "post_approved":
        return <ThumbsUp style={tw`text-green-500`} size={20} />;
      case "post_rejected":
        return <AlertCircle style={tw`text-red-500`} size={20} />;
      case "forum_warning":
        return <AlertTriangle style={tw`text-orange-500`} size={20} />;
      case "vehicle_recovery_followup":
        return <Truck style={tw`text-blue-500`} size={20} />;
      case "deer_recovery_followup":
        return <Footprints style={tw`text-amber-600`} size={20} />;
      default:
        return <Bell style={tw`text-gray-400`} size={20} />;
    }
  };

  // Modal implementation for RN "popover"
  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={tw`relative h-9 w-9 items-center justify-center`}
      >
        <Bell size={22} style={tw`text-gray-700`} />
        {unreadCount > 0 && (
          <View
            style={tw`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 items-center justify-center`}
          >
            <Text style={tw`text-white text-xs font-bold`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={tw`flex-1 bg-black bg-opacity-30`}
          onPress={() => setOpen(false)}
        />
        <View
          style={tw`absolute self-end right-0 top-16 bg-white w-80 rounded-xl shadow-xl overflow-hidden`}
        >
          <View
            style={tw`flex-row items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50`}
          >
            <Text style={tw`font-semibold text-base`}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={tw`bg-gray-200 rounded px-2 py-0.5`}>
                <Text style={tw`text-xs font-semibold text-gray-800`}>
                  {unreadCount} new
                </Text>
              </View>
            )}
          </View>
          <View style={tw`h-100`}>
            <ScrollView contentContainerStyle={tw`flex-grow`}>
              {notifications === undefined ? (
                <View style={tw`space-y-2 p-4`}>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </View>
              ) : notifications.length === 0 ? (
                <View
                  style={tw`flex flex-col items-center justify-center py-12 px-4`}
                >
                  <Bell size={48} style={tw`mb-3 text-gray-400`} />
                  <Text style={tw`text-sm text-gray-500`}>
                    No notifications yet
                  </Text>
                  <Text style={tw`text-xs text-gray-400 mt-1`}>
                    You'll see updates about your posts here
                  </Text>
                </View>
              ) : (
                <View>
                  {notifications.map((notification) => {
                    const isFollowUp =
                      notification.type === "vehicle_recovery_followup" ||
                      notification.type === "deer_recovery_followup";
                    return (
                      <View
                        key={notification._id}
                        style={[
                          tw`px-4 py-3`,
                          !notification.isRead ? tw`bg-blue-50` : null,
                          tw`border-b border-gray-100`,
                        ]}
                      >
                        <View style={tw`flex-row items-start gap-3`}>
                          <View style={tw`mt-1`}>
                            {getNotificationIcon(notification.type)}
                          </View>
                          <View style={tw`flex-1 min-w-0`}>
                            <View
                              style={tw`flex-row items-start justify-between gap-2`}
                            >
                              <Text
                                numberOfLines={1}
                                style={tw`text-sm font-medium flex-1`}
                              >
                                {notification.title}
                              </Text>
                              {!notification.isRead && !isFollowUp && (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleMarkAsRead(notification._id)
                                  }
                                  style={tw`h-6 w-6 items-center justify-center ml-1`}
                                >
                                  <Check size={14} style={tw`text-gray-600`} />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text
                              numberOfLines={2}
                              style={tw`text-xs text-gray-500 mt-1`}
                            >
                              {notification.message}
                            </Text>
                            {isFollowUp && notification.relatedId && (
                              <View style={tw`flex flex-col gap-2 mt-3`}>
                                <View style={tw`flex-row gap-2`}>
                                  <TouchableOpacity
                                    style={[
                                      tw`flex-1 h-7 rounded bg-white border border-gray-300 justify-center items-center`,
                                      processingId === notification.relatedId
                                        ? tw`opacity-50`
                                        : null,
                                    ]}
                                    disabled={
                                      processingId === notification.relatedId
                                    }
                                    onPress={() =>
                                      handleFollowUpAction(
                                        notification.type,
                                        notification.relatedId!,
                                        "still_waiting"
                                      )
                                    }
                                  >
                                    {processingId === notification.relatedId ? (
                                      <ActivityIndicator
                                        size={14}
                                        color="#888"
                                      />
                                    ) : (
                                      <Text style={tw`text-xs text-gray-700`}>
                                        Still Waiting
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[
                                      tw`flex-1 h-7 rounded bg-white border border-gray-300 justify-center items-center`,
                                      processingId === notification.relatedId
                                        ? tw`opacity-50`
                                        : null,
                                    ]}
                                    disabled={
                                      processingId === notification.relatedId
                                    }
                                    onPress={() =>
                                      handleFollowUpAction(
                                        notification.type,
                                        notification.relatedId!,
                                        "in_progress"
                                      )
                                    }
                                  >
                                    {processingId === notification.relatedId ? (
                                      <ActivityIndicator
                                        size={14}
                                        color="#888"
                                      />
                                    ) : (
                                      <Text style={tw`text-xs text-gray-700`}>
                                        In Progress
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                  style={[
                                    tw`w-full h-7 rounded bg-blue-700 justify-center items-center mt-1`,
                                    processingId === notification.relatedId
                                      ? tw`opacity-50`
                                      : null,
                                  ]}
                                  disabled={
                                    processingId === notification.relatedId
                                  }
                                  onPress={() =>
                                    handleFollowUpAction(
                                      notification.type,
                                      notification.relatedId!,
                                      "close"
                                    )
                                  }
                                >
                                  {processingId === notification.relatedId ? (
                                    <ActivityIndicator size={14} color="#fff" />
                                  ) : (
                                    <Text
                                      style={tw`text-xs text-white font-bold`}
                                    >
                                      Close Request
                                    </Text>
                                  )}
                                </TouchableOpacity>
                              </View>
                            )}
                            <Text style={tw`text-xs text-gray-400 mt-2`}>
                              {format(
                                new Date(notification.createdAt),
                                "MMM d, h:mm a"
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
          {notifications && notifications.length > 0 && (
            <View style={tw`border-t border-gray-200 px-4 py-2 bg-gray-100`}>
              <TouchableOpacity
                disabled={notifications.every((n) => n.isRead)}
                style={tw`flex-row items-center justify-center w-full py-2 rounded ${notifications.every((n) => n.isRead) ? "opacity-50" : "bg-gray-200"}`}
                onPress={async () => {
                  // Mark all as read
                  const unread = notifications.filter((n) => !n.isRead);
                  for (const n of unread) {
                    await handleMarkAsRead(n._id);
                  }
                }}
              >
                <CheckCheck size={14} style={tw`mr-2 text-gray-700`} />
                <Text style={tw`text-xs font-semibold text-gray-700`}>
                  Mark all as read
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
