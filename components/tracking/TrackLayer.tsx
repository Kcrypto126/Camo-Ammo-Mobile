import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Polyline } from "react-native-maps";

interface TrackLayerProps {
  mapRef: React.RefObject<any> | null;
}

export default function TrackLayer({ mapRef }: TrackLayerProps) {
  // Fetch current active track from Convex
  const activeTrack = useQuery(api.tracks.getActiveTrack);

  if (!activeTrack || !activeTrack.points || activeTrack.points.length === 0) {
    return null;
  }

  // Convert track points to coordinates array
  const coordinates = activeTrack.points.map((point: { lat: number; lng: number }) => ({
    latitude: point.lat,
    longitude: point.lng,
  }));

  if (coordinates.length === 0) {
    return null;
  }

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor="#f97316" // Orange color for track
      strokeWidth={3}
      lineDashPattern={[1]}
    />
  );
}
