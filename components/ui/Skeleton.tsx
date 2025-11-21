import clsx from "clsx";
import { View } from "react-native";

export const WeatherSkeleton = ({ className = "" }) => (
  <View className={clsx("bg-gray-200/10 h-24 mb-3 rounded-xl", className)} />
);

export const Skeleton = ({ className = "" }) => (
  <View className={clsx("bg-gray-200/30 rounded-lg", className)} />
);

