import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Users,
  Ban,
  CreditCard,
  ShieldCheck,
  Settings,
  Archive,
  FileText,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface ManagePageProps {
  onNavigate: (
    view:
      | "members"
      | "bans"
      | "subscriptions"
      | "administrators"
      | "permissions"
      | "archived"
      | "audit"
  ) => void;
}

export default function ManagePage({ onNavigate }: ManagePageProps) {
  const menuItems = [
    {
      id: "members" as const,
      title: "Membership Management",
      description: "View and manage all members, assign roles",
      icon: Users,
      iconColor: "#ff6800",
      bgColor: "bg-[#ff6800]/10",
    },
    {
      id: "archived" as const,
      title: "Archived Members",
      description: "View and restore archived members",
      icon: Archive,
      iconColor: "#64748b",
      bgColor: "bg-slate-500/10",
    },
    {
      id: "bans" as const,
      title: "Bans",
      description: "Manage banned users and restrictions",
      icon: Ban,
      iconColor: "#ef4444",
      bgColor: "bg-red-500/10",
    },
    {
      id: "subscriptions" as const,
      title: "Subscriptions",
      description: "View member subscriptions and billing",
      icon: CreditCard,
      iconColor: "#22c55e",
      bgColor: "bg-green-500/10",
    },
    {
      id: "administrators" as const,
      title: "Administrators",
      description: "View all admins and owners",
      icon: ShieldCheck,
      iconColor: "#f59e0b",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "permissions" as const,
      title: "Role Permissions",
      description: "Configure permissions for each role",
      icon: Settings,
      iconColor: "#a855f7",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "audit" as const,
      title: "Audit Trail",
      description: "View all member and admin activity logs",
      icon: FileText,
      iconColor: "#3b82f6",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">Manage Members</Text>
          <Text className="text-sm text-gray-400 mt-1">
            Manage users, roles, and access control
          </Text>
        </View>

        <View className="gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => onNavigate(item.id)}
              >
                <Card>
                  <CardHeader>
                    <View className="flex-row items-center gap-3">
                      <View className={`rounded-lg ${item.bgColor} p-3`}>
                        <Icon size={24} color={item.iconColor} />
                      </View>
                      <View className="flex-1">
                        <CardTitle className="text-white">{item.title}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {item.description}
                        </CardDescription>
                      </View>
                    </View>
                  </CardHeader>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
