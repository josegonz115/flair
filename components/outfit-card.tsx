import { View, Text, Image, TouchableOpacity } from "react-native"
import { Heart } from "lucide-react-native"

interface OutfitCardProps {
  outfit: {
    id: number
    name: string
    image: string
    liked: boolean
    items: number
  }
  onPress: () => void
  onLike: () => void
}

export default function OutfitCard({ outfit, onPress, onLike }: OutfitCardProps) {
  return (
    <TouchableOpacity onPress={onPress} className="mb-4 rounded-lg overflow-hidden bg-white shadow-sm">
      <Image source={{ uri: outfit.image }} className="w-full h-48" resizeMode="cover" />
      <View className="p-3 flex-row justify-between items-center">
        <View>
          <Text className="font-medium text-base">{outfit.name}</Text>
          <Text className="text-gray-500 text-sm">{outfit.items} items</Text>
        </View>
        <TouchableOpacity onPress={onLike}>
          <Heart size={22} color={outfit.liked ? "#FF4D4D" : "#000"} fill={outfit.liked ? "#FF4D4D" : "none"} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

