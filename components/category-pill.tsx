import { TouchableOpacity, Text } from "react-native"

interface CategoryPillProps {
  label: string
  isSelected: boolean
  onPress: () => void
}

export default function CategoryPill({ label, isSelected, onPress }: CategoryPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mr-2 px-4 py-2 rounded-full ${isSelected ? "bg-black" : "bg-gray-200"}`}
    >
      <Text className={`${isSelected ? "text-white" : "text-gray-800"}`}>{label}</Text>
    </TouchableOpacity>
  )
}

