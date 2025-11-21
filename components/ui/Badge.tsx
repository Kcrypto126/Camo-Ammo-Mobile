import clsx from "clsx";
import { Text, View } from "react-native";

interface BadgeProps {
  children: React.ReactNode;
  type?: "default" | "destructive" | "secondary" | "success";
  className?: string;
}

export function Badge({
  children,
  type = "default",
  className,
}: BadgeProps) {
  let colorClass = "bg-gray-200 text-gray-700";
  if (type === "destructive") colorClass = "bg-red-500/20 text-red-700";
  if (type === "secondary") colorClass = "bg-amber-400/20 text-amber-900";
  if (type === "success") colorClass = "bg-green-500/20 text-green-700";
  return (
    <View className={clsx("rounded-full px-2 py-0.5", colorClass, className)}>
      <Text className="text-xs font-semibold" numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

