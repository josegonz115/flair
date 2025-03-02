import '@/global.css';
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useContext, useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { AuthProvider, AuthContext } from "@/providers/AuthProvider";
import { StatusBar } from "react-native";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import LoadingScreen from '@/screens/utils/loading';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  useEffect(() => {
      // if loading dont do anything
      if (user === null) return;

      const inAuthGroup = segments[0] === "(auth)";

      // if not logged in, redirect to auth flow
      if (user === false && !inAuthGroup) {
          router.replace("/(auth)/login");
      // logged in but in auth group, redirect to main app
      } else if (user === true && inAuthGroup) {
          router.replace("/(tabs)");
      }
  }, [user, segments]);

  if (user === null) {
    return <LoadingScreen />;
  }

  return children;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <AuthProvider>
      <AuthGuard>
        <SafeAreaProvider>
          <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SafeAreaView edges={['top']} className='flex-1 bg-white'>
            <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
              </SafeAreaView>
            </ThemeProvider>
          </GluestackUIProvider>
        </SafeAreaProvider>
      </AuthGuard>
    </AuthProvider>
  );
}


