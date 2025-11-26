import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Globe,
  Lock,
  MapPin,
  UserMinus,
  UserPlus,
  Users,
  Users as UsersIcon,
  X,
} from "lucide-react-native";
import { Alert, ScrollView, Text, View } from "react-native";

interface TripDetailsDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TripDetailsDialog({
  tripId,
  open,
  onOpenChange,
}: TripDetailsDialogProps) {
  const tripDetails = useQuery(
    api.scoutingTrips.getTripDetails,
    tripId ? { tripId: tripId as never } : "skip"
  );
  const joinTrip = useMutation(api.scoutingTrips.joinTrip);
  const leaveTrip = useMutation(api.scoutingTrips.leaveTrip);
  const cancelTrip = useMutation(api.scoutingTrips.cancelTrip);

  const handleJoin = async () => {
    try {
      await joinTrip({ tripId: tripId as never });
      showToast("Successfully joined trip!");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        showToast(message);
      } else {
        showToast("Failed to join trip");
      }
    }
  };

  const handleLeave = async () => {
    try {
      await leaveTrip({ tripId: tripId as never });
      showToast("Left trip");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        showToast(message);
      } else {
        showToast("Failed to leave trip");
      }
    }
  };

  const handleCancel = async () => {
    Alert.alert("Cancel Trip", "Are you sure you want to cancel this trip?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelTrip({ tripId: tripId as never });
            showToast("Trip cancelled");
            onOpenChange(false);
          } catch (error) {
            if (error instanceof ConvexError) {
              const { message } = error.data as {
                code: string;
                message: string;
              };
              showToast(message);
            } else {
              showToast("Failed to cancel trip");
            }
          }
        },
      },
    ]);
  };

  const getActivityBadgeColor = (activityType: string) => {
    switch (activityType) {
      case "scouting":
        return "bg-blue-500";
      case "hunting":
        return "bg-red-500";
      case "camping":
        return "bg-green-500";
      case "hiking":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "public":
        return <Globe size={16} color="#9ca3af" />;
      case "friends_only":
        return <UsersIcon size={16} color="#9ca3af" />;
      case "private":
        return <Lock size={16} color="#9ca3af" />;
      default:
        return null;
    }
  };

  if (!tripDetails) {
    return (
      <Dialog visible={open} onClose={() => onOpenChange(false)}>
        <View className="py-8 items-center">
          <Text className="text-gray-400">Loading trip details...</Text>
        </View>
      </Dialog>
    );
  }

  const isCreator = tripDetails.userRole === "creator";
  const isFull =
    tripDetails.maxParticipants &&
    tripDetails.participants.length >= tripDetails.maxParticipants;

  return (
    <Dialog visible={open} onClose={() => onOpenChange(false)}>
      <ScrollView className="max-h-[90vh]" showsVerticalScrollIndicator={true}>
        <View className="space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Text className="text-xl font-bold text-white">
              {tripDetails.title}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              <View
                className={`${getActivityBadgeColor(tripDetails.activityType)} px-2 py-0.5 rounded-full`}
              >
                <Text className="text-white text-xs font-semibold capitalize">
                  {tripDetails.activityType}
                </Text>
              </View>
              {tripDetails.gameType && (
                <Badge type="default">{tripDetails.gameType}</Badge>
              )}
              {tripDetails.status === "cancelled" && (
                <Badge type="destructive">Cancelled</Badge>
              )}
              <View className="flex-row items-center gap-1">
                {getPrivacyIcon(tripDetails.privacy)}
                <Text className="text-sm text-gray-400 capitalize">
                  {tripDetails.privacy.replace("_", " ")}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {tripDetails.description && (
            <View>
              <Text className="text-sm text-gray-400">
                {tripDetails.description}
              </Text>
            </View>
          )}

          {/* Key Details */}
          <View className="flex-row gap-4">
            <View className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-orange-500/10 rounded-lg">
                  <Calendar size={20} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-400">Dates</Text>
                  <Text className="font-medium text-white">
                    {format(tripDetails.startDate, "MMM d")} -{" "}
                    {format(tripDetails.endDate, "MMM d, yyyy")}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-orange-500/10 rounded-lg">
                  <MapPin size={20} color="#f97316" />
                </View>
                <View className="flex-1" style={{ minWidth: 0 }}>
                  <Text className="text-xs text-gray-400">Location</Text>
                  <Text className="font-medium text-white" numberOfLines={1}>
                    {tripDetails.locationName}
                  </Text>
                  {tripDetails.state && (
                    <Text className="text-xs text-gray-400">
                      {tripDetails.state}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View className="h-px bg-gray-700" />

          {/* Organizer */}
          <View>
            <Text className="text-sm font-semibold text-white mb-2">
              Organized by
            </Text>
            <View className="p-3 bg-gray-800 border border-gray-700 rounded-lg">
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <Text className="font-medium text-white">
                    {tripDetails.creatorName?.split(" ")[0]}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Users size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">
                Participants ({tripDetails.participants.length}
                {tripDetails.maxParticipants &&
                  `/${tripDetails.maxParticipants}`}
                )
              </Text>
            </View>
            <View className="space-y-2">
              {tripDetails.participants.map((participant) => (
                <View
                  key={participant._id}
                  className="p-3 bg-gray-800 border border-gray-700 rounded-lg"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-medium text-white">
                        {participant.name?.split(" ")[0]}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        {participant.role === "creator" && (
                          <Badge type="secondary">Organizer</Badge>
                        )}
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color="#9ca3af" />
                          <Text className="text-xs text-gray-400">
                            Joined {format(participant.joinedAt, "MMM d")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2">
            {tripDetails.status === "upcoming" && (
              <>
                {!tripDetails.isParticipant && !isFull && (
                  <Button onPress={handleJoin} className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <UserPlus size={16} color="#fff" />
                      <Text className="text-white font-semibold">
                        Join Trip
                      </Text>
                    </View>
                  </Button>
                )}

                {!tripDetails.isParticipant && isFull && (
                  <Button disabled className="flex-1">
                    <Text className="text-white font-semibold">Trip Full</Text>
                  </Button>
                )}

                {tripDetails.isParticipant && !isCreator && (
                  <Button
                    type="outline"
                    onPress={handleLeave}
                    className="flex-1"
                  >
                    <View className="flex-row items-center gap-2">
                      <UserMinus size={16} color="#fff" />
                      <Text className="text-white font-semibold">
                        Leave Trip
                      </Text>
                    </View>
                  </Button>
                )}

                {isCreator && (
                  <Button
                    type="danger"
                    onPress={handleCancel}
                    className="flex-1"
                  >
                    <View className="flex-row items-center gap-2">
                      <X size={16} color="#ef4444" />
                      <Text className="text-red-400 font-semibold">
                        Cancel Trip
                      </Text>
                    </View>
                  </Button>
                )}
              </>
            )}

            {tripDetails.status === "cancelled" && (
              <View className="w-full items-center py-4">
                <Text className="text-sm text-gray-400">
                  This trip has been cancelled
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Dialog>
  );
}
