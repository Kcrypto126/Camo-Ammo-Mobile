import clsx from "clsx";
import { Text } from "react-native";

interface LabelProps {
  children: React.ReactNode;
  className?: string;
}

export function Label({ children, className = "" }: LabelProps) {
  return (
    <Text
      className={clsx(
        "text-sm mb-1 font-semibold text-white",
        className
      )}
    >
      {children}
    </Text>
  );
}

