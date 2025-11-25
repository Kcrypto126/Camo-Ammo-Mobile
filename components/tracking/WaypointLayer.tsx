import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Marker } from "react-native-maps";

interface WaypointLayerProps {
  mapRef: React.RefObject<any> | null;
}

export default function WaypointLayer({ mapRef }: WaypointLayerProps) {
  // Fetch waypoints from Convex
  const waypoints = useQuery(api.waypoints.getMyWaypoints) || [];

  if (!waypoints || waypoints.length === 0) {
    return null;
  }

  return (
    <>
      {waypoints.map((waypoint: any) => {
        if (!waypoint.lat || !waypoint.lng) {
          return null;
        }

        return (
          <Marker
            key={waypoint._id}
            coordinate={{
              latitude: waypoint.lat,
              longitude: waypoint.lng,
            }}
            title={waypoint.name || "Waypoint"}
            pinColor="#8b5cf6" // Purple color for waypoints
          />
        );
      })}
    </>
  );
}
