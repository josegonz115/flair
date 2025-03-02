import { View, Image, TouchableOpacity } from "react-native"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react-native"


interface OutfitCardProps {
  imageUrl: string
  onPress?: () => void
}

export default function OutfitCard({ imageUrl, onPress }: OutfitCardProps) {
  return (
    <View className="mb-4 rounded-xl overflow-hidden border border-gray-200">
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri: imageUrl }} className="w-full h-96" resizeMode="cover" />
      </TouchableOpacity>

      <View className="flex-row justify-between p-3 bg-white">
        <View className="flex-row space-x-4">
          <TouchableOpacity>
            <Heart size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MessageCircle size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Bookmark size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

