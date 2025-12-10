import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { ArrowLeft, MessageSquare } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface OpenTicketsListPageProps {
  onBack: () => void;
  onViewTicket: (userId: Id<"users">, ticketId: Id<"supportTickets">) => void;
}

export default function OpenTicketsListPage({
  onBack,
  onViewTicket,
}: OpenTicketsListPageProps) {
  const openTickets = useQuery(api.support.getAllTickets, { status: "open" });

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
              Open Support Tickets
            </Text>
            <Text className="text-xs text-gray-400">
              Tickets waiting for your response
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
        {openTickets === undefined ? (
          <View className="gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </View>
        ) : openTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <View className="items-center">
                <MessageSquare
                  size={48}
                  color="#9ca3af"
                  style={{ marginBottom: 12 }}
                />
                <Text className="text-sm text-gray-400 text-center">
                  No open tickets at this time
                </Text>
              </View>
            </CardContent>
          </Card>
        ) : (
          <View className="gap-3">
            {openTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket._id}
                activeOpacity={0.8}
                onPress={() => onViewTicket(ticket.userId, ticket._id)}
              >
                <Card>
                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* Header */}
                      <View className="flex-row items-start justify-between gap-2">
                        <View className="flex-1" style={{ minWidth: 0 }}>
                          <View className="flex-row items-center gap-2 flex-wrap mb-1">
                            <Text
                              className="font-semibold text-sm text-white"
                              numberOfLines={1}
                            >
                              {ticket.subject}
                            </Text>
                            <Badge type="destructive" className="text-xs">
                              OPEN
                            </Badge>
                          </View>
                          <Text className="text-xs text-gray-400">
                            From: {ticket.userName || "Unknown"} •{" "}
                            {format(
                              new Date(ticket.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </Text>
                        </View>
                        <Badge type="default" className="text-xs">
                          {ticket.category}
                        </Badge>
                      </View>

                      {/* Message */}
                      <Text className="text-sm text-gray-400" numberOfLines={2}>
                        {ticket.message}
                      </Text>

                      {/* Action Button */}
                      <Button
                        type="outline"
                        className="w-full"
                        onPress={() => onViewTicket(ticket.userId, ticket._id)}
                      >
                        <Text className="text-white">View & Respond</Text>
                      </Button>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
