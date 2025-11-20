import { BottomNav } from "@/components/ui/BottomNav";
import { Header } from "@/components/ui/Header";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ProfileSetupPage from "./ProfileSetupPage";
import FriendsPage from "./friends";
import HQPage from "./hq";
import MapPage from "./map";
import MyToolsPage from "./mytools";
import ScoutingPage from "./scouting";

export default function Dashboard() {
  const router = useRouter();
  const profile = useQuery(api.profile.getMyProfile);
  const [activeTab, setActiveTab] = useState("hq");

  const handleStartHunt = () => {
    console.log("[Dashboard] Start Hunt pressed");
    // Navigate to map or start tracking
    setActiveTab("map");
  };

  const handleNotificationPress = () => {
    console.log("[Dashboard] Notification pressed");
    // Handle notification
  };

  const handleTabChange = (tab: string) => {
    console.log("[Dashboard] Tab changed to:", tab);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "hq":
        return <HQPage />;
      case "map":
        return <MapPage />;
      case "scouting":
        return <ScoutingPage />;
      case "friends":
        return <FriendsPage />;
      case "mytools":
        return <MyToolsPage />;
      default:
        return <HQPage />;
    }
  };

  // Show loading state while checking profile
  if (profile === undefined) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-gray-400 mt-4">Loading...</Text>
      </View>
    );
  }

  // Show profile setup if not completed (no header/navbar)
  if (!profile?.profileCompleted) {
    return <ProfileSetupPage />;
  }

  // Show main dashboard with header and bottom nav
  return (
    <View className="flex-1 bg-gray-900">
      {/* Header - Only show on HQ tab */}
      {activeTab === "hq" && (
        <Header
          onStartHunt={handleStartHunt}
          onNotificationPress={handleNotificationPress}
        />
      )}

      {/* Main Content */}
      <View className="flex-1">{renderContent()}</View>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
