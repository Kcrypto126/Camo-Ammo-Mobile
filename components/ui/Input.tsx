import clsx from "clsx";
import { TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  className = "",
  ...rest
}: InputProps) {
  return (
    <TextInput
      className={clsx(
        "border px-3 py-2 rounded-lg text-base bg-gray-50 dark:bg-gray-800",
        className
      )}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      {...rest}
    />
  );
}

