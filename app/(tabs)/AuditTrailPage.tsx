import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api.js";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { ArrowLeft, FileText, Filter, Search } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

interface AuditTrailPageProps {
  onBack: () => void;
}

export default function AuditTrailPage({ onBack }: AuditTrailPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const logs = useQuery(api.audit.searchAuditLogs, {
    searchTerm: debouncedSearch || undefined,
    entityType: entityTypeFilter === "all" ? undefined : entityTypeFilter,
    limit: 200,
  });

  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
  };

  const getEntityTypeBadgeVariant = (
    type: string
  ): "default" | "secondary" | "outline" => {
    switch (type) {
      case "profile":
        return "default";
      case "user":
        return "secondary";
      case "hunt":
      case "friend":
      case "scouting":
        return "outline";
      default:
        return "secondary";
    }
  };

  const entityTypeOptions = [
    "all",
    "profile",
    "user",
    "hunt",
    "friend",
    "scouting",
  ];

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Button type="ghost" onPress={onBack} className="!px-0 !py-0">
            <ArrowLeft size={16} color="#ffffff" />
          </Button>
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">Audit Trail</Text>
            <Text className="text-xs text-gray-400">
              Track all changes made by members and admins
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View className="border-b border-gray-700 bg-gray-800 p-4 gap-3">
        <View className="flex-row gap-2">
          <View className="flex-1 relative">
            <View
              className="absolute left-3 top-1/2"
              style={{ transform: [{ translateY: -8 }] }}
            >
              <Search size={16} color="#9ca3af" />
            </View>
            <TextInput
              placeholder="Search by name, email, phone, or member number..."
              placeholderTextColor="#9ca3af"
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={handleSearch}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white"
              style={{ color: "#ffffff" }}
            />
          </View>
          <Button onPress={handleSearch} type="primary">
            <Text className="text-white">Search</Text>
          </Button>
        </View>

        <View className="flex-row gap-2 items-center">
          <Filter size={16} color="#9ca3af" />
          <Select
            options={entityTypeOptions.map((opt) =>
              opt === "all"
                ? "All Types"
                : opt.charAt(0).toUpperCase() + opt.slice(1)
            )}
            value={
              entityTypeFilter === "all"
                ? "All Types"
                : entityTypeFilter.charAt(0).toUpperCase() +
                  entityTypeFilter.slice(1)
            }
            onChange={(value) => {
              const selectedValue = entityTypeOptions.find(
                (opt) =>
                  (opt === "all"
                    ? "All Types"
                    : opt.charAt(0).toUpperCase() + opt.slice(1)) === value
              );
              setEntityTypeFilter(selectedValue || "all");
            }}
            placeholder="Filter by type"
            className="flex-1"
          />
        </View>
      </View>

      {/* Results */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {logs === undefined ? (
          <View className="gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </View>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <View className="items-center">
                <FileText
                  size={48}
                  color="#9ca3af"
                  style={{ marginBottom: 12 }}
                />
                <Text className="text-sm text-gray-400 text-center">
                  {searchTerm || entityTypeFilter !== "all"
                    ? "No audit logs match your search criteria"
                    : "No audit logs found"}
                </Text>
              </View>
            </CardContent>
          </Card>
        ) : (
          <View className="gap-3">
            {logs.map((log) => (
              <Card key={log._id}>
                <CardContent className="p-4">
                  <View className="gap-2">
                    {/* Header */}
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1" style={{ minWidth: 0 }}>
                        <View className="flex-row items-center gap-2 flex-wrap mb-1">
                          <Text className="font-semibold text-white">
                            {log.userName}
                          </Text>
                          {log.memberNumber && (
                            <Badge type="default" className="text-xs">
                              <Text className="text-yellow-500">
                                {log.memberNumber}
                              </Text>
                            </Badge>
                          )}
                        </View>
                        <Text className="text-xs text-gray-400">
                          {log.userEmail}
                        </Text>
                      </View>
                      <Badge
                        type={
                          getEntityTypeBadgeVariant(log.entityType) as
                            | "success"
                            | "default"
                            | "secondary"
                            | "destructive"
                        }
                      >
                        <Text className="text-xs">{log.entityType}</Text>
                      </Badge>
                    </View>

                    {/* Action */}
                    <View>
                      <Text className="text-sm font-medium text-white">
                        {log.action}
                      </Text>
                      {log.changes && (
                        <Text className="text-xs text-gray-400 mt-1">
                          Changed: {log.changes}
                        </Text>
                      )}
                    </View>

                    {/* Timestamp */}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-400">
                        {format(
                          new Date(log.timestamp),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Results count */}
        {logs && logs.length > 0 && (
          <View className="pt-4">
            <Text className="text-center text-sm text-gray-400">
              Showing {logs.length} {logs.length === 1 ? "result" : "results"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
