import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
// The following imports should be updated to their React Native implementations or stubs
// import AddWaypointDialog from "../tracking/AddWaypointDialog";
// import TrackingControl from "../tracking/TrackingControl";
// import WeatherPanel from "../weather/WeatherPanel";
// import HuntingUnitPanel from "./HuntingUnitPanel";
import LayerControl from "@/components/map/LayerControl";
import { LocationButton } from "@/components/ui/LocationButton";
import { MapTypeControl, type RNMapType } from "@/components/ui/MapTypeControl";
// import PropertyDetailsPanel from "./PropertyDetailsPanel";

// Import expo-maps namespaces directly
// TypeScript namespaces can be imported as named exports
// import { AppleMaps, GoogleMaps } from "expo-maps";

// Log for debugging
// console.log("[HuntingMap] expo-maps module loaded", {
//   hasGoogleMaps: !!GoogleMaps,
//   hasAppleMaps: !!AppleMaps,
//   googleMapsView:
//     GoogleMaps && typeof GoogleMaps.View !== "undefined" ? "exists" : "missing",
//   appleMapsView:
//     AppleMaps && typeof AppleMaps.View !== "undefined" ? "exists" : "missing",
//   googleMapsType: typeof GoogleMaps,
//   appleMapsType: typeof AppleMaps,
// });

interface HuntingMapProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function HuntingMap({
  initialCenter = { lat: 39.8283, lng: -98.5795 },
  initialZoom = 5,
  onLocationUpdate,
}: HuntingMapProps) {
  // Check maps availability
  // const [mapsReady, setMapsReady] = useState(!!GoogleMaps && !!AppleMaps);

  // useEffect(() => {
  //   if (GoogleMaps && AppleMaps) {
  //     setMapsReady(true);
  //     console.log("[HuntingMap] Maps confirmed available in useEffect");
  //   } else {
  //     setMapsReady(false);
  //     console.warn("[HuntingMap] Maps not available in useEffect", {
  //       hasGoogleMaps: !!GoogleMaps,
  //       hasAppleMaps: !!AppleMaps,
  //     });
  //   }
  // }, []);

  const [region, setRegion] = useState({
    latitude: initialCenter.lat,
    longitude: initialCenter.lng,
    latitudeDelta: 2,
    longitudeDelta: 2,
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

  const mapRef = useRef<any>(null);

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

  // Check if maps module is available
  // if (!mapsReady || !GoogleMaps || !AppleMaps) {
  //   console.error(
  //     "[HuntingMap] expo-maps not available - native module missing"
  //   );
  //   return (
  //     <View className="flex-1 bg-zinc-900 justify-center items-center px-4">
  //       <Ionicons name="map-outline" size={64} color="#f97316" />
  //       <Text className="text-red-500 text-lg font-bold mt-4 mb-2">
  //         Map Module Error
  //       </Text>
  //       <Text className="text-neutral-400 text-center mb-2">
  //         expo-maps native module is not available.
  //       </Text>
  //       <Text className="text-neutral-500 text-sm text-center mb-4">
  //         This requires a development build. Please run:
  //       </Text>
  //       <Text className="text-orange-500 text-xs text-center font-mono bg-zinc-800 p-2 rounded">
  //         npx expo install expo-maps{"\n"}
  //         npx expo prebuild{"\n"}
  //         npx expo run:android
  //       </Text>
  //     </View>
  //   );
  // }

  if (!region) {
    return (
      <View className="flex-1 bg-zinc-900 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-neutral-400 mt-2">Loading map...</Text>
      </View>
    );
  }

  // Convert region to cameraPosition format (expo-maps uses cameraPosition, not region)
  const cameraPosition = {
    coordinates: {
      latitude: region.latitude,
      longitude: region.longitude,
    },
    zoom: Math.log2(360 / region.latitudeDelta),
  };

  // Convert mapType to expo-maps format
  // const getMapType = () => {
  //   if (!GoogleMaps || !AppleMaps) {
  //     return undefined;
  //   }
  //   if (Platform.OS === "android") {
  //     const mapTypeMap: Record<RNMapType, any> = {
  //       standard: GoogleMaps.MapType.NORMAL,
  //       satellite: GoogleMaps.MapType.SATELLITE,
  //       hybrid: GoogleMaps.MapType.HYBRID,
  //       terrain: GoogleMaps.MapType.TERRAIN,
  //     };
  //     return mapTypeMap[mapType];
  //   } else {
  //     const mapTypeMap: Record<RNMapType, any> = {
  //       standard: AppleMaps.MapType.STANDARD,
  //       satellite: AppleMaps.MapType.IMAGERY, // Apple Maps uses IMAGERY instead of SATELLITE
  //       hybrid: AppleMaps.MapType.HYBRID,
  //       terrain: AppleMaps.MapType.STANDARD, // Apple Maps doesn't have terrain, use standard
  //     };
  //     return mapTypeMap[mapType];
  //   }
  // };

  // Convert userLocation to markers array format
  // const markers = userLocation
  //   ? [
  //       {
  //         id: "user-location",
  //         coordinates: {
  //           latitude: userLocation.lat,
  //           longitude: userLocation.lng,
  //         },
  //       },
  //     ]
  //   : [];

  // console.log(
  //   "[HuntingMap] Rendering map with cameraPosition:",
  //   cameraPosition,
  //   "mapType:",
  //   mapType
  // );

  return (
    <View className="flex-1 px-2 py-2 relative bg-zinc-900">
      {/* {Platform.OS === "android" ? (
        <GoogleMaps.View
          ref={mapRef}
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          markers={markers}
          properties={{
            mapType: getMapType(),
            isMyLocationEnabled: false,
            // Add more map options if available/needed
          }}
          uiSettings={{
            myLocationButtonEnabled: false,
            // Add more UI settings as needed
          }}
          onMapLoaded={() => {
            console.log("[HuntingMap] Map is ready");
          }}
          onCameraMove={(event: any) => {
            const newPosition = event.nativeEvent?.cameraPosition;
            if (newPosition?.coordinates) {
              console.log("[HuntingMap] Camera changed:", newPosition);
              const zoom = newPosition.zoom || cameraPosition.zoom;
              const delta = 360 / Math.pow(2, zoom);
              setRegion({
                latitude: newPosition.coordinates.latitude || region.latitude,
                longitude:
                  newPosition.coordinates.longitude || region.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
              });
            }
          }}
        />
      ) : (
        <AppleMaps.View
          ref={mapRef}
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          markers={markers}
          properties={{
            mapType: getMapType(),
            isMyLocationEnabled: false,
          }}
          onCameraMove={(event: any) => {
            const newPosition = event.nativeEvent?.cameraPosition;
            if (newPosition?.coordinates) {
              console.log("[HuntingMap] Camera changed:", newPosition);
              const zoom = newPosition.zoom || cameraPosition.zoom;
              const delta = 360 / Math.pow(2, zoom);
              setRegion({
                latitude: newPosition.coordinates.latitude || region.latitude,
                longitude:
                  newPosition.coordinates.longitude || region.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
              });
            }
          }}
        />
      )} */}
      {/* Layer components - these will be implemented to add markers/polylines via props */}
      {/* {layers.properties && (
        <PropertyLayer
          onPropertyClick={handlePropertyClick}
          map={mapRef.current}
        />
      )} */}
      {/* {layers.huntingUnits && (
        <HuntingUnitLayer
          onUnitClick={handleHuntingUnitClick}
          map={mapRef.current}
        />
      )} */}
      {/* <TrackLayer map={mapRef.current} />
      <WaypointLayer map={mapRef.current} />
      <FriendLocationLayer visible={layers.friends} map={mapRef.current} /> */}

      {/* Map Type Selector */}
      <MapTypeControl mapType={mapType} onMapTypeChange={setMapType} />

      {/* Floating Location/Weather Buttons */}
      <LocationButton
        onWeatherClick={handleWeatherClick}
        onLocationUpdate={(lat, lng) => {
          setUserLocation({ lat, lng });
          setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          });
          if (onLocationUpdate) {
            onLocationUpdate(lat, lng);
          }
        }}
        loading={loadingLocation}
        setLoading={setLoadingLocation}
        mapRef={mapRef}
      />

      {/* The rest of UI overlays */}
      <View className="absolute right-0 top-0 z-10" pointerEvents="box-none">
        <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
        {/* <TrackingControl
            onWaypointAdd={handleWaypointAdd}
            onLocationUpdate={(lat: number, lng: number) => {
              setUserLocation({ lat, lng });
              setRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              });
              if (onLocationUpdate) {
                onLocationUpdate(lat, lng);
              }
            }}
          />

          {showWeather && (
            <WeatherPanel
              lat={weatherLocation.lat}
              lng={weatherLocation.lng}
              onClose={() => setShowWeather(false)}
            />
          )}
          {!showWeather && selectedProperty && (
            <PropertyDetailsPanel
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          )}
          {!showWeather && !selectedProperty && selectedHuntingUnit && (
            <HuntingUnitPanel
              unit={selectedHuntingUnit}
              onClose={() => setSelectedHuntingUnit(null)}
            />
          )}
          {waypointLocation && (
            <AddWaypointDialog
              open={waypointDialogOpen}
              onOpenChange={setWaypointDialogOpen}
              lat={waypointLocation.lat}
              lng={waypointLocation.lng}
              altitude={waypointLocation.altitude}
            />
          )} */}
      </View>
    </View>
  );
}
