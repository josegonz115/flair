import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { useFashionFinderStore } from "@/store/fashion-finder";
import { getUserItems } from "@/lib/bucket";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 4) / 2;

type ClothingItem = {
    id: string;
    source: {
      uri: string;
    };
  };
  
  type Outfit = {
    id: string;
    items: ClothingItem[];
  };

export default function WardrobePage() {
    const { userId, personalItems, fetchPersonalItems } =
        useFashionFinderStore();
    const [userItemImages, setUserItemImages] = useState<string[]>([]);

    useEffect(() => {
        fetchPersonalItems();
    }, []);

    useEffect(() => {
        const loadUserItems = async () => {
            if (userId) {
                const images = await getUserItems(userId);
                setUserItemImages(images);
            }
        };

        loadUserItems();
    }, [userId]);

    const userOutfits: Outfit[] = React.useMemo(() => {
        return personalItems.map((item) => ({
          id: item.id,
          items: [{ id: item.id, source: { uri: item.image_url } }],
        }));
      }, [personalItems]);

    // Fallback to mock data if no personal items exist
    const outfits: Outfit[] = userOutfits.length > 0 ? userOutfits : [];

    // Render each outfit card
    const renderOutfitCard = ({ item }: { item: Outfit }) => {
        return (
            <TouchableOpacity
                className="bg-[#d9d9d9] rounded-2xl overflow-hidden p-3"
                style={{
                    width: CARD_WIDTH,
                    margin: CARD_MARGIN,
                    aspectRatio: 1,
                }}
            >
                <View className="flex-1 flex-row flex-wrap justify-center items-center">
                    {item.items.map((clothingItem) => (
                        <Image
                            key={clothingItem.id}
                            source={clothingItem.source}
                            className="w-[45%] h-[45%] m-[2.5%]"
                            resizeMode="contain"
                        />
                    ))}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Profile and Tabs Section */}
            <View className="flex-row items-center px-4 pt-4 pb-2">
                <Image
                    source={require("../../assets/images/grunge1.jpeg")}
                    className="w-20 h-20 rounded-full"
                />

                <View className="flex-1 flex-row justify-center ml-4">
                    <View className="items-center py-2 px-4">
                        <Text className="text-lg font-medium text-black mb-1">
                            saved
                        </Text>
                        <View className="h-0.5 w-full bg-black" />
                    </View>
                </View>
            </View>

            {/* Outfit Grid */}
            <FlatList
                data={outfits}
                renderItem={renderOutfitCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{ padding: CARD_MARGIN }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8">
                        <Text className="text-lg text-gray-500 text-center">
                            No saved items yet. Add some clothing items to your
                            wardrobe!
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}