import { Ionicons } from "@expo/vector-icons";
import { Alert, TouchableOpacity, View } from "react-native";

interface LocationButtonProps {
  onWeatherClick: () => void;
  onLocationUpdate: (lat: number, lng: number) => void;
  loading: boolean;
  setLoading: (b: boolean) => void;
  mapRef: React.RefObject<any> | null;
}

export function LocationButton({
  onWeatherClick,
  onLocationUpdate,
  loading,
  setLoading,
  mapRef,
}: LocationButtonProps) {
  const handleLocate = () => {
    setLoading(true);
    console.log("[LocationButton] Getting current position");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log("[LocationButton] Position obtained:", pos);
          // Animate to position using react-native-maps animateToRegion
          if (mapRef?.current && mapRef.current.animateToRegion) {
            const delta = 0.01; // Equivalent to zoom level ~15
            mapRef.current.animateToRegion(
              {
                latitude: pos.latitude,
                longitude: pos.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
              },
              1000
            );
          }
          onLocationUpdate(pos.latitude, pos.longitude);
          setLoading(false);
        },
        (err) => {
          console.error("[LocationButton] Geolocation error:", err);
          setLoading(false);
          Alert.alert("Unable to find your location");
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("[LocationButton] Geolocation not available");
      setLoading(false);
      Alert.alert("Geolocation is not supported on this device");
    }
  };

  return (
    <View className="absolute bottom-8 right-4 flex-col items-center z-10 space-y-3.5">
      <TouchableOpacity
        className="w-12 h-12 rounded-full bg-zinc-800/80 justify-center items-center mb-2 shadow"
        onPress={onWeatherClick}
      >
        <Ionicons name="cloud-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        className="w-12 h-12 rounded-full bg-zinc-800/80 justify-center items-center mb-2 shadow"
        onPress={handleLocate}
        disabled={loading}
      >
        <Ionicons
          name="navigate"
          size={24}
          color={loading ? "#f97316" : "white"}
          style={loading ? { opacity: 0.7 } : undefined}
        />
      </TouchableOpacity>
    </View>
  );
}
