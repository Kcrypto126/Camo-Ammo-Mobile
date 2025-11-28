import CreateLeaseDialog from "@/components/marketplace/CreateLeaseDialog";
import InquiryDialog from "@/components/marketplace/InquiryDialog";
import LeaseDetailsDialog from "@/components/marketplace/LeaseDetailsDialog";
import { BottomNav } from "@/components/ui/BottomNav";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import BiometricPrompt from "@/components/ui/biometric-prompt";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { AlertTriangle, Phone } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import ProfileSetupPage from "./ProfileSetupPage";
import PublicProfilePage from "./PublicProfilePage";
import FriendsPage from "./friends";
import HQPage from "./hq";
import HuntingMap from "./map";
import MyToolsPage from "./mytools";
import ScoutingPage from "./scouting";

const showToast = (msg: string) => {
  if (Platform.OS === "android") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ToastAndroid = require("react-native").ToastAndroid;
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    // eslint-disable-next-line no-alert
    alert(msg);
  }
};

export default function Dashboard() {
  const router = useRouter();
  const profile = useQuery(api.profile.getMyProfile);
  const [activeTab, setActiveTab] = useState("hq");
  const { user } = useAuth();
  const { isAvailable, isEnabled } = useBiometricAuth();
  const userRole = useQuery(api.roles.getMyRole);
  const [showFullMap, setShowFullMap] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showLeaseReview, setShowLeaseReview] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [membersView, setMembersView] = useState<
    | "main"
    | "members"
    | "bans"
    | "subscriptions"
    | "administrators"
    | "permissions"
    | "archived"
    | "audit"
    | "view_profile"
  >("main");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null
  );
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [publicProfileUserId, setPublicProfileUserId] =
    useState<Id<"users"> | null>(null);
  const [showForumModeration, setShowForumModeration] = useState(false);
  const [showOpenTicketsList, setShowOpenTicketsList] = useState(false);
  const [showPendingPostsList, setShowPendingPostsList] = useState(false);
  const [showReportedPostsList, setShowReportedPostsList] = useState(false);

  const [showCreateLeaseDialog, setShowCreateLeaseDialog] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] =
    useState<Id<"landLeases"> | null>(null);
  const [showLeaseDetailsDialog, setShowLeaseDetailsDialog] = useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleLeaseClick = (leaseId: Id<"landLeases">) => {
    setSelectedLeaseId(leaseId);
    setShowLeaseDetailsDialog(true);
  };

  const handleInquire = (leaseId: Id<"landLeases">) => {
    setSelectedLeaseId(leaseId);
    setShowLeaseDetailsDialog(false);
    setShowInquiryDialog(true);
  };

  const handleTabChange = (tab: string) => {
    console.log("[Dashboard] Tab changed to:", tab);
    setActiveTab(tab);
  };

  const handleViewFullMap = () => {
    setShowFullMap(true);
    setActiveTab("map");
  };

  const handleStartTracking = () => {
    setShowFullMap(true);
    setActiveTab("map");
    showToast("Starting GPS tracking. View the map to begin.");
  };

  const handleEmergency = () => {
    setShowEmergencyDialog(true);
  };

  const handleEmergencyCall = (service: string) => {
    setShowEmergencyDialog(false);
    showToast(`Calling ${service}...`);
    // In a real app, this would initiate a call or send an emergency alert
  };

  const handleNavigateToMarketplace = () => {
    setActiveTab("marketplace");
    setShowLeaseReview(false);
  };

  const handleNavigateToLeaseReview = () => {
    setActiveTab("marketplace");
    setShowLeaseReview(true);
  };

  const handleViewPublicProfile = (userId: Id<"users">) => {
    setPublicProfileUserId(userId);
    setShowPublicProfile(true);
  };

  const handleNavigateToForumModeration = () => {
    setShowForumModeration(true);
  };

  const handleNavigateToOpenTickets = () => {
    setShowOpenTicketsList(true);
  };

  const handleNavigateToPendingPosts = () => {
    setShowPendingPostsList(true);
  };

  const handleNavigateToReportedPosts = () => {
    setShowReportedPostsList(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "hq":
        return (
          <HQPage
            onViewFullMap={handleViewFullMap}
            onStartTracking={handleStartTracking}
            onEmergency={handleEmergency}
            userRole={userRole || undefined}
            onNavigateToForumModeration={handleNavigateToForumModeration}
            onNavigateToOpenTickets={handleNavigateToOpenTickets}
            onNavigateToPendingPosts={handleNavigateToPendingPosts}
            onNavigateToReportedPosts={handleNavigateToReportedPosts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        );
      case "map":
        return (
          <HuntingMap
            onLocationUpdate={(lat, lng) => setUserLocation({ lat, lng })}
          />
        );
      case "scouting":
        return <ScoutingPage onViewProfile={handleViewPublicProfile} />;
      case "friends":
        return <FriendsPage onViewProfile={handleViewPublicProfile} />;
      case "mytools":
        return (
          <MyToolsPage
            onEmergency={handleEmergency}
            onNavigateToMarketplace={handleNavigateToMarketplace}
            onNavigateToLeaseReview={handleNavigateToLeaseReview}
          />
        );
      default:
        return (
          <HQPage
            onViewFullMap={handleViewFullMap}
            onStartTracking={handleStartTracking}
            onEmergency={handleEmergency}
            userRole={userRole || undefined}
            onNavigateToForumModeration={handleNavigateToForumModeration}
            onNavigateToOpenTickets={handleNavigateToOpenTickets}
            onNavigateToPendingPosts={handleNavigateToPendingPosts}
            onNavigateToReportedPosts={handleNavigateToReportedPosts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        );
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
    <View className="flex-1 bg-gray-900 pt-8">
      {/* Main Content */}
      <View className="flex-1">{renderContent()}</View>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Emergency Dialog */}
      <Dialog
        visible={showEmergencyDialog}
        onClose={() => setShowEmergencyDialog(false)}
      >
        <View className="gap-4">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={20} color="#ef4444" />
              <Text className="text-xl font-bold text-red-500">
                Emergency Services
              </Text>
            </View>
            <Text className="text-sm text-gray-400">
              Contact emergency services immediately if you need help.
            </Text>
          </View>
          <View className="gap-3 py-4">
            <Button
              type="danger"
              className="w-full"
              onPress={() => handleEmergencyCall("911")}
            >
              <View className="flex-row items-center gap-3">
                <Phone size={20} color="#ffffff" />
                <Text className="text-lg text-white">Call 911</Text>
              </View>
            </Button>
            <Button
              type="outline"
              className="w-full"
              onPress={() => handleEmergencyCall("Local Ranger Station")}
            >
              <View className="flex-row items-center gap-3">
                <Phone size={16} color="#ffffff" />
                <Text className="text-white">Contact Local Ranger Station</Text>
              </View>
            </Button>
            <Button
              type="outline"
              className="w-full"
              onPress={() => handleEmergencyCall("Emergency Contact")}
            >
              <View className="flex-row items-center gap-3">
                <Phone size={16} color="#ffffff" />
                <Text className="text-white">Call Emergency Contact</Text>
              </View>
            </Button>
          </View>
          <View className="mt-4">
            <Button type="ghost" onPress={() => setShowEmergencyDialog(false)}>
              <Text className="text-white">Cancel</Text>
            </Button>
          </View>
        </View>
      </Dialog>

      {/* Dialogs */}
      <CreateLeaseDialog
        open={showCreateLeaseDialog}
        onOpenChange={setShowCreateLeaseDialog}
      />

      <LeaseDetailsDialog
        leaseId={selectedLeaseId}
        open={showLeaseDetailsDialog}
        onOpenChange={setShowLeaseDetailsDialog}
        onInquire={handleInquire}
      />

      <InquiryDialog
        leaseId={selectedLeaseId}
        open={showInquiryDialog}
        onOpenChange={setShowInquiryDialog}
      />

      {/* Biometric Prompt */}
      {user?._id && (
        <BiometricPrompt
          userId={user._id}
          open={showBiometricPrompt}
          onOpenChange={setShowBiometricPrompt}
        />
      )}

      {/* Public Profile Sheet */}
      <Sheet open={showPublicProfile} onOpenChange={setShowPublicProfile}>
        <SheetContent
          side="right"
          className="w-full p-0 sm:max-w-lg"
          onClose={() => setShowPublicProfile(false)}
        >
          {publicProfileUserId && (
            <PublicProfilePage
              userId={publicProfileUserId}
              onBack={() => setShowPublicProfile(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </View>
  );
}
