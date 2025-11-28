import { Button } from "@/components/ui/Button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { NotificationBell } from "@/components/ui/notification-bell";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  HeadphonesIcon,
  MessageSquare,
  Shield,
  Store,
  Target,
  Truck,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import ContactSupportPage from "./ContactSupportPage";
import DeerRecoveryPage from "./DeerRecoveryPage";
import ForumsPage from "./ForumsPage";
import ProfilePage from "./ProfilePage";
import VehicleRecoveryPage from "./VehicleRecoveryPage";

interface MyToolsPageProps {
  onEmergency: () => void;
  onNavigateToMarketplace: () => void;
  onNavigateToLeaseReview?: () => void;
}

export default function MyToolsPage({
  onEmergency,
  onNavigateToMarketplace,
  onNavigateToLeaseReview,
}: MyToolsPageProps) {
  const [currentView, setCurrentView] = useState<
    "menu" | "profile" | "forums" | "vehicle" | "deer" | "support"
  >("menu");
  const hasLandReviewPermission = useQuery(
    api.landLeases.hasLandReviewPermission,
    {}
  );

  if (currentView === "profile") {
    return (
      <View className="flex-1">
        <View className="border-b border-gray-700 bg-gray-900 px-4 py-3">
          <Button
            type="ghost"
            onPress={() => setCurrentView("menu")}
            className="flex-row !justify-start items-center gap-2"
          >
            <ArrowLeft size={16} color="#fff" />
            <Text className="text-white">Back to My Tools</Text>
          </Button>
        </View>
        <View className="flex-1">
          <ProfilePage />
        </View>
      </View>
    );
  }

  if (currentView === "forums") {
    return <ForumsPage onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "vehicle") {
    return <VehicleRecoveryPage onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "deer") {
    return <DeerRecoveryPage onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "support") {
    return <ContactSupportPage onBack={() => setCurrentView("menu")} />;
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-white">My Tools</Text>
          <NotificationBell />
        </View>
      </View>

      {/* Tools Options */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <View className="gap-4">
          {/* Emergency */}
          <Card onPress={onEmergency}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle size={24} color="#ef4444" />
                  </View>
                  <View>
                    <CardTitle>Emergency</CardTitle>
                    <CardDescription>
                      Contact emergency services
                    </CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>

          {/* Vehicle Recovery */}
          <Card onPress={() => setCurrentView("vehicle")}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                    <Truck size={24} color="#f97316" />
                  </View>
                  <View>
                    <CardTitle>Vehicle Recovery</CardTitle>
                    <CardDescription>
                      Get help from nearby hunters
                    </CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>

          {/* Deer Recovery */}
          <Card onPress={() => setCurrentView("deer")}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-600/10">
                    <Target size={24} color="#d97706" />
                  </View>
                  <View>
                    <CardTitle>Deer Recovery</CardTitle>
                    <CardDescription>
                      Need Help Recovering A Deer
                    </CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>

          {/* Contact Support */}
          <Card onPress={() => setCurrentView("support")}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                    <HeadphonesIcon size={24} color="#3b82f6" />
                  </View>
                  <View>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Get help from our team</CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>

          {/* Forums */}
          <Card onPress={() => setCurrentView("forums")}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#ff6800]/10">
                    <MessageSquare size={24} color="#ff6800" />
                  </View>
                  <View>
                    <CardTitle>The Hunters Lab (Forums)</CardTitle>
                    <CardDescription>
                      Join community discussions
                    </CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>

          {/* Land Leasing Marketplace */}
          <Card onPress={onNavigateToMarketplace}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Store size={24} color="#22c55e" />
                  </View>
                  <View>
                    <CardTitle>Land Leasing</CardTitle>
                    <CardDescription>
                      Browse and list hunting land
                    </CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>

          {/* Admin Land Review (only if user has permission) */}
          {hasLandReviewPermission && onNavigateToLeaseReview && (
            <Card onPress={onNavigateToLeaseReview}>
              <CardHeader>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                      <Shield size={24} color="#3b82f6" />
                    </View>
                    <View>
                      <CardTitle>Land Review (Admin)</CardTitle>
                      <CardDescription>
                        Review pending lease listings
                      </CardDescription>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9ca3af" />
                </View>
              </CardHeader>
            </Card>
          )}

          {/* Profile */}
          <Card onPress={() => setCurrentView("profile")}>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                    <User size={24} color="#ffffff" />
                  </View>
                  <View>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      View and edit your profile
                    </CardDescription>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardHeader>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
