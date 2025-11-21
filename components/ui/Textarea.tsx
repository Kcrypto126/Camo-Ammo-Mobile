import clsx from "clsx";
import { TextInput, TextInputProps } from "react-native";

interface TextareaProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function Textarea({
  value,
  onChangeText,
  placeholder,
  className = "",
  ...rest
}: TextareaProps) {
  return (
    <TextInput
      className={clsx(
        "border px-3 py-2 rounded-lg h-20 text-base bg-gray-50 dark:bg-gray-800",
        className
      )}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline
      textAlignVertical="top"
      placeholderTextColor="#aaa"
      {...rest}
    />
  );
}

