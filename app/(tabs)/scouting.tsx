import CreateTripDialog from "@/components/scouting/CreateTripDialog";
import TripDetailsDialog from "@/components/scouting/TripDetailsDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  Binoculars,
  Calendar,
  ChevronRight,
  MapPin,
  Plus,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ScoutingTripsPanelProps {
  onViewProfile?: (userId: Id<"users">) => void;
}

export default function ScoutingTripsPanel({
  onViewProfile,
}: ScoutingTripsPanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const myTrips = useQuery(api.scoutingTrips.getMyTrips);
  const availableTrips = useQuery(api.scoutingTrips.getAvailableTrips, {});
  const participatingTrips = useQuery(
    api.scoutingTrips.getMyParticipatingTrips
  );

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

  const [activeTab, setActiveTab] = useState<
    "available" | "my-trips" | "joined"
  >("available");

  const TripCard = ({
    trip,
    showCreator = false,
  }: {
    trip: {
      _id: string;
      title: string;
      locationName: string;
      startDate: number;
      endDate: number;
      activityType: string;
      gameType?: string;
      participantCount: number;
      maxParticipants?: number;
      creatorName?: string;
      status: string;
    };
    showCreator?: boolean;
  }) => (
    <TouchableOpacity
      className="p-4 bg-gray-800 border border-gray-700 rounded-lg mb-3"
      onPress={() => setSelectedTripId(trip._id)}
      activeOpacity={0.7}
    >
      <View className="space-y-3">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1" style={{ minWidth: 0 }}>
            <Text className="font-semibold text-white" numberOfLines={1}>
              {trip.title}
            </Text>
            {showCreator && trip.creatorName && (
              <Text className="text-xs text-gray-400 mt-1">
                by {trip.creatorName.split(" ")[0]}
              </Text>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            <View
              className={`${getActivityBadgeColor(trip.activityType)} px-2 py-0.5 rounded-full`}
            >
              <Text className="text-white text-xs font-semibold capitalize">
                {trip.activityType}
              </Text>
            </View>
            {trip.status === "cancelled" && (
              <Badge type="destructive">Cancelled</Badge>
            )}
          </View>
        </View>

        {trip.gameType && (
          <Text className="text-sm text-gray-400 capitalize">
            {trip.gameType}
          </Text>
        )}

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <MapPin size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-400" numberOfLines={1}>
              {trip.locationName}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Calendar size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-400">
              {format(trip.startDate, "MMM d")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Users size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-400">
              {trip.participantCount}
              {trip.maxParticipants && `/${trip.maxParticipants}`}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-end mt-2">
          <Button type="ghost" onPress={() => setSelectedTripId(trip._id)}>
            <View className="flex-row items-center gap-1">
              <Text className="text-white text-sm">View Details</Text>
              <ChevronRight size={16} color="#fff" />
            </View>
          </Button>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === "available") {
      if (!availableTrips) {
        return (
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">Loading trips...</Text>
          </View>
        );
      }
      if (availableTrips.length === 0) {
        return (
          <View className="py-8 items-center">
            <Binoculars size={48} color="#9ca3af" style={{ opacity: 0.5 }} />
            <Text className="text-sm text-gray-400 mt-2">
              No available trips
            </Text>
            <Text className="text-xs text-gray-500 mt-2 text-center px-4">
              Create your own trip to find scouting partners
            </Text>
          </View>
        );
      }
      return (
        <View className="p-4 pb-6">
          {availableTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} showCreator />
          ))}
        </View>
      );
    }

    if (activeTab === "my-trips") {
      if (!myTrips) {
        return (
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">Loading trips...</Text>
          </View>
        );
      }
      if (myTrips.length === 0) {
        return (
          <View className="py-8 items-center">
            <Binoculars size={48} color="#9ca3af" style={{ opacity: 0.5 }} />
            <Text className="text-sm text-gray-400 mt-2">No trips yet</Text>
            <Text className="text-xs text-gray-500 mt-2 text-center px-4">
              Create a trip to find scouting partners
            </Text>
            <Button
              type="primary"
              onPress={() => setShowCreateDialog(true)}
              className="mt-4"
            >
              <View className="flex-row items-center gap-1">
                <Plus size={16} color="#fff" />
                <Text className="text-white font-semibold">Create Trip</Text>
              </View>
            </Button>
          </View>
        );
      }
      return (
        <View className="p-4 pb-6">
          {myTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </View>
      );
    }

    if (activeTab === "joined") {
      if (!participatingTrips) {
        return (
          <View className="py-8 items-center">
            <Text className="text-sm text-gray-400">Loading trips...</Text>
          </View>
        );
      }
      if (participatingTrips.length === 0) {
        return (
          <View className="py-8 items-center">
            <Binoculars size={48} color="#9ca3af" style={{ opacity: 0.5 }} />
            <Text className="text-sm text-gray-400 mt-2">No joined trips</Text>
            <Text className="text-xs text-gray-500 mt-2 text-center px-4">
              Browse available trips to join others
            </Text>
          </View>
        );
      }
      return (
        <View className="p-4 pb-6">
          {participatingTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} showCreator />
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
            <Binoculars size={20} color="#f97316" />
            <Text className="text-lg font-semibold text-white">
              Scouting Trips
            </Text>
          </View>
          <Button type="primary" onPress={() => setShowCreateDialog(true)}>
            <View className="flex-row items-center gap-1">
              <Plus size={16} color="#000" />
              <Text className="font-semibold">New Trip</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Tabs */}
      <View className="mx-4 mt-4 flex-row border-b border-gray-800">
        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "available"
              ? "border-orange-500"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("available")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "available" ? "text-orange-500" : "text-gray-400"
              }`}
            >
              Available
            </Text>
            {availableTrips && availableTrips.length > 0 && (
              <Badge type="secondary">{availableTrips.length}</Badge>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "my-trips"
              ? "border-orange-500"
              : "border-transparent"
          }`}
          onPress={() => setActiveTab("my-trips")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "my-trips" ? "text-orange-500" : "text-gray-400"
              }`}
            >
              My Trips
            </Text>
            {myTrips && myTrips.length > 0 && (
              <Badge type="secondary">{myTrips.length}</Badge>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "joined" ? "border-orange-500" : "border-transparent"
          }`}
          onPress={() => setActiveTab("joined")}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-sm font-semibold ${
                activeTab === "joined" ? "text-orange-500" : "text-gray-400"
              }`}
            >
              Joined
            </Text>
            {participatingTrips && participatingTrips.length > 0 && (
              <Badge type="secondary">{participatingTrips.length}</Badge>
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

      <CreateTripDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedTripId && (
        <TripDetailsDialog
          tripId={selectedTripId}
          open={!!selectedTripId}
          onOpenChange={(open) => !open && setSelectedTripId(null)}
        />
      )}
    </View>
  );
}
