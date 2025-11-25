import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Marker } from "react-native-maps";

interface FriendLocationLayerProps {
  visible: boolean;
  mapRef: React.RefObject<any> | null;
}

export default function FriendLocationLayer({
  visible,
  mapRef,
}: FriendLocationLayerProps) {
  // Fetch friends' locations from Convex
  const friendsLocations =
    useQuery(api.locationSharing.getFriendsLocations) || [];

  if (!visible || !friendsLocations || friendsLocations.length === 0) {
    return null;
  }

  return (
    <>
      {friendsLocations.map((friend: any) => {
        if (!friend.location || !friend.location.lat || !friend.location.lng) {
          return null;
        }

        return (
          <Marker
            key={friend._id || friend.userId}
            coordinate={{
              latitude: friend.location.lat,
              longitude: friend.location.lng,
            }}
            title={friend.name || "Friend"}
            pinColor="#a21caf" // Purple color for friends
          />
        );
      })}
    </>
  );
}
