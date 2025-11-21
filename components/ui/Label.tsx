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
        "text-xs mb-1 font-semibold text-gray-800 dark:text-gray-100",
        className
      )}
    >
      {children}
    </Text>
  );
}

