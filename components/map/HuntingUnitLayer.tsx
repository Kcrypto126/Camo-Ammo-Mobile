import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Polygon } from "react-native-maps";

interface HuntingUnitLayerProps {
  onUnitClick?: (unit: Doc<"huntingUnits">) => void;
  mapRef: React.RefObject<any> | null;
}

export default function HuntingUnitLayer({
  onUnitClick,
  mapRef,
}: HuntingUnitLayerProps) {
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
        // For now, we'll fetch all units
        // In production, you'd calculate bounds from region
      };
      updateBounds();
    }
  }, [mapRef]);

  // Fetch hunting units in current bounds
  const huntingUnits =
    useQuery(api.huntingUnits.getHuntingUnitsInBounds, bounds) || [];

  if (!huntingUnits || huntingUnits.length === 0) {
    return null;
  }

  return (
    <>
      {huntingUnits.map((unit: Doc<"huntingUnits">) => {
        // Convert GeoJSON coordinates to react-native-maps format
        // GeoJSON uses [lng, lat] format, react-native-maps uses {latitude, longitude}
        const geoJsonCoords = unit.boundaries?.coordinates?.[0] || [];
        const coordinates = geoJsonCoords.map((coord: number[]) => ({
          latitude: coord[1], // GeoJSON has lng first, lat second
          longitude: coord[0],
        }));

        if (coordinates.length === 0) return null;

        // Determine color based on unit type
        const getColor = () => {
          if (unit.type === "WMA") return "rgba(16, 185, 129, 0.2)"; // Emerald
          if (unit.type === "State Park") return "rgba(20, 184, 166, 0.2)"; // Teal
          if (unit.type === "National Forest") return "rgba(5, 150, 105, 0.2)"; // Emerald-700
          return "rgba(16, 185, 129, 0.2)"; // Default emerald
        };

        const getStrokeColor = () => {
          if (unit.type === "WMA") return "#10b981";
          if (unit.type === "State Park") return "#14b8a6";
          if (unit.type === "National Forest") return "#059669";
          return "#10b981";
        };

        return (
          <Polygon
            key={unit._id}
            coordinates={coordinates}
            fillColor={getColor()}
            strokeColor={getStrokeColor()}
            strokeWidth={2}
            onPress={() => {
              if (onUnitClick) {
                onUnitClick(unit);
              }
            }}
          />
        );
      })}
    </>
  );
}
