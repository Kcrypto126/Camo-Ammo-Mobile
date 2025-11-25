import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { api } from "@/convex/_generated/api.js";
import { useMutation, useQuery } from "convex/react";
import {
  Clock,
  MapPin,
  Navigation as NavigationIcon,
  Play,
  Route,
  Square,
  TrendingUp,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";

interface TrackingControlProps {
  onWaypointAdd: (lat: number, lng: number) => void;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function TrackingControl({
  onWaypointAdd,
  onLocationUpdate,
}: TrackingControlProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
    altitude?: number;
    accuracy?: number;
  } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [trackStats, setTrackStats] = useState({
    distance: 0,
    duration: 0,
    points: 0,
  });

  const startTrack = useMutation(api.tracks.startTrack);
  const addTrackPoint = useMutation(api.tracks.addTrackPoint);
  const stopTrack = useMutation(api.tracks.stopTrack);
  const activeTrack = useQuery(api.tracks.getActiveTrack);

  const handleStartTracking = async () => {
    try {
      const trackId = await startTrack({
        name: `Track ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      });

      setIsTracking(true);
      showToast("Tracking started");

      // Start watching position
      if (
        (Platform.OS === "web" &&
          typeof navigator !== "undefined" &&
          navigator.geolocation) ||
        global?.navigator?.geolocation
      ) {
        const geolocation =
          Platform.OS === "web"
            ? navigator.geolocation
            : global.navigator.geolocation;

        const id = geolocation.watchPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              altitude: position.coords.altitude ?? undefined,
              accuracy: position.coords.accuracy,
            };

            setCurrentPosition(coords);

            // Notify parent of location update
            if (onLocationUpdate) {
              onLocationUpdate(coords.lat, coords.lng);
            }

            // Add point to track
            try {
              await addTrackPoint({
                trackId,
                ...coords,
              });
            } catch (error) {
              console.error("Failed to add track point:", error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            showToast("Failed to get location");
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
        setWatchId(id as number);
      }
    } catch (error) {
      showToast("Failed to start tracking");
      console.error(error);
    }
  };

  const handleStopTracking = async () => {
    if (!activeTrack) return;

    try {
      await stopTrack({ trackId: activeTrack._id });

      if (watchId !== null) {
        const geolocation =
          Platform.OS === "web"
            ? navigator.geolocation
            : global.navigator.geolocation;
        if (geolocation) {
          geolocation.clearWatch(watchId);
        }
        setWatchId(null);
      }

      setIsTracking(false);
      showToast("Track saved");
      setTrackStats({ distance: 0, duration: 0, points: 0 });
    } catch (error) {
      showToast("Failed to stop tracking");
      console.error(error);
    }
  };

  const handleAddWaypoint = () => {
    if (currentPosition) {
      onWaypointAdd(currentPosition.lat, currentPosition.lng);
    } else {
      showToast("Current position not available");
    }
  };

  // Update track stats
  useEffect(() => {
    if (activeTrack) {
      const duration = (Date.now() - activeTrack.startTime) / 1000;
      setTrackStats({
        distance: activeTrack.distance,
        duration,
        points: activeTrack.coordinates.length,
      });
    }
  }, [activeTrack]);

  // Sync isTracking state with activeTrack
  useEffect(() => {
    if (activeTrack && !isTracking) {
      setIsTracking(true);
    } else if (!activeTrack && isTracking) {
      setIsTracking(false);
      if (watchId !== null) {
        const geolocation =
          Platform.OS === "web"
            ? navigator.geolocation
            : global.navigator.geolocation;
        if (geolocation) {
          geolocation.clearWatch(watchId);
        }
        setWatchId(null);
      }
    }
  }, [activeTrack, isTracking, watchId]);

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return miles < 0.1
      ? `${Math.round(meters * 3.28084)} ft`
      : `${miles.toFixed(2)} mi`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <View className="absolute bottom-20 left-4 z-[1000] bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 space-y-3 w-64">
      <View className="flex-row items-center justify-between">
        <Text className="font-semibold text-sm text-white">GPS Tracker</Text>
        <View
          className={`w-2 h-2 rounded-full ${
            isTracking ? "bg-red-500" : "bg-gray-600"
          }`}
        />
      </View>

      {isTracking && (
        <View className="space-y-2 text-sm border-t border-gray-700 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Route size={16} color="#9ca3af" />
              <Text className="text-gray-400">Distance</Text>
            </View>
            <Text className="font-bold text-white">
              {formatDistance(trackStats.distance)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#9ca3af" />
              <Text className="text-gray-400">Duration</Text>
            </View>
            <Text className="font-bold text-white">
              {formatDuration(trackStats.duration)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TrendingUp size={16} color="#9ca3af" />
              <Text className="text-gray-400">Points</Text>
            </View>
            <Text className="font-bold text-white">{trackStats.points}</Text>
          </View>
        </View>
      )}

      <View className="space-y-2 pt-2 border-t border-gray-700">
        {!isTracking ? (
          <Button
            onPress={handleStartTracking}
            className="w-full"
            type="primary"
          >
            <Play size={16} color="#fff" />
            <Text className="text-white ml-2">Start Tracking</Text>
          </Button>
        ) : (
          <>
            <Button
              onPress={handleStopTracking}
              type="danger"
              className="w-full"
            >
              <Square size={16} color="#fff" />
              <Text className="text-white ml-2">Stop & Save Track</Text>
            </Button>
            <Button
              onPress={handleAddWaypoint}
              type="outline"
              className="w-full"
              disabled={!currentPosition}
            >
              <MapPin size={16} color="#fff" />
              <Text className="text-white ml-2">Drop Waypoint</Text>
            </Button>
          </>
        )}
      </View>

      {currentPosition && (
        <View className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          <View className="flex-row items-center gap-1">
            <NavigationIcon size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-400">
              {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
            </Text>
          </View>
          {currentPosition.accuracy && (
            <Text className="text-xs text-gray-400 mt-1">
              Accuracy: ±{Math.round(currentPosition.accuracy)}m
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
