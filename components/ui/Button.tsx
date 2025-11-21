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
  let btnClass =
    "px-4 py-2 rounded-lg flex-row items-center justify-center mt-1";
  if (type === "outline") btnClass += " border border-gray-400 bg-transparent";
  if (type === "ghost") btnClass += " bg-transparent";
  if (type === "danger") btnClass += " border border-red-500 bg-red-100";
  if (type === "primary" && !disabled) btnClass += " bg-emerald-500";
  if (disabled) btnClass += " opacity-40";
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      className={clsx(btnClass, className)}
      disabled={disabled}
    >
      {typeof children === "string" ? (
        <Text className="text-base">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

