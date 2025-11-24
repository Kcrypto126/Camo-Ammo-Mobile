import clsx from "clsx";
import { Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "default" | "outline" | "ghost" | "danger" | "primary";
  disabled?: boolean;
}

export function Button({
  onPress,
  children,
  className = "",
  type = "default",
  disabled,
}: ButtonProps) {
  let btnClass = "px-5 py-2 rounded-lg flex-row items-center justify-center";
  let textClass = "";

  if (type === "primary") {
    btnClass += " bg-[#ff6800] border border-[#ff6800]";
    textClass += " text-white font-semibold";
  }
  if (type === "outline") {
    btnClass += " border border-gray-600 bg-gray-700";
    textClass += " text-white";
  }
  if (type === "ghost") {
    btnClass += " bg-transparent";
    textClass += " text-white";
  }
  if (type === "danger") {
    btnClass += " border border-red-500 bg-red-900/30";
    textClass += " text-red-400";
  }
  if (type === "default") {
    textClass += " text-white";
  }
  if (disabled) {
    btnClass += " opacity-40";
  }

  // Remove mt-1 from all button variants for flush top/bottom padding

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      className={clsx(btnClass, className)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {typeof children === "string" ? (
        <Text className={textClass}>{children}</Text>
      ) : (
        // If children is an element (like icon + text), inject styling into nested Text if needed
        children
      )}
    </TouchableOpacity>
  );
}
