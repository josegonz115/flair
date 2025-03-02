import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    useColorScheme,
    Pressable,
} from "react-native";
import { Image } from "expo-image";
import { supabase } from "../../lib/supabase";
import { AuthStackParamList } from "../../types/navigation";
// import {
//     NativeStackScreenProps,
// } from "@react-navigation/native-stack";
import { ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text/index";
import { Button } from "@/components/ui/button/index";
import { Box } from "@/components/ui/box";
import { Link, router } from "expo-router";

export default function Login() {
    // export default function Login({
    //     navigation,
    // }: NativeStackScreenProps<AuthStackParamList, "Login">) {
    const colorScheme = useColorScheme();
    const isDarkmode = colorScheme === "dark";
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function login() {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert(error.message);
            } else if (data.user) {
                router.replace("/(tabs)");
            } else {
                alert("Check your email for the login link!");
            }
        } catch (error: any) {
            alert(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView behavior="height" className="flex-1">
            <Box className="flex-1">
                <ScrollView contentContainerClassName="grow">
                    <Center
                        className={`flex-1 ${isDarkmode ? "bg-gray-900" : "bg-white"}`}
                    >
                        <Image
                            contentFit="contain"
                            className="h-[220px] w-[220px]"
                            source={require("../../assets/images/login.png")}
                        />
                    </Center>

                    <Box
                        className={`flex-[3] px-5 pb-5 ${isDarkmode ? "bg-gray-800" : "bg-white"}`}
                    >
                        <Center>
                            <Text className="text-2xl font-bold py-8">
                                Login
                            </Text>
                        </Center>

                        <VStack space="md">
                            <Text>Email</Text>
                            <Input variant="outline" className="mt-2">
                                <InputField
                                    placeholder="Enter your email"
                                    value={email}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    onChangeText={(text) => setEmail(text)}
                                />
                            </Input>

                            <Text className="mt-4">Password</Text>
                            <Input variant="outline" className="mt-2">
                                <InputField
                                    placeholder="Enter your password"
                                    value={password}
                                    autoCapitalize="none"
                                    secureTextEntry={true}
                                    onChangeText={(text) => setPassword(text)}
                                />
                            </Input>

                            <Button
                                variant="solid"
                                className="mt-5"
                                isDisabled={loading}
                                onPress={() => login()}
                            >
                                <ButtonText>
                                    {loading ? "Loading..." : "Continue"}
                                </ButtonText>
                            </Button>

                            <HStack space="xs" className="mt-4 justify-center">
                                <Text>Don't have an account?</Text>
                                <Center className="mx-2">
                                    <Link href="/register" asChild>
                                        <Pressable>
                                            <Text className="font-bold">
                                                Register here
                                            </Text>
                                        </Pressable>
                                    </Link>
                                </Center>
                            </HStack>

                            <Center className="mt-2">
                                <Link href="/forget-password" asChild>
                                    <Pressable>
                                        <Text className="font-bold">
                                            Forgot password
                                        </Text>
                                    </Pressable>
                                </Link>
                            </Center>

                            <Center className="mt-8">
                                <TouchableOpacity>
                                    <Text className="font-bold">
                                        {isDarkmode
                                            ? "☀️ light theme"
                                            : "🌑 dark theme"}
                                    </Text>
                                </TouchableOpacity>
                            </Center>
                        </VStack>
                    </Box>
                </ScrollView>
            </Box>
        </KeyboardAvoidingView>
    );
}
