import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { ArrowLeft, Shield, UserCog, User, Info, ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface RolePermissionsPageProps {
  onBack: () => void;
}

const PERMISSION_DESCRIPTIONS: Record<
  string,
  { name: string; description: string }
> = {
  view_users: {
    name: "View Users",
    description: "Can view the list of all users and their profiles",
  },
  edit_users: {
    name: "Edit Users",
    description: "Can edit user profiles and information",
  },
  delete_users: {
    name: "Delete Users",
    description: "Can permanently delete user accounts",
  },
  ban_users: {
    name: "Ban Users",
    description: "Can ban users from the platform",
  },
  manage_roles: {
    name: "Manage Roles",
    description: "Can assign and change user roles",
  },
  moderate_forums: {
    name: "Moderate Forums",
    description: "Can moderate forum posts and comments",
  },
  moderate_marketplace: {
    name: "Moderate Marketplace",
    description: "Can review and approve marketplace listings",
  },
  manage_subscriptions: {
    name: "Manage Subscriptions",
    description: "Can manage user subscriptions and billing",
  },
  view_analytics: {
    name: "View Analytics",
    description: "Can view platform analytics and reports",
  },
};

const ROLES = [
  { id: "owner", name: "Owner", icon: Shield, color: "#ff6800" },
  {
    id: "admin",
    name: "Administrator",
    icon: UserCog,
    color: "#f59e0b",
  },
  { id: "member", name: "Member", icon: User, color: "#9ca3af" },
];

function CollapsibleSection({
  role,
  isOpen,
  onToggle,
  children,
}: {
  role: typeof ROLES[0];
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const Icon = role.icon;
  return (
    <Card>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        <CardHeader>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                className="rounded-lg bg-gray-700 p-2"
                style={{ backgroundColor: `${role.color}20` }}
              >
                <Icon size={20} color={role.color} />
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-white">{role.name}</Text>
                </View>
              </View>
            </View>
            {isOpen ? (
              <ChevronUp size={20} color="#9ca3af" />
            ) : (
              <ChevronDown size={20} color="#9ca3af" />
            )}
          </View>
        </CardHeader>
      </TouchableOpacity>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export default function RolePermissionsPage({
  onBack,
}: RolePermissionsPageProps) {
  const rolePermissions = useQuery(api.roles.getAllRolePermissions);
  const updatePermissions = useMutation(api.roles.updateRolePermissions);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(
    new Set(["owner"])
  );

  const toggleRole = (roleId: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  };

  const handleTogglePermission = async (
    role: "owner" | "admin" | "member",
    permission: string,
    currentlyHas: boolean
  ) => {
    if (!rolePermissions) return;

    const currentPermissions = rolePermissions[role] || [];
    const newPermissions = currentlyHas
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];

    setSavingRole(role);
    try {
      await updatePermissions({ role, permissions: newPermissions });
      showToast(
        `${ROLES.find((r) => r.id === role)?.name} permissions updated`
      );
    } catch (error) {
      showToast("Failed to update permissions");
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">
              Role Permissions
            </Text>
            <Text className="text-xs text-gray-400">
              Configure permissions for each role
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <Card className="border-blue-500/50 bg-blue-500/5 mb-4">
          <CardContent className="p-4">
            <View className="flex-row items-start gap-3">
              <Info size={20} color="#3b82f6" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-sm font-medium text-white">
                  Manage Role Permissions
                </Text>
                <Text className="text-sm text-gray-400 mt-1">
                  Configure what each role can do in the application. Changes
                  apply immediately to all users with that role.
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {rolePermissions === undefined ? (
          <View className="gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </View>
        ) : (
          <View className="gap-3">
            {ROLES.map((role) => {
              const permissions: string[] =
                rolePermissions[role.id as keyof typeof rolePermissions] || [];
              const allPermissions = Object.keys(PERMISSION_DESCRIPTIONS);
              const isSaving = savingRole === role.id;
              const isOpen = expandedRoles.has(role.id);
              const isOwnerRole = role.id === "owner";

              return (
                <CollapsibleSection
                  key={role.id}
                  role={role}
                  isOpen={isOpen}
                  onToggle={() => toggleRole(role.id)}
                >
                  <View className="gap-1">
                    <View className="mb-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-semibold text-white">
                          {role.name}
                        </Text>
                        <Badge type="secondary" className="text-xs">
                          <Text className="text-xs">
                            {permissions.length}{" "}
                            {permissions.length === 1
                              ? "permission"
                              : "permissions"}
                          </Text>
                        </Badge>
                      </View>
                      <Text className="text-xs text-gray-400 mt-1">
                        {role.id === "owner" &&
                          "Full system access with all permissions"}
                        {role.id === "admin" &&
                          "Elevated privileges for platform management"}
                        {role.id === "member" && "Standard user access"}
                      </Text>
                    </View>
                    {allPermissions.map((permission) => {
                      const hasPermission = permissions.includes(permission);
                      const permInfo = PERMISSION_DESCRIPTIONS[permission];

                      return (
                        <View
                          key={permission}
                          className="flex-row items-start justify-between rounded-lg border border-gray-700 bg-gray-800 p-4"
                        >
                          <View className="flex-1 gap-1">
                            <Label className="font-medium text-white">
                              {permInfo.name}
                            </Label>
                            <Text className="text-xs text-gray-400">
                              {permInfo.description}
                            </Text>
                          </View>
                          <Switch
                            value={hasPermission}
                            onValueChange={() =>
                              handleTogglePermission(
                                role.id as "owner" | "admin" | "member",
                                permission,
                                hasPermission
                              )
                            }
                            disabled={isSaving || isOwnerRole}
                          />
                        </View>
                      );
                    })}
                    {role.id === "owner" && (
                      <View className="pt-2">
                        <Text className="text-xs text-gray-400">
                          Owner permissions cannot be modified. Owners always
                          have full access.
                        </Text>
                      </View>
                    )}
                  </View>
                </CollapsibleSection>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
