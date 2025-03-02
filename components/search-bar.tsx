import { View, TextInput, TouchableOpacity } from "react-native"
import { Search, X } from "lucide-react-native"

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onClear?: () => void
  placeholder?: string
}

export default function SearchBar({ value, onChangeText, onClear, placeholder = "Search..." }: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
      <Search size={20} color="#666" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="flex-1 ml-2 text-base"
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear}>
          <X size={18} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  )
}

