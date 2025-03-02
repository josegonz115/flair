import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    FlatList,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ActivityIndicator,
    Alert,
} from "react-native";
import {
    Home,
    LayoutGrid,
    Plus,
    ShoppingBag,
    User,
    Trash2,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
} from "@/components/ui/modal";
import {
    useToast,
    Toast,
    ToastTitle,
    ToastDescription,
} from "@/components/ui/toast";
import { X } from "lucide-react-native";
import { useFashionFinderStore } from "@/store/fashion-finder";
import { ScrapeBoardResponse } from "@/types/api";
import { getImagesFromBoardUrl, extractBoardInfo } from "@/lib/bucket";

const boards = ["by you", "classy", "edgy"];

export default function BrowseTab() {
    const [selectedBoard, setSelectedBoard] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [pinterestUrl, setPinterestUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { height: screenHeight } = Dimensions.get("window");
    const flatListRef = useRef<FlatList>(null!);
    const [currentIndex, setCurrentIndex] = useState(0);
    const toast = useToast();
    const [boardImages, setBoardImages] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const {
        recentBoards,
        currentBoard,
        isLoading: storeIsLoading,
        error,
        scrapeBoard,
        setCurrentBoard,
        removeBoard,
        fetchUserBoards,
    } = useFashionFinderStore();

    useEffect(() => {
        fetchUserBoards();
    }, []);

    const fetchBoardImages = async (boardUrl: string) => {
        setLoadingImages(true);
        setBoardImages([]);

        try {
            console.log("Fetching images for board URL:", boardUrl);
            const { username, boardName } = extractBoardInfo(boardUrl);
            console.log(
                `Extracted username: ${username}, boardName: ${boardName}`
            );

            const images = await getImagesFromBoardUrl(boardUrl);
            console.log(`Found ${images.length} images for board`);

            if (images.length > 0) {
                console.log("First image URL:", images[0]);
            }

            setBoardImages(images);
        } catch (error) {
            console.error("Error fetching board images:", error);
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>
                            Failed to load board images
                        </ToastDescription>
                    </Toast>
                ),
            });
            setBoardImages([]);
        } finally {
            setLoadingImages(false);
        }
    };

    useEffect(() => {
        if (currentBoard) {
            console.log("Current board detected:", currentBoard);
            // eg. https://www.pinterest.com/thammili/fashion/
            fetchBoardImages(currentBoard.url);
        }
    }, [currentBoard]);

    // useEffect(() => {
    //     if (boardImages.length > 0) {
    //         flatListRef.current?.scrollToOffset({
    //             offset: 380,
    //             animated: false,
    //         });
    //     }
    // }, [boardImages]);

    const handleSubmitPinterestUrl = async () => {
        if (!pinterestUrl.trim()) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>
                            Please enter a valid Pinterest URL
                        </ToastDescription>
                    </Toast>
                ),
            });
            return;
        }

        setIsLoading(true);
        try {
            console.log("helloo"); //TESTING
            const data: ScrapeBoardResponse = await scrapeBoard(
                pinterestUrl,
                true
            );
            console.log("scraping board:", data); //TESTING

            // Then set it as the current board (this will also add it to recent boards)
            if (data && data.board_info) {
                await setCurrentBoard(pinterestUrl, data.board_info.title);

                toast.show({
                    placement: "top",
                    render: ({ id }) => (
                        <Toast nativeID={id} action="success" variant="solid">
                            <ToastTitle>Success</ToastTitle>
                            <ToastDescription>
                                Board added successfully!
                            </ToastDescription>
                        </Toast>
                    ),
                });
                setPinterestUrl("");
                setModalVisible(false);

                if (data.board_info.title) {
                    setSelectedBoard(data.board_info.title);
                }
            }
        } catch (error) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>
                            {error instanceof Error
                                ? error.message
                                : "Failed to add board"}
                        </ToastDescription>
                    </Toast>
                ),
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle long press on a board to show delete confirmation
    const handleBoardLongPress = (boardId: string, boardTitle: string) => {
        Alert.alert(
            "Remove Board",
            `Are you sure you want to remove "${boardTitle}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeBoard(boardId);
                            toast.show({
                                placement: "top",
                                render: ({ id }) => (
                                    <Toast
                                        nativeID={id}
                                        action="success"
                                        variant="solid"
                                    >
                                        <ToastTitle>Success</ToastTitle>
                                        <ToastDescription>
                                            Board removed successfully
                                        </ToastDescription>
                                    </Toast>
                                ),
                            });

                            // If the removed board was selected, reset selection
                            if (currentBoard && currentBoard.id === boardId) {
                                setSelectedBoard("");
                            }
                        } catch (error) {
                            toast.show({
                                placement: "top",
                                render: ({ id }) => (
                                    <Toast
                                        nativeID={id}
                                        action="error"
                                        variant="solid"
                                    >
                                        <ToastTitle>Error</ToastTitle>
                                        <ToastDescription>
                                            Failed to remove board
                                        </ToastDescription>
                                    </Toast>
                                ),
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleBoardSelect = async (
        boardId: string,
        url: string,
        title: string
    ) => {
        try {
            console.log(`Selecting board: ${title} (${url})`);
            await setCurrentBoard(url, title);
            setSelectedBoard(title);
            setBoardImages([]);
        } catch (error) {
            console.error("Error selecting board:", error);
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={id} action="error" variant="solid">
                        <ToastTitle>Error</ToastTitle>
                        <ToastDescription>
                            Failed to select board
                        </ToastDescription>
                    </Toast>
                ),
            });
        }
    };

    return (
        <View className="flex-1 bg-white ">
            {/* Header */}
            <View className="px-4 pt-12 pb-2">
                <Text className="text-2xl font-bold">Your Boards</Text>
            </View>

            {/* Board selector */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                className="mb-4 max-h-8"
            >
                {recentBoards.map((board) => (
                    <TouchableOpacity
                        key={board.id}
                        onPress={() =>
                            handleBoardSelect(board.id, board.url, board.title)
                        }
                        onLongPress={() =>
                            handleBoardLongPress(board.id, board.title)
                        }
                        delayLongPress={500}
                        className={`mr-4 px-4 py-2 rounded-full  max-h-8 ${
                            selectedBoard === board.title
                                ? "bg-black"
                                : "bg-gray-200"
                        }`}
                    >
                        <Text
                            className={`${
                                selectedBoard === board.title
                                    ? "text-white"
                                    : "text-black"
                            }`}
                        >
                            {board.title}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Add Board Button */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="flex-row items-center px-4 py-2 rounded-full bg-gray-200 max-h-8"
                >
                    <Plus size={16} color="black" />
                    <Text className="ml-1">Add Board</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Content area */}
            <View className="flex-1 px-4">
                {storeIsLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#000" />
                        <Text className="mt-2">Loading boards...</Text>
                    </View>
                ) : recentBoards.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-lg text-gray-500">
                            No boards yet
                        </Text>
                        <Text className="text-gray-500 mb-4">
                            Add a Pinterest board URL to get started
                        </Text>
                        <Button onPress={() => setModalVisible(true)}>
                            <Text className="text-black">+ Add Board</Text>
                        </Button>
                    </View>
                ) : !selectedBoard ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-lg text-gray-500">
                            Select a board to view
                        </Text>
                    </View>
                ) : (
                    <View className="flex-1">
                        {/* Display board items in a FlatList */}
                        {loadingImages ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#000" />
                                <Text className="mt-2">Loading images...</Text>
                            </View>
                        ) : (
                            <ScrollView
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={{ paddingVertical: 20, display: 'flex', gap: 8 }}
                            >
                                {boardImages.length === 0 ? (
                                    <View className="justify-center items-center py-10">
                                        <Text className="text-gray-500">
                                            No pins found in this board
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="flex-1">
                                        {boardImages.map((item, index) => (
                                            <TouchableOpacity
                                                key={item || index.toString()}
                                                className="m-1 max-w-[90%] aspect-square mx-auto"
                                                onPress={() => {
                                                    console.log(
                                                        "Pin selected:",
                                                        item
                                                    );
                                                }}
                                            >
                                                <Image
                                                    source={{ uri: item }}
                                                    className="w-full h-full rounded-md "
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                )}
            </View>

            {/* Add board Modal */}
            <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
                <ModalBackdrop />
                <ModalContent className="bg-zinc-800 border border-zinc-700 rounded-xl">
                    <ModalHeader>
                        <Text className="text-xl font-semibold text-white">
                            Add Pinterest Board
                        </Text>
                        <ModalCloseButton>
                            <X size={24} color="#fff" />
                        </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody>
                        <Text className="mb-2 text-white">
                            Enter Pinterest board URL:
                        </Text>
                        <Input>
                            <InputField
                                placeholder="https://pinterest.com/username/boardname"
                                value={pinterestUrl}
                                onChangeText={setPinterestUrl}
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="text-white"
                                placeholderTextColor="#9ca3af"
                            />
                        </Input>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="outline"
                            className="mr-2 border-zinc-400"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-zinc-200">Cancel</Text>
                        </Button>
                        <Button
                            disabled={isLoading}
                            onPress={handleSubmitPinterestUrl}
                            className="bg-slate-500"
                        >
                            {isLoading ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                        className="mr-2"
                                    />
                                    <Text className="text-white">
                                        Loading...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-white">Add Board</Text>
                            )}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </View>
    );
}
