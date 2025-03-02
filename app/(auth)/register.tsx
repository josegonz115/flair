import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  useColorScheme,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { supabase } from "../../lib/supabase";
import { ButtonText, Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Link } from "expo-router";
import { router } from 'expo-router';



export default function Register() {
  const colorScheme = useColorScheme();
  const isDarkmode = colorScheme === "dark";
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function register() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      
      if (error) {
        alert(error.message);
      } else if (data.user) {
        router.replace('/(tabs)');
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
          <Center className={`flex-1 ${isDarkmode ? "bg-gray-900" : "bg-white"}`}>
            <Image
              contentFit="contain"
              className="h-[220px] w-[220px]"
              source={require("../../assets/images/register.png")}
            />
          </Center>

          <Box className={`flex-[3] px-5 pb-5 ${isDarkmode ? "bg-gray-800" : "bg-white"}`}>
            <Center>
              <Text className="text-2xl font-bold py-8">
                Register
              </Text>
            </Center>

            <VStack space="md">
              <Text>Email</Text>
              <Input
                variant="outline"
                className="mt-2"
              >
                <InputField
                  placeholder="Enter your email"
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(text) => setEmail(text)}
                />
              </Input>

              <Text className="mt-4">Password</Text>
              <Input
                variant="outline"
                className="mt-2"
              >
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
                onPress={() => register()}
              >
                <ButtonText>{loading ? "Loading..." : "Create an account"}</ButtonText>
              </Button>

              <HStack space="xs" className="mt-4 justify-center">
                <Center className="mt-2">
                    <Text>Already have an account?</Text>
                    <Link href="/forget-password" asChild>
                        <Pressable>
                            <Text className="font-bold">
                            Login here
                            </Text>
                        </Pressable>
                    </Link>
                </Center>
              </HStack>

              <Center className="mt-8">
                <TouchableOpacity>
                  <Text className="font-bold">
                    {isDarkmode ? "☀️ light theme" : "🌑 dark theme"}
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