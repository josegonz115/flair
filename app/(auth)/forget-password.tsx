import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  useColorScheme,
  // Button,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { AuthStackParamList } from "../../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ButtonText, Button } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Text } from '@/components/ui/text/index';
import { Box } from "lucide-react-native";


export default function ({
  navigation,
}: NativeStackScreenProps<AuthStackParamList, "ForgetPassword">) {
  const colorScheme = useColorScheme();
  const isDarkmode = colorScheme === "dark";
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function forget() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (!error) {
        alert("Check your email to reset your password!");
      } else {
        alert(error.message);
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
              resizeMode="contain"
              className="h-[220px] w-[220px]"
              source={require("../../../assets/images/forget.png")}
            />
          </Center>

          <Box className={`flex-[3] px-5 pb-5 ${isDarkmode ? "bg-gray-800" : "bg-white"}`}>
            <Center>
              <Text className="text-2xl font-bold py-8">
                Forgot Password
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

              <Button
                variant="solid"
                className="mt-5"
                isDisabled={loading}
                onPress={() => forget()}
              >
                <ButtonText>{loading ? "Loading..." : "Send email"}</ButtonText>
              </Button>

              <HStack space="xs" className="mt-4 justify-center">
                <Text>Already have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Login");
                  }}
                >
                  <Text className="font-bold">
                    Login here
                  </Text>
                </TouchableOpacity>
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