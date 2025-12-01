import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Calendar, Eye, LandPlot, MapPin, Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import ListPropertyForm from "./ListPropertyForm";

interface MarketplacePanelProps {
  onLeaseClick: (leaseId: Id<"landLeases">) => void;
}

const STATES = [
  "All states",
  "Missouri",
  "Arkansas",
  "Kansas",
  "Iowa",
  "Illinois",
];
const GAME_TYPES = ["All game", "deer", "turkey", "duck", "elk"];
const LEASE_TERMS = ["All terms", "annual", "seasonal", "daily"];

export default function MarketplacePanel({
  onLeaseClick,
}: MarketplacePanelProps) {
  const [showListForm, setShowListForm] = useState(false);
  const [state, setState] = useState<string | undefined>();
  const [minAcreage, setMinAcreage] = useState<string>("");
  const [maxAcreage, setMaxAcreage] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [gameType, setGameType] = useState<string | undefined>();
  const [leaseTerm, setLeaseTerm] = useState<string | undefined>();

  const leases = useQuery(api.landLeases.browseLeases, {
    state,
    minAcreage: minAcreage ? parseFloat(minAcreage) : undefined,
    maxAcreage: maxAcreage ? parseFloat(maxAcreage) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    gameType,
    leaseTerm,
  });

  if (showListForm) {
    return <ListPropertyForm onBack={() => setShowListForm(false)} />;
  }

  if (leases === undefined) {
    return (
      <View className="gap-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header with List Button */}
      <View className="border-b border-gray-700 bg-gray-800 px-4 py-3">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-white">
            Land Leasing {"\n"}Marketplace
          </Text>
          <Button type="primary" onPress={() => setShowListForm(true)}>
            <View className="flex-row items-center gap-2">
              <Plus size={16} color="#000" />
              <Text className="text-[#000]">List A Property</Text>
            </View>
          </Button>
        </View>
        <View className="flex-row flex-wrap justify-between gap-4">
          <View className="flex-1 min-w-[150px]">
            <Label>State</Label>
            <Select
              options={STATES}
              value={state || "All states"}
              onChange={(value) =>
                setState(value === "All states" ? undefined : value)
              }
              placeholder="All states"
            />
          </View>

          <View className="flex-1 min-w-[150px]">
            <Label>Game Type</Label>
            <Select
              options={GAME_TYPES}
              value={gameType || "All game"}
              onChange={(value) =>
                setGameType(value === "All game" ? undefined : value)
              }
              placeholder="All game"
            />
          </View>

          <View className="flex-1 min-w-[150px]">
            <Label>Lease Term</Label>
            <Select
              options={LEASE_TERMS}
              value={leaseTerm || "All terms"}
              onChange={(value) =>
                setLeaseTerm(value === "All terms" ? undefined : value)
              }
              placeholder="All terms"
            />
          </View>

          <View className="flex-1 min-w-[150px]">
            <Label>Min Acreage</Label>
            <Input
              placeholder="Min acres"
              value={minAcreage}
              onChangeText={setMinAcreage}
              keyboardType="numeric"
            />
          </View>

          <View className="flex-1 min-w-[150px]">
            <Label>Max Acreage</Label>
            <Input
              placeholder="Max acres"
              value={maxAcreage}
              onChangeText={setMaxAcreage}
              keyboardType="numeric"
            />
          </View>

          <View className="flex-1 min-w-[150px]">
            <Label>Max Price/Year</Label>
            <Input
              placeholder="Max price"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Button
          type="outline"
          className="mt-6"
          onPress={() => {
            setState(undefined);
            setMinAcreage("");
            setMaxAcreage("");
            setMaxPrice("");
            setGameType(undefined);
            setLeaseTerm(undefined);
          }}
        >
          <Text className="text-white">Clear Filters</Text>
        </Button>
      </View>

      {/* Listings */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {leases.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LandPlot size={48} color="#9ca3af" />
              </EmptyMedia>
              <EmptyTitle>No leases found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your filters or check back later for new listings
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <View className="gap-4">
            {leases.map((lease) => (
              <Card key={lease._id} onPress={() => onLeaseClick(lease._id)}>
                <CardHeader className="pb-3">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <CardTitle className="text-white">
                        {lease.title}
                      </CardTitle>
                      <CardDescription className="mt-1 flex-row items-center gap-1">
                        <MapPin size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-400">
                          {lease.state}
                          {lease.address && ` • ${lease.address}`}
                        </Text>
                      </CardDescription>
                    </View>
                    <View className="ml-2 items-end">
                      <Text className="text-lg font-bold text-white">
                        $
                        {(
                          lease.price ||
                          lease.pricePerYear ||
                          0
                        ).toLocaleString()}
                      </Text>
                      <Text className="text-xs text-gray-400">per year</Text>
                    </View>
                  </View>
                </CardHeader>
                <CardContent>
                  <Text
                    className="mb-3 text-sm text-gray-400"
                    numberOfLines={2}
                  >
                    {lease.description}
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center gap-1">
                      <LandPlot size={16} color="#9ca3af" />
                      <Text className="text-sm text-gray-400">
                        {lease.acreage} acres
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Calendar size={16} color="#9ca3af" />
                      <Text className="text-sm capitalize text-gray-400">
                        {lease.leaseTerm}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Eye size={16} color="#9ca3af" />
                      <Text className="text-sm text-gray-400">
                        {lease.views} views
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 flex-row flex-wrap gap-1">
                    {(lease.gameTypes || []).slice(0, 3).map((game) => (
                      <View
                        key={game}
                        className="rounded-full bg-[#ff6800]/10 px-2 py-0.5"
                      >
                        <Text className="text-xs font-medium capitalize text-[#ff6800]">
                          {game}
                        </Text>
                      </View>
                    ))}
                    {(lease.gameTypes?.length || 0) > 3 && (
                      <View className="rounded-full bg-gray-700 px-2 py-0.5">
                        <Text className="text-xs font-medium text-gray-400">
                          +{(lease.gameTypes?.length || 0) - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
