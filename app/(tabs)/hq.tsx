import { api } from "@/convex/_generated/api.js";
import { useAction, useMutation, useQuery } from "convex/react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SunCalc from "suncalc";

import AddWaypointDialog from "@/components/tracking/AddWaypointDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NotificationBell } from "@/components/ui/notification-bell";
import { Select } from "@/components/ui/Select";
import { Skeleton, WeatherSkeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { showToast } from "@/components/ui/Toast";
import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Cloud,
  Compass,
  Droplets,
  Eye,
  FileText,
  Home,
  MapPin,
  Plus,
  Route,
  Sunrise,
  Sunset,
  Target,
  Thermometer,
  TrendingUp,
  Trophy,
  Wind,
  XCircle,
} from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import tw from "twrnc"; // still for e.g. icon margins

const SPECIES_OPTIONS = [
  "Deer",
  "Turkey",
  "Elk",
  "Duck",
  "Goose",
  "Rabbit",
  "Squirrel",
  "Bear",
  "Hog",
  "Other",
];

const METHOD_OPTIONS = ["Rifle", "Bow", "Shotgun", "Muzzleloader", "Other"];

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  windDirection: number;
  location: string;
  country: string;
}

interface ForecastData {
  forecast: Array<{
    timestamp: number;
    precipitationProbability: number;
  }>;
}

interface SolunarData {
  major1Start: string;
  major1Stop: string;
  major2Start: string;
  major2Stop: string;
  minor1Start: string;
  minor1Stop: string;
  minor2Start: string;
  minor2Stop: string;
  moonPhase: string;
  dayRating: number;
}

interface Location {
  lat: number;
  lng: number;
}

interface MyHuntPageProps {
  onViewFullMap: () => void;
  onStartTracking: () => void;
  onEmergency: () => void;
  userRole?: string;
  onNavigateToForumModeration?: () => void;
  onNavigateToOpenTickets?: () => void;
  onNavigateToPendingPosts?: () => void;
  onNavigateToReportedPosts?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MyHuntPage({
  onViewFullMap,
  onStartTracking,
  onEmergency,
  userRole,
  onNavigateToForumModeration,
  onNavigateToOpenTickets,
  onNavigateToPendingPosts,
  onNavigateToReportedPosts,
  activeTab,
  onTabChange,
}: MyHuntPageProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [waypointDialogOpen, setWaypointDialogOpen] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [solunarData, setSolunarData] = useState<SolunarData | null>(null);
  const [isLoadingSolunar, setIsLoadingSolunar] = useState(false);
  const [newHunt, setNewHunt] = useState({
    title: "",
    locationName: "",
    species: "",
    method: "",
    notes: "",
  });
  const [endHuntData, setEndHuntData] = useState({
    successful: false,
    harvested: 0,
    notes: "",
  });

  const hunts = useQuery(api.hunts.getMyHunts);
  const activeHunt = useQuery(api.hunts.getActiveHunt);
  const stats = useQuery(api.hunts.getHuntStats);

  const isAdmin = userRole === "owner" || userRole === "admin";
  const pendingPosts = useQuery(
    api.forums.getPendingPosts,
    isAdmin ? {} : "skip"
  );
  const reportedPosts = useQuery(
    api.forums.getReportedPosts,
    isAdmin ? {} : "skip"
  );
  const openTickets = useQuery(
    api.support.getAllTickets,
    isAdmin ? { status: "open" } : "skip"
  );

  const startHunt = useMutation(api.hunts.startHunt);
  const endHunt = useMutation(api.hunts.endHunt);
  const getCurrentWeather = useAction(api.weather.getCurrentWeather);
  const getForecast = useAction(api.weather.getForecast);
  const getSolunarTimes = useAction(api.solunar.getSolunarTimes);

  const loadWeatherData = useCallback(
    async (lat: number, lng: number) => {
      setIsLoadingWeather(true);
      try {
        const [weatherData, forecastData] = await Promise.all([
          getCurrentWeather({ lat, lng, units: "imperial" }),
          getForecast({ lat, lng, units: "imperial" }),
        ]);
        setWeather(weatherData);
        setForecast(forecastData);
      } catch (error) {
        showToast("Failed to load weather data");
        console.error("Failed to load weather:", error);
      } finally {
        setIsLoadingWeather(false);
      }
    },
    [getCurrentWeather, getForecast]
  );

  const loadSolunarData = useCallback(
    async (lat: number, lng: number) => {
      setIsLoadingSolunar(true);
      try {
        const solunarResult = await getSolunarTimes({
          latitude: lat,
          longitude: lng,
        });
        setSolunarData(solunarResult);
      } catch (error) {
        // Silently fail
      } finally {
        setIsLoadingSolunar(false);
      }
    },
    [getSolunarTimes]
  );

  useEffect(() => {
    const defaultLocation = { lat: 39.0997, lng: -94.5786 };
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let hasLoaded = false;

    const loadWithDefaultLocation = () => {
      if (hasLoaded) return; // Prevent multiple calls
      hasLoaded = true;
      if (timeoutId) clearTimeout(timeoutId);
      console.log("[HQ] Using default location:", defaultLocation);
      setLocation(defaultLocation);
      loadWeatherData(defaultLocation.lat, defaultLocation.lng);
      loadSolunarData(defaultLocation.lat, defaultLocation.lng);
    };

    const handleGeolocationSuccess = (position: GeolocationPosition) => {
      if (hasLoaded) return; // Prevent multiple calls
      hasLoaded = true;
      if (timeoutId) clearTimeout(timeoutId);
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log("[HQ] Geolocation success:", coords);
      setLocation(coords);
      loadWeatherData(coords.lat, coords.lng);
      loadSolunarData(coords.lat, coords.lng);
    };

    const handleGeolocationError = (error: GeolocationPositionError) => {
      console.error("[HQ] Geolocation error:", error.code, error.message);
      console.log("[HQ] Falling back to default location");
      loadWithDefaultLocation();
    };

    // Set a timeout to ensure we always load data, even if geolocation hangs
    timeoutId = setTimeout(() => {
      if (!hasLoaded) {
        console.log("[HQ] Geolocation timeout, using default location");
        loadWithDefaultLocation();
      }
    }, 8000); // 8 second timeout

    // Try web navigator.geolocation first
    if (
      Platform.OS === "web" &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      console.log("[HQ] Using web navigator.geolocation");
      navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
      );
    }
    // Try global navigator for React Native
    else if (global?.navigator?.geolocation) {
      console.log("[HQ] Using global.navigator.geolocation");
      global.navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
      );
    }
    // Fallback to default location if geolocation is not available
    else {
      console.log("[HQ] Geolocation not available, using default location");
      loadWithDefaultLocation();
    }

    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loadWeatherData, loadSolunarData]);

  const getWindDirection = (degrees: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getFloridaHuntZone = (lat: number, lng: number) => {
    if (lat > 30.2 && lng < -85) {
      return { zone: "Northwest Zone A", description: "Panhandle Region" };
    }
    if (lat > 29.5 && lng >= -85 && lng < -82.5) {
      return { zone: "North Central Zone B", description: "North Central" };
    }
    if (lat > 29.5 && lng >= -82.5) {
      return { zone: "Northeast Zone C", description: "Northeast Coast" };
    }
    if (lat >= 27.5 && lat <= 29.5 && lng >= -82.5 && lng < -80.5) {
      return { zone: "Central Zone D", description: "Central Region" };
    }
    if (lat >= 26 && lat <= 29 && lng < -81.5) {
      return { zone: "Southwest Zone E", description: "Gulf Coast" };
    }
    if (lat >= 26 && lng >= -80.5) {
      return { zone: "Southeast Zone F", description: "Atlantic Coast" };
    }
    if (lat < 26.5) {
      return { zone: "South Zone G", description: "Everglades Region" };
    }
    return { zone: "Florida Zone", description: "Statewide" };
  };

  const rainChance = forecast?.forecast?.[0]?.precipitationProbability ?? 0;
  const huntZone = location
    ? getFloridaHuntZone(location.lat, location.lng)
    : null;

  const handleAddMarker = () => {
    if (location) {
      setWaypointDialogOpen(true);
    } else {
      showToast("Location not available");
    }
  };

  const handleStartHunt = async () => {
    if (!newHunt.title || !newHunt.locationName || !newHunt.species) {
      showToast("Please fill in all required fields");
      return;
    }

    const defaultLocation = { lat: 39.0997, lng: -94.5786 };

    const startHuntWithLocation = async (lat: number, lng: number) => {
      try {
        await startHunt({
          title: newHunt.title,
          locationName: newHunt.locationName,
          lat,
          lng,
          species: newHunt.species,
          method: newHunt.method || undefined,
          notes: newHunt.notes || undefined,
        });
        showToast("Hunt started! Good luck!");
        setShowStartDialog(false);
        setNewHunt({
          title: "",
          locationName: "",
          species: "",
          method: "",
          notes: "",
        });
      } catch (error) {
        console.error("[handleStartHunt] Error starting hunt:", error);
        showToast("Failed to start hunt");
      }
    };

    // Use existing location if available
    if (location) {
      console.log("[handleStartHunt] Using existing location:", location);
      showToast("Starting hunt...");
      await startHuntWithLocation(location.lat, location.lng);
      return;
    }

    // Try to get current location
    showToast("Starting hunt...");

    const handleGeolocationSuccess = async (position: GeolocationPosition) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log("[handleStartHunt] Geolocation success:", coords);
      await startHuntWithLocation(coords.lat, coords.lng);
    };

    const handleGeolocationError = async (error: GeolocationPositionError) => {
      console.error("[handleStartHunt] Geolocation error:", error);
      console.log("[handleStartHunt] Using default location");
      await startHuntWithLocation(defaultLocation.lat, defaultLocation.lng);
    };

    // Try web navigator.geolocation first
    if (
      Platform.OS === "web" &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    // Try global navigator for React Native
    else if (global?.navigator?.geolocation) {
      global.navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
    // Fallback to default location
    else {
      console.log(
        "[handleStartHunt] Geolocation not available, using default location"
      );
      await startHuntWithLocation(defaultLocation.lat, defaultLocation.lng);
    }
  };

  const handleEndHunt = async () => {
    if (!activeHunt) return;
    try {
      await endHunt({
        huntId: activeHunt._id,
        successful: endHuntData.successful,
        harvested: endHuntData.successful ? endHuntData.harvested : undefined,
        notes: endHuntData.notes || undefined,
      });
      showToast("Hunt completed!");
      setShowEndDialog(false);
      setEndHuntData({ successful: false, harvested: 0, notes: "" });
    } catch (error) {
      showToast("Failed to end hunt");
      console.error(error);
    }
  };

  return (
    <View className="h-full bg-gray-900 flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 64 }}
      >
        {/* Location Header */}
        <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin color="#ff6800" size={20} />
              <View>
                <Text className="text-lg font-bold text-white">
                  {weather?.location || "HQ"}
                </Text>
                {weather?.country && (
                  <Text className="text-xs text-gray-400">
                    {weather.country}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <NotificationBell />
              <Button
                className="ml-2 px-3 py-1"
                onPress={() => setShowStartDialog(true)}
                type="primary"
              >
                <Plus size={16} style={tw`mr-2`} />
                <Text>Start Hunt</Text>
              </Button>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4">
          {/* Admin Alert */}
          {isAdmin &&
            ((pendingPosts && pendingPosts.length > 0) ||
              (reportedPosts && reportedPosts.length > 0) ||
              (openTickets && openTickets.length > 0)) && (
              <View className="border border-amber-500/50 bg-amber-900/20 rounded-xl mb-4">
                <View className="flex-row items-center justify-between p-3">
                  <View className="flex-row items-center gap-2">
                    <AlertTriangle color="#F59E42" size={20} />
                    <Text className="text-base font-bold text-white">
                      Action Needed!
                    </Text>
                  </View>
                  <Badge type="destructive">
                    {(pendingPosts && pendingPosts.length > 0
                      ? pendingPosts.length
                      : 0) +
                      (reportedPosts && reportedPosts.length > 0
                        ? reportedPosts.length
                        : 0) +
                      (openTickets && openTickets.length > 0
                        ? openTickets.length
                        : 0)}
                  </Badge>
                </View>
                <View className="px-3 pb-3">
                  {openTickets && openTickets.length > 0 && (
                    <View className="rounded-lg border border-blue-400/20 bg-gray-800 p-3 mb-2">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-semibold text-sm text-white">
                            Open Support Tickets
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">
                            {openTickets.length}{" "}
                            {openTickets.length === 1 ? "ticket" : "tickets"}{" "}
                            need attention
                          </Text>
                        </View>
                        <Button
                          type="outline"
                          className="ml-2 px-2 py-1"
                          onPress={onNavigateToOpenTickets}
                        >
                          View
                        </Button>
                      </View>
                    </View>
                  )}
                  {pendingPosts && pendingPosts.length > 0 && (
                    <View className="rounded-lg border border-amber-400/20 bg-gray-800 p-3 mb-2">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-semibold text-sm text-white">
                            Forum Posts Pending Approval
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">
                            {pendingPosts.length}{" "}
                            {pendingPosts.length === 1 ? "post" : "posts"}{" "}
                            awaiting review
                          </Text>
                        </View>
                        <Button
                          type="outline"
                          className="ml-2 px-2 py-1"
                          onPress={onNavigateToPendingPosts}
                        >
                          Review
                        </Button>
                      </View>
                    </View>
                  )}
                  {reportedPosts && reportedPosts.length > 0 && (
                    <View className="rounded-lg border border-red-400/20 bg-gray-800 p-3">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-semibold text-sm text-white">
                            Reported Forum Posts
                          </Text>
                          <Text className="text-xs text-gray-400 mt-1">
                            {reportedPosts && reportedPosts.length > 0
                              ? reportedPosts.length
                              : 0}{" "}
                            {reportedPosts && reportedPosts.length > 0
                              ? reportedPosts.length === 1
                                ? "post"
                                : "posts"
                              : "posts"}{" "}
                            reported by members
                          </Text>
                        </View>
                        <Button
                          type="outline"
                          className="ml-2 px-2 py-1"
                          onPress={onNavigateToReportedPosts}
                        >
                          Review
                        </Button>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

          {/* Wind Analysis & Hunt Zone */}
          <View className="flex-row gap-3 mb-3">
            {/* Wind Analysis */}
            <View className="flex-1 rounded-xl bg-indigo-900/30 border border-indigo-700/30 p-3 items-center">
              <Compass color="#6366F1" size={30} style={tw`mb-2`} />
              <Text className="text-xs font-semibold text-gray-300">
                Wind Analysis
              </Text>
              {weather ? (
                <>
                  <View className="flex-row mt-1 items-baseline gap-1">
                    <Text className="text-xl font-bold text-white">
                      {getWindDirection(weather.windDirection)}
                    </Text>
                    <Text className="text-xs text-gray-400 ml-1">
                      {weather.windSpeed} mph
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-gray-400">
                    {weather.windSpeed < 5
                      ? "Calm"
                      : weather.windSpeed < 10
                        ? "Light"
                        : weather.windSpeed < 15
                          ? "Moderate"
                          : "Strong"}
                  </Text>
                </>
              ) : (
                <Skeleton className="mt-2 h-8 w-16" />
              )}
            </View>
            {/* Hunt Zone */}
            <View className="flex-1 rounded-xl bg-green-900/30 border border-green-700/30 p-3 items-center">
              <Target color="#22C55E" size={30} style={tw`mb-2`} />
              <Text className="text-xs font-semibold text-gray-300">
                Hunt Zone
              </Text>
              {huntZone ? (
                <>
                  <Text className="mt-1 text-base font-bold text-white">
                    {huntZone.zone}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-400">
                    {huntZone.description}
                  </Text>
                </>
              ) : (
                <Skeleton className="mt-2 h-8 w-20" />
              )}
            </View>
          </View>

          {/* Weather Cards */}
          <View className="flex-col gap-3 mb-3">
            {isLoadingWeather ? (
              <>
                <WeatherSkeleton />
                <WeatherSkeleton />
                <WeatherSkeleton />
                <WeatherSkeleton />
              </>
            ) : weather ? (
              <>
                <View className="flex-row justify-between gap-3">
                  {/* Temperature */}
                  <View className="flex-1 rounded-xl bg-orange-900/30 border border-orange-700/30">
                    <View className="p-4 flex-row justify-between">
                      <View>
                        <Text className="text-xs text-gray-300">
                          Temperature
                        </Text>
                        <Text className="text-3xl font-bold text-white">
                          {weather.temperature}°F
                        </Text>
                        <Text className="text-xs text-gray-400 capitalize">
                          {weather.description}
                        </Text>
                      </View>
                      <Thermometer size={32} color="#F97316" />
                    </View>
                  </View>

                  {/* Wind */}
                  <View className="flex-1 rounded-xl bg-blue-900/30 border border-blue-700/30">
                    <View className="p-4 flex-row justify-between">
                      <View>
                        <Text className="text-xs text-gray-300">Wind</Text>
                        <Text className="text-3xl font-bold text-white">
                          {weather.windSpeed}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          mph {getWindDirection(weather.windDirection)}
                        </Text>
                      </View>
                      <Wind size={32} color="#3B82F6" />
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between gap-3">
                  {/* Rain Chance */}
                  <View className="flex-1 rounded-xl bg-sky-900/30 border border-sky-700/30">
                    <View className="p-4 flex-row justify-between">
                      <View>
                        <Text className="text-xs text-gray-300">
                          Rain Chance
                        </Text>
                        <Text className="text-3xl font-bold text-white">
                          {rainChance}%
                        </Text>
                        <Text className="text-xs text-gray-400">Next hour</Text>
                      </View>
                      <Droplets size={32} color="#38BDF8" />
                    </View>
                  </View>

                  {/* Humidity */}
                  <View className="flex-1 rounded-xl bg-green-900/30 border border-green-700/30">
                    <View className="p-4 flex-row justify-between">
                      <View>
                        <Text className="text-xs text-gray-300">Humidity</Text>
                        <Text className="text-3xl font-bold text-white">
                          {weather.humidity}%
                        </Text>
                        <Text className="text-xs text-gray-400">
                          Feels {weather.feelsLike}°F
                        </Text>
                      </View>
                      <Cloud size={32} color="#2DD4BF" />
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <Text className="py-8 text-center text-sm text-gray-400 w-full">
                Weather data unavailable
              </Text>
            )}
          </View>

          {/* Sunrise & Sunset */}
          {location &&
            (() => {
              const today = new Date();
              const times = SunCalc.getTimes(today, location.lat, location.lng);
              return (
                <View className="flex-row gap-3 mb-3">
                  {/* Sunrise */}
                  <View className="flex-1 rounded-xl bg-yellow-900/30 border border-yellow-700/30">
                    <View className="p-4 flex-row justify-between">
                      <View>
                        <Text className="text-xs text-gray-300">Sunrise</Text>
                        <Text className="text-2xl font-bold text-white">
                          {format(times.sunrise, "h:mm a")}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {format(today, "MMM d, yyyy")}
                        </Text>
                      </View>
                      <Sunrise size={32} color="#FACC15" />
                    </View>
                  </View>
                  {/* Sunset */}
                  <View className="flex-1 rounded-xl bg-purple-900/30 border border-purple-700/30">
                    <View className="p-4 flex-row justify-between">
                      <View>
                        <Text className="text-xs text-gray-300">Sunset</Text>
                        <Text className="text-2xl font-bold text-white">
                          {format(times.sunset, "h:mm a")}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {format(today, "MMM d, yyyy")}
                        </Text>
                      </View>
                      <Sunset size={32} color="#C026D3" />
                    </View>
                  </View>
                </View>
              );
            })()}

          {/* Best Hunting Times / Solunar */}
          {isLoadingSolunar ? (
            <View className="rounded-xl bg-gray-800 border border-gray-700 mb-4">
              <View className="p-4">
                <Text className="text-base font-bold mb-2 text-white">
                  Best Hunting Times
                </Text>
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-16 w-full" />
              </View>
            </View>
          ) : solunarData ? (
            <View className="rounded-xl bg-orange-900/30 border border-orange-700/30 mb-4">
              <View className="flex-row items-center justify-between p-3">
                <Text className="text-base font-bold text-white">
                  Best Hunting Times
                </Text>
                <Badge type="secondary">{solunarData.moonPhase}</Badge>
              </View>
              <Text className="text-xs text-gray-400 px-3">
                Solunar feeding periods for deer activity
              </Text>
              <View className="px-3 py-2">
                {/* Major Periods */}
                <View className="mb-2">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Target color="#F97316" size={16} />
                    <Text className="text-sm font-semibold text-white">
                      Major (Best)
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <View className="flex-1 border border-orange-500/20 bg-gray-800 rounded-lg p-2">
                      <Text className="text-xs text-gray-400">Morning</Text>
                      <Text className="text-lg font-bold text-orange-500">
                        {solunarData.major1Start} - {solunarData.major1Stop}
                      </Text>
                    </View>
                    <View className="flex-1 border border-orange-500/20 bg-gray-800 rounded-lg p-2">
                      <Text className="text-xs text-gray-400">Evening</Text>
                      <Text className="text-lg font-bold text-orange-500">
                        {solunarData.major2Start} - {solunarData.major2Stop}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Minor Periods */}
                <View className="mb-2">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Clock color="#FDBA74" size={16} />
                    <Text className="text-sm font-semibold text-white">
                      Minor Periods
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <View className="flex-1 border border-amber-500/20 bg-gray-800 rounded-lg p-2">
                      <Text className="text-xs text-gray-400">Period 1</Text>
                      <Text className="text-sm font-bold text-amber-500">
                        {solunarData.minor1Start} - {solunarData.minor1Stop}
                      </Text>
                    </View>
                    <View className="flex-1 border border-amber-500/20 bg-gray-800 rounded-lg p-2">
                      <Text className="text-xs text-gray-400">Period 2</Text>
                      <Text className="text-sm font-bold text-amber-500">
                        {solunarData.minor2Start} - {solunarData.minor2Stop}
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="rounded-lg border border-gray-700 bg-gray-800 p-3">
                  <Text className="text-xs text-gray-400">
                    <Text className="font-bold">Major periods</Text> (2 hrs)
                    show peak deer movement.{" "}
                    <Text className="font-bold">Minor periods</Text> (1 hr) show
                    secondary activity. Times based on moon position and local
                    conditions.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Map Preview */}
          <View className="rounded-xl bg-gray-800 border border-gray-700 mb-4">
            <View className="flex-row items-center justify-between px-4 pt-4">
              <Text className="text-base font-bold text-white">
                Your Location
              </Text>
              <Button
                type="ghost"
                className="px-2 py-1"
                onPress={onViewFullMap}
              >
                <Eye color="#fff" size={16} style={tw`mr-2`} />
                <Text className="text-white">View Map</Text>
              </Button>
            </View>
            <View className="mx-3 mt-3 mb-4 h-48 overflow-hidden rounded-xl bg-gray-700">
              {location ? (
                <MapView
                  style={{ flex: 1, width: "100%", height: "100%" }}
                  initialRegion={{
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                  showsUserLocation={true}
                  showsMyLocationButton={false}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  pointerEvents="none"
                  mapType="hybrid"
                >
                  <Marker
                    coordinate={{
                      latitude: location.lat,
                      longitude: location.lng,
                    }}
                    title="Your Location"
                  />
                </MapView>
              ) : (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator color="#3B82F6" size="large" />
                  <Text className="text-center text-sm text-gray-400 mt-2">
                    Loading location...
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="rounded-xl bg-gray-800 border border-gray-700 mb-4">
            <View className="px-4 pt-4">
              <Text className="text-base font-bold mb-2 text-white">
                Quick Actions
              </Text>
            </View>
            <View className="flex-row flex-wrap pb-4 px-2 gap-3">
              <Button
                className="w-[48%] flex-col py-4 justify-center items-center border border-gray-600 bg-gray-700"
                type="outline"
                onPress={onViewFullMap}
              >
                <Home size={24} color="#fff" />
                <Text className="text-xs mt-2 text-white">Property Info</Text>
              </Button>
              <Button
                className="w-[48%] flex-col py-4 justify-center items-center border border-gray-600 bg-gray-700"
                type="outline"
                onPress={handleAddMarker}
              >
                <Plus size={24} color="#fff" />
                <Text className="text-xs mt-2 text-white">Add Marker</Text>
              </Button>
              <Button
                className="w-[48%] flex-col py-4 justify-center items-center border border-gray-600 bg-gray-700"
                type="outline"
                onPress={onStartTracking}
              >
                <Route size={24} color="#fff" />
                <Text className="text-xs mt-2 text-white">Track Path</Text>
              </Button>
              <Button
                className="w-[48%] flex-col py-4 justify-center items-center border border-gray-600 bg-gray-700"
                type="outline"
                onPress={() => Linking.openURL("https://www.floridamarine.org")}
              >
                <FileText size={24} color="#fff" />
                <Text className="text-xs mt-2 text-white">WMA Brochures</Text>
              </Button>
              <Button
                className="w-full flex-row items-center justify-center py-4 mt-2 border border-red-500 bg-red-100"
                type="ghost"
                onPress={onEmergency}
              >
                <AlertTriangle size={24} color="#DC2626" />
                <Text className="text-xs text-red-700 ml-2">Emergency</Text>
              </Button>
            </View>
          </View>

          {/* Active Hunt Alert */}
          {activeHunt && (
            <View className="rounded-xl border border-green-500/50 bg-green-900/20 mb-4">
              <View className="p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                    <Text className="font-semibold text-green-400">
                      Active Hunt
                    </Text>
                  </View>
                  <Text className="ml-3 text-sm text-gray-300">
                    {activeHunt.title}
                  </Text>
                </View>
                <View className="flex-row flex-wrap items-center gap-4 text-xs text-gray-400">
                  <View className="flex-row items-center mr-2">
                    <Target size={14} color="#9ca3af" />
                    <Text className="ml-1 text-xs text-gray-400">
                      {activeHunt.species}
                    </Text>
                  </View>
                  <View className="flex-row items-center mr-2">
                    <Clock size={14} color="#9ca3af" />
                    <Text className="ml-1 text-xs text-gray-400">
                      {format(activeHunt.startTime, "h:mm a")}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={14} color="#9ca3af" />
                    <Text className="ml-1 text-xs text-gray-400">
                      {activeHunt.locationName}
                    </Text>
                  </View>
                </View>
                <Button
                  className="mt-3 w-full"
                  type="outline"
                  onPress={() => setShowEndDialog(true)}
                >
                  End Hunt
                </Button>
              </View>
            </View>
          )}

          {/* Stats Cards */}
          {stats ? (
            <View className="flex-row flex-wrap gap-3 mb-4">
              {/* Total Hunts */}
              <View className="w-[48%] mb-3 rounded-xl bg-gray-800 border border-gray-700">
                <View className="p-4 flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-400">Total Hunts</Text>
                    <Text className="text-3xl font-bold text-white">
                      {stats.totalHunts}
                    </Text>
                  </View>
                  <Calendar size={30} color="#f97316" />
                </View>
              </View>
              {/* Success Rate */}
              <View className="w-[48%] mb-3 rounded-xl bg-gray-800 border border-gray-700">
                <View className="p-4 flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-400">Success Rate</Text>
                    <Text className="text-3xl font-bold text-white">
                      {stats.successRate}%
                    </Text>
                  </View>
                  <TrendingUp size={30} color="#22C55E" />
                </View>
              </View>
              {/* Successful */}
              <View className="w-[48%] mb-3 rounded-xl bg-gray-800 border border-gray-700">
                <View className="p-4 flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-400">Successful</Text>
                    <Text className="text-3xl font-bold text-white">
                      {stats.successfulHunts}
                    </Text>
                  </View>
                  <Trophy size={30} color="#F59E42" />
                </View>
              </View>
              {/* Harvested */}
              <View className="w-[48%] mb-3 rounded-xl bg-gray-800 border border-gray-700">
                <View className="p-4 flex-row justify-between">
                  <View>
                    <Text className="text-xs text-gray-400">Harvested</Text>
                    <Text className="text-3xl font-bold text-white">
                      {stats.totalHarvested}
                    </Text>
                  </View>
                  <Target size={30} color="#EF4444" />
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-[48%] h-24 mb-2" />
              ))}
            </View>
          )}

          {/* Recent Hunts */}
          <View className="rounded-xl bg-gray-800 border border-gray-700">
            <View className="px-4 pt-4">
              <Text className="text-base font-bold mb-2 text-white">
                Recent Hunts
              </Text>
            </View>
            <ScrollView className="flex-1 px-4 h-80">
              {hunts === undefined ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 mb-3" />
                ))
              ) : hunts.length === 0 ? (
                <Text className="py-12 text-center text-sm text-gray-400">
                  No hunts yet. Start your first hunt!
                </Text>
              ) : (
                hunts.slice(0, 10).map((hunt) => (
                  <TouchableOpacity
                    key={hunt._id}
                    className="p-4 border-b border-gray-700"
                  >
                    <View>
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="font-semibold text-white">
                          {hunt.title}
                        </Text>
                        {hunt.status === "completed" && (
                          <Badge
                            type={hunt.successful ? "success" : "secondary"}
                          >
                            {hunt.successful ? (
                              <CheckCircle2
                                size={12}
                                color="#22C55E"
                                style={tw`mr-1`}
                              />
                            ) : (
                              <XCircle
                                size={12}
                                color="#EF4444"
                                style={tw`mr-1`}
                              />
                            )}
                            {hunt.successful ? "Success" : "No Harvest"}
                          </Badge>
                        )}
                      </View>
                      <View className="flex-row flex-wrap items-center gap-3 text-xs text-gray-400">
                        <View className="flex-row items-center">
                          <Target size={12} color="#9ca3af" />
                          <Text className="ml-1 text-xs text-gray-400">
                            {hunt.species}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Calendar size={12} color="#9ca3af" />
                          <Text className="ml-1 text-xs text-gray-400">
                            {format(hunt.date, "MMM d, yyyy")}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <MapPin size={12} color="#9ca3af" />
                          <Text className="ml-1 text-xs text-gray-400">
                            {hunt.locationName}
                          </Text>
                        </View>
                      </View>
                      {hunt.notes && (
                        <Text className="mt-2 text-xs text-gray-400">
                          {hunt.notes}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Start Hunt Dialog */}
      <Dialog
        visible={showStartDialog}
        onClose={() => setShowStartDialog(false)}
      >
        <Text className="text-lg font-bold text-white mb-1">
          Start New Hunt
        </Text>
        <Text className="text-xs text-gray-400 mb-4">
          Record the details of your hunt before heading out
        </Text>
        <View className="space-y-2">
          <Label>Hunt Title *</Label>
          <Input
            value={newHunt.title}
            placeholder="Morning Deer Hunt"
            onChangeText={(val) => setNewHunt({ ...newHunt, title: val })}
          />
        </View>
        <View className="space-y-2 mt-2">
          <Label>Location *</Label>
          <Input
            value={newHunt.locationName}
            placeholder="Smith Property - North Field"
            onChangeText={(val) =>
              setNewHunt({ ...newHunt, locationName: val })
            }
          />
        </View>
        <View className="space-y-2 mt-2">
          <Label>Species *</Label>
          <Select
            options={SPECIES_OPTIONS}
            value={newHunt.species}
            onChange={(val) => setNewHunt({ ...newHunt, species: val })}
            placeholder="Select species"
          />
        </View>
        <View className="space-y-2 mt-2">
          <Label>Hunting Method</Label>
          <Select
            options={METHOD_OPTIONS}
            value={newHunt.method}
            onChange={(val) => setNewHunt({ ...newHunt, method: val })}
            placeholder="Select method"
          />
        </View>
        <View className="space-y-2 mt-2">
          <Label>Notes</Label>
          <Textarea
            value={newHunt.notes}
            placeholder="Weather conditions, strategy, etc."
            onChangeText={(val) => setNewHunt({ ...newHunt, notes: val })}
          />
        </View>
        <View className="flex-row justify-between mt-4">
          <Button type="outline" onPress={() => setShowStartDialog(false)}>
            Cancel
          </Button>
          <Button onPress={handleStartHunt} type="primary">
            Start Hunt
          </Button>
        </View>
      </Dialog>

      {/* End Hunt Dialog */}
      <Dialog visible={showEndDialog} onClose={() => setShowEndDialog(false)}>
        <Text className="text-lg font-bold text-white mb-1">End Hunt</Text>
        <Text className="text-xs text-gray-400 mb-4">
          Record the outcome of your hunt
        </Text>
        <View className="space-y-2">
          <Label>Was your hunt successful?</Label>
          <View className="flex-row gap-2 mb-2">
            <Button
              type={endHuntData.successful ? "primary" : "outline"}
              className="flex-1"
              onPress={() =>
                setEndHuntData({ ...endHuntData, successful: true })
              }
            >
              <CheckCircle2
                size={16}
                style={tw`mr-1`}
                color={endHuntData.successful ? "#fff" : "#9ca3af"}
              />
              <Text
                className={endHuntData.successful ? "text-white" : "text-white"}
              >
                Success
              </Text>
            </Button>
            <Button
              type={!endHuntData.successful ? "primary" : "outline"}
              className="flex-1"
              onPress={() =>
                setEndHuntData({
                  ...endHuntData,
                  successful: false,
                  harvested: 0,
                })
              }
            >
              <XCircle
                size={16}
                style={tw`mr-1`}
                color={!endHuntData.successful ? "#fff" : "#9ca3af"}
              />
              <Text className="text-white">No Harvest</Text>
            </Button>
          </View>
        </View>
        {endHuntData.successful && (
          <View className="space-y-2 mb-2">
            <Label>Number Harvested</Label>
            <Input
              value={String(endHuntData.harvested)}
              placeholder="1"
              keyboardType="numeric"
              onChangeText={(val) =>
                setEndHuntData({
                  ...endHuntData,
                  harvested: parseInt(val) || 0,
                })
              }
            />
          </View>
        )}
        <View className="space-y-2 mb-2">
          <Label>Notes</Label>
          <Textarea
            value={endHuntData.notes}
            placeholder="What did you see? Any observations?"
            onChangeText={(val) =>
              setEndHuntData({ ...endHuntData, notes: val })
            }
          />
        </View>
        <View className="flex-row justify-between mt-4">
          <Button type="outline" onPress={() => setShowEndDialog(false)}>
            Cancel
          </Button>
          <Button onPress={handleEndHunt} type="primary">
            End Hunt
          </Button>
        </View>
      </Dialog>

      {/* Add Waypoint Dialog */}
      {location && (
        <AddWaypointDialog
          open={waypointDialogOpen}
          onOpenChange={setWaypointDialogOpen}
          lat={location.lat}
          lng={location.lng}
        />
      )}
    </View>
  );
}
