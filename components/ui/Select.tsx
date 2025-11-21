import clsx from "clsx";
import { Alert, Text, TouchableOpacity } from "react-native";

interface SelectProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: SelectProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(
          placeholder || "Select",
          null,
          options.map((option) => ({
            text: option,
            onPress: () => onChange(option),
          }))
        );
      }}
      className={clsx(
        "border px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800",
        className
      )}
    >
      <Text className={value ? "text-gray-900" : "text-gray-500"}>
        {value || placeholder}
      </Text>
    </TouchableOpacity>
  );
}

