import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface RadioGroupItemProps {
  value: string;
  id: string;
}

export function RadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <View className="space-y-3">
      {children}
    </View>
  );
}

export function RadioGroupItem({ value, id }: RadioGroupItemProps) {
  return null; // This is handled by the parent
}

// Helper component for radio item with label
export function RadioItem({
  value,
  selectedValue,
  onSelect,
  label,
}: {
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
  label: string;
}) {
  const isSelected = selectedValue === value;
  
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      className="flex-row items-center gap-2 py-2"
      activeOpacity={0.7}
    >
      <View
        className={`rounded-full border-2 items-center justify-center ${
          isSelected ? "border-orange-500" : "border-gray-600"
        }`}
        style={{ width: 20, height: 20 }}
      >
        {isSelected && (
          <View className="rounded-full bg-orange-500" style={{ width: 10, height: 10 }} />
        )}
      </View>
      <Text className="text-white text-sm">{label}</Text>
    </TouchableOpacity>
  );
}

