import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Polygon } from "react-native-maps";

interface PropertyLayerProps {
  onPropertyClick?: (property: Doc<"properties">) => void;
  mapRef: React.RefObject<any> | null;
}

export default function PropertyLayer({
  onPropertyClick,
  mapRef,
}: PropertyLayerProps) {
  const [bounds, setBounds] = useState({
    minLat: -90,
    maxLat: 90,
    minLng: -180,
    maxLng: 180,
  });

  // Update bounds when map region changes
  useEffect(() => {
    if (mapRef?.current) {
      // Get current region from map
      const updateBounds = () => {
        // This will be called when region changes
        // For now, we'll fetch all properties
        // In production, you'd calculate bounds from region
      };
      updateBounds();
    }
  }, [mapRef]);

  // Fetch properties in current bounds
  const properties =
    useQuery(api.properties.getPropertiesInBounds, bounds) || [];

  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <>
      {properties.map((property: Doc<"properties">) => {
        // Convert GeoJSON coordinates to react-native-maps format
        // GeoJSON uses [lng, lat] format, react-native-maps uses {latitude, longitude}
        const geoJsonCoords = property.boundaries?.coordinates?.[0] || [];
        const coordinates = geoJsonCoords.map((coord: number[]) => ({
          latitude: coord[1], // GeoJSON has lng first, lat second
          longitude: coord[0],
        }));

        if (coordinates.length === 0) return null;

        // Determine color based on property type
        const getColor = () => {
          if (property.propertyType === "public")
            return "rgba(34, 197, 94, 0.2)"; // Green
          if (property.propertyType === "private")
            return "rgba(239, 68, 68, 0.2)"; // Red
          if (property.propertyType === "state")
            return "rgba(59, 130, 246, 0.2)"; // Blue
          if (property.propertyType === "federal")
            return "rgba(168, 85, 247, 0.2)"; // Purple
          return "rgba(34, 197, 94, 0.2)"; // Default green
        };

        const getStrokeColor = () => {
          if (property.propertyType === "public") return "#22c55e";
          if (property.propertyType === "private") return "#ef4444";
          if (property.propertyType === "state") return "#3b82f6";
          if (property.propertyType === "federal") return "#a855f7";
          return "#22c55e";
        };

        return (
          <Polygon
            key={property._id}
            coordinates={coordinates}
            fillColor={getColor()}
            strokeColor={getStrokeColor()}
            strokeWidth={2}
            onPress={() => {
              if (onPropertyClick) {
                onPropertyClick(property);
              }
            }}
          />
        );
      })}
    </>
  );
}
