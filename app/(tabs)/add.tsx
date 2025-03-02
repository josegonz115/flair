"use client";

import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
} from "react-native";

import {
    CameraView,
    CameraType,
    FlashMode,
    useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useFashionFinderStore } from "@/store/fashion-finder";
import { Button } from "@/components/ui/button";
import { Text as GlueText } from "@/components/ui/text";
import { Image as ImageIcon, X, ArrowLeft, Check } from "lucide-react-native";
import { uploadUserItem } from "@/lib/bucket";

export default function AddScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [cameraType, setCameraType] = useState<CameraType>("back");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [flashMode, setFlashMode] = useState<FlashMode>("off");
    const [tempImages, setTempImages] = useState<string[]>([]);
    const cameraRef = useRef<CameraView>(null!);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addPersonalItem, isLoading } = useFashionFinderStore();


    useEffect(() => {
        (async () => {
            try {
                const initialPermission = await requestPermission();
                console.log('Camera permission status:', initialPermission);
                
                if (!initialPermission.granted) {
                    setPermissionError('Camera permission was denied');
                }
            } catch (error) {
                console.error('Error requesting camera permission:', error);
                setPermissionError('Failed to request camera permission');
            }
        })();
    }, []);

    // DEBUGING
    useEffect(() => {
        console.log('Camera permission:', permission);
        console.log('Camera type:', cameraType);
        console.log('Camera ref:', cameraRef.current);
    }, [permission, cameraType]);

    useEffect(() => {
        console.log('Camera mounted');
        return () => console.log('Camera unmounted');
    }, []);
    

    if (!permission) {
        return (
            <View className="flex-1 bg-[#F3F3F3] justify-center items-center">
                <ActivityIndicator size="large" color="#222" />
                <Text className="mt-4">Checking camera permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#F3F3F3] justify-center items-center gap-4">
                <Text className="text-base text-[#FF3B30] mb-5">
                    {permissionError || 'No access to camera'}
                </Text>
                <Button 
                    onPress={async () => {
                        try {
                            const result = await requestPermission();
                            console.log('Permission request result:', result);
                        } catch (error) {
                            console.error('Error requesting permission:', error);
                            setPermissionError('Failed to request permission');
                        }
                    }} 
                    className="bg-slate-500"
                >
                    <GlueText className="text-white">Grant Permission</GlueText>
                </Button>
                <Button onPress={() => router.back()} className="mt-3 bg-slate-500">
                    <GlueText className="text-white">Go Back</GlueText>
                </Button>
            </View>
        );
    }


    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                
                if (!photo || !photo.uri) {
                    console.error('Failed to capture photo: photo data is missing');
                    alert('Failed to capture photo. Please try again.');
                    return;
                }
                
                setCapturedImage(photo.uri);
                setIsPreview(true);
            } catch (error) {
                console.error("Error taking picture:", error);
                alert('Failed to capture photo. Please try again.');
            }
        } else {
            console.error('Camera reference is not available');
            alert('Camera is not ready. Please try again.');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCapturedImage(result.assets[0].uri);
            setIsPreview(true);
        }
    };

    const cancelPreview = () => {
        setCapturedImage(null);
        setIsPreview(false);
    };

    // const saveImage = async () => {
    //     if (capturedImage) {
    //         setIsSaving(true);
    //         // Add to temporary images first
    //         setTempImages([...tempImages, capturedImage]);

    //         try {
    //             // Upload to storage and add to personal items collection
    //             await addPersonalItem(
    //                 capturedImage,
    //                 "New Clothing Item",
    //                 "Added from camera",
    //                 ["clothing"]
    //             );
    //             setCapturedImage(null);
    //             setIsPreview(false);
    //         } catch (error) {
    //             console.error("Error saving image:", error);
    //             alert("Failed to save the image");
    //         } finally {
    //             setIsSaving(false);
    //         }
    //     }
    // };
    const saveImage = async () => {
        if (capturedImage) {
            setIsSaving(true);
            setTempImages([...tempImages, capturedImage]);
    
            try {
                const fileResponse = await fetch(capturedImage);
                const blob = await fileResponse.blob();
                const file = new File([blob], `item-${Date.now()}.jpg`, { 
                    type: 'image/jpeg' 
                });
    
                const { userId } = useFashionFinderStore.getState();
                if (!userId) {
                    throw new Error("User not logged in");
                }
                
                const imageUrl = await uploadUserItem(file, userId);
                
                if (!imageUrl) {
                    throw new Error("Failed to upload image");
                }
                
                await addPersonalItem(
                    imageUrl,
                    "New Clothing Item",
                    "Added from camera",
                    ["clothing"]
                );
                
                setCapturedImage(null);
                setIsPreview(false);
            } catch (error) {
                console.error("Error saving image:", error);
                alert("Failed to save the image");
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (!permission) {
        return (
            <View className="flex-1 bg-[#F3F3F3] justify-center items-center">
                <ActivityIndicator size="large" color="#222" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#F3F3F3] justify-center items-center gap-4">
                <Text className="text-base text-[#FF3B30] mb-5">
                    No access to camera
                </Text>
                <Button onPress={requestPermission} className="bg-slate-500 ">
                    <GlueText className="text-white">Grant Permission</GlueText>
                </Button>
                <Button onPress={() => router.back()} className="mt-3 bg-slate-500">
                    <GlueText className="text-white">Go Back</GlueText>
                </Button>
            </View>
        );
    }

    if (isPreview && capturedImage) {
        return (
            <View
                className="flex-1 bg-[#F3F3F3]"
                style={{ paddingBottom: insets.bottom * 2.5 }}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar style="light" />

                <View className="flex-row items-center p-4">
                    <TouchableOpacity className="p-2" onPress={cancelPreview}>
                        <ArrowLeft size={24} color="#222" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 mx-4 rounded-3xl overflow-hidden">
                    <Image
                        source={{ uri: capturedImage }}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />
                </View>

                <View className="flex-row justify-around items-center py-5 px-8">
                    <TouchableOpacity
                        className="flex-row items-center justify-center p-3 rounded-lg bg-[#E0E0E0] w-[120px]"
                        onPress={cancelPreview}
                    >
                        <X size={24} color="#222" />
                        <Text className="ml-2 text-base font-medium text-[#222222]">
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center p-3 rounded-lg bg-[#E0E0E0] w-[120px]"
                        onPress={saveImage}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Check size={24} color="#222" />
                                <Text className="ml-2 text-base font-medium text-[#222222]">
                                    Save
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {tempImages.length > 0 && (
                    <ScrollView
                        horizontal={true}
                        className="h-[120px] bg-white rounded-t-[20px]"
                        contentContainerStyle={{ padding: 12, gap: 12 }}
                    >
                        {tempImages.map((img, index) => (
                            <View
                                key={index}
                                className="w-[90px] h-[90px] rounded-xl overflow-hidden border border-[#E0E0E0]"
                            >
                                <Image
                                    source={{ uri: img }}
                                    className="w-full h-full"
                                />
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        );
    }

    return (
        <View
            className="flex-1 bg-[#F3F3F3] mb-20"
            style={{ paddingTop: insets.bottom }}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View className="flex-row items-center p-4 ">
                <TouchableOpacity className="p-2" onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#222" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold ml-3 text-[#222222]">
                    Add Item
                </Text>
            </View>

            <View className="flex-1 mx-4 rounded-3xl overflow-hidden">
                <CameraView
                    ref={cameraRef}
                    className="flex-1 bg-black justify-center items-center" 
                    style={{ height: '100%', width: '100%' }} 
                    facing={cameraType}
                    flash={flashMode}
                />
            </View>

            <View className="flex-row justify-around items-center py-5 px-8">
                <TouchableOpacity
                    className="w-[50px] h-[50px] rounded-full bg-[#E0E0E0] justify-center items-center"
                    onPress={pickImage}
                >
                    <ImageIcon size={24} color="#222" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[70px] h-[70px] rounded-full bg-white border-[5px] border-[#E0E0E0] justify-center items-center"
                    onPress={takePicture}
                >
                    <View className="w-[54px] h-[54px] rounded-full bg-[#222222]" />
                </TouchableOpacity>

                <View className="w-[50px] h-[50px]" />
            </View>

            {tempImages.length > 0 && (
                <ScrollView
                    horizontal={true}
                    className="h-[120px] bg-white rounded-t-[20px]"
                    contentContainerStyle={{ padding: 12, gap: 12 }}
                >
                    {tempImages.map((img, index) => (
                        <View
                            key={index}
                            className="w-[90px] h-[90px] rounded-xl overflow-hidden border border-[#E0E0E0]"
                        >
                            <Image
                                source={{ uri: img }}
                                className="w-full h-full"
                            />
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
