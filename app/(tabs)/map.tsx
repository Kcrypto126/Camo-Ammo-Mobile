import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Authenticated } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import FriendLocationLayer from "@/components/friends/FriendLocationLayer";
import HuntingUnitLayer from "@/components/map/HuntingUnitLayer";
import LayerControl from "@/components/map/LayerControl";
import PropertyLayer from "@/components/map/PropertyLayer";
import AddWaypointDialog from "@/components/tracking/AddWaypointDialog";
import TrackLayer from "@/components/tracking/TrackLayer";
import WaypointLayer from "@/components/tracking/WaypointLayer";
import { LocationButton } from "@/components/ui/LocationButton";
import { MapTypeControl, type RNMapType } from "@/components/ui/MapTypeControl";
import { showToast } from "@/components/ui/Toast";

// Import other components when ready
import HuntingUnitPanel from "@/components/map/HuntingUnitPanel";
import PropertyDetailsPanel from "@/components/map/PropertyDetailsPanel";
import TrackingControl from "@/components/tracking/TrackingControl";
import WeatherPanel from "@/components/weather/WeatherPanel";

interface HuntingMapProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function HuntingMap({
  initialCenter = { lat: 39.8283, lng: -98.5795 }, // Center of US
  initialZoom = 5,
  onLocationUpdate,
}: HuntingMapProps) {
  // Convert zoom level to latitudeDelta/longitudeDelta
  const zoomToDelta = (zoom: number) => {
    return 360 / Math.pow(2, zoom);
  };

  const [region, setRegion] = useState({
    latitude: initialCenter.lat,
    longitude: initialCenter.lng,
    latitudeDelta: zoomToDelta(initialZoom),
    longitudeDelta: zoomToDelta(initialZoom),
  });

  const [mapType, setMapType] = useState<RNMapType>("hybrid");
  const [layers, setLayers] = useState({
    properties: true,
    huntingUnits: false,
    publicLand: false,
    friends: true,
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedProperty, setSelectedProperty] =
    useState<Doc<"properties"> | null>(null);
  const [selectedHuntingUnit, setSelectedHuntingUnit] =
    useState<Doc<"huntingUnits"> | null>(null);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState(initialCenter);
  const [waypointDialogOpen, setWaypointDialogOpen] = useState(false);
  const [waypointLocation, setWaypointLocation] = useState<{
    lat: number;
    lng: number;
    altitude?: number;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<MapView>(null);

  const handleLayerToggle = (layer: string, enabled: boolean) => {
    setLayers((prev) => ({ ...prev, [layer]: enabled }));
  };

  const handlePropertyClick = (property: Doc<"properties">) => {
    setSelectedProperty(property);
    setSelectedHuntingUnit(null);
  };

  const handleHuntingUnitClick = (unit: Doc<"huntingUnits">) => {
    setSelectedHuntingUnit(unit);
    setSelectedProperty(null);
  };

  const handleWeatherClick = () => {
    setWeatherLocation({
      lat: region.latitude,
      lng: region.longitude,
    });
    setShowWeather(true);
  };

  const handleWaypointAdd = (lat: number, lng: number, altitude?: number) => {
    setWaypointLocation({ lat, lng, altitude });
    setWaypointDialogOpen(true);
  };

  // Convert mapType to react-native-maps format
  const getMapType = (): "standard" | "satellite" | "hybrid" | "terrain" => {
    return mapType === "standard"
      ? "standard"
      : mapType === "satellite"
        ? "satellite"
        : mapType === "hybrid"
          ? "hybrid"
          : "terrain";
  };

  // Animate map to location
  const animateToLocation = useCallback(
    (lat: number, lng: number, zoom?: number) => {
      if (mapRef.current) {
        const delta = zoom ? zoomToDelta(zoom) : 0.03;
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: delta,
            longitudeDelta: delta,
          },
          1000
        );
      }
    },
    []
  );

  // Handle location update from LocationButton
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      setUserLocation({ lat, lng });
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      setRegion(newRegion);
      animateToLocation(lat, lng, 15);
      if (onLocationUpdate) {
        onLocationUpdate(lat, lng);
      }
      showToast("Location found");
    },
    [animateToLocation, onLocationUpdate]
  );

  // Handle region change
  const handleRegionChangeComplete = useCallback(
    (newRegion: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    }) => {
      setRegion(newRegion);
    },
    []
  );

  if (!region) {
    return (
      <View className="flex-1 bg-zinc-900 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-neutral-400 mt-2">Loading map...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative bg-zinc-900">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        region={region}
        mapType={getMapType()}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => {
          setMapReady(true);
          console.log("[HuntingMap] Map is ready");
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            title="Your Location"
            pinColor="#f97316"
          />
        )}

        {/* Authenticated Layers */}
        <Authenticated>
          {/* Property Boundaries Layer */}
          {layers.properties && (
            <PropertyLayer
              onPropertyClick={handlePropertyClick}
              mapRef={mapRef}
            />
          )}

          {/* Hunting Units Layer */}
          {layers.huntingUnits && (
            <HuntingUnitLayer
              onUnitClick={handleHuntingUnitClick}
              mapRef={mapRef}
            />
          )}

          {/* Track Layer */}
          <TrackLayer mapRef={mapRef} />

          {/* Waypoint Layer */}
          <WaypointLayer mapRef={mapRef} />

          {/* Friends' Location Layer */}
          <FriendLocationLayer visible={layers.friends} mapRef={mapRef} />
        </Authenticated>
      </MapView>

      {/* Map Type Selector */}
      <View className="absolute top-2 right-3 z-50">
        <MapTypeControl mapType={mapType} onMapTypeChange={setMapType} />
      </View>

      {/* Floating Location/Weather Buttons */}
      <LocationButton
        onWeatherClick={handleWeatherClick}
        onLocationUpdate={handleLocationUpdate}
        loading={loadingLocation}
        setLoading={setLoadingLocation}
        mapRef={mapRef}
      />

      {/* Layer Control and Other UI */}
      <View className="absolute right-0 top-0 z-10" pointerEvents="box-none">
        <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />

        {/* Tracking Control - Uncomment when component is ready */}
        <TrackingControl
          onWaypointAdd={handleWaypointAdd}
          onLocationUpdate={handleLocationUpdate}
        />

        {/* Weather Panel - Uncomment when component is ready */}
        {showWeather && (
          <WeatherPanel
            lat={weatherLocation.lat}
            lng={weatherLocation.lng}
            onClose={() => setShowWeather(false)}
          />
        )}

        {/* Property Details Panel - Uncomment when component is ready */}
        {!showWeather && selectedProperty && (
          <PropertyDetailsPanel
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}

        {/* Hunting Unit Panel - Uncomment when component is ready */}
        {!showWeather && !selectedProperty && selectedHuntingUnit && (
          <HuntingUnitPanel
            unit={selectedHuntingUnit}
            onClose={() => setSelectedHuntingUnit(null)}
          />
        )}

        {/* Waypoint Dialog */}
        {waypointLocation && (
          <AddWaypointDialog
            open={waypointDialogOpen}
            onOpenChange={setWaypointDialogOpen}
            lat={waypointLocation.lat}
            lng={waypointLocation.lng}
            altitude={waypointLocation.altitude}
          />
        )}
      </View>
    </View>
  );
}
