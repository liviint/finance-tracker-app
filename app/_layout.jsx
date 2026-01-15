import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import ReduxProvider from '@/store/ReduxProvider';
import { useEffect, useState } from 'react';
import Header from '@/src/components/header';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BackHandler } from 'react-native';
import ThemeProvider from "../src/components/ThemeProvider"
import AppDataProvider from "../src/components/AppDataProvider/index"
import {authenticateUser} from "../utils/localAuthentication"

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);

  // Handle Android hardware back button
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    const unlock = async () => {
      const ok = await authenticateUser();
      setUnlocked(ok);
    };
    unlock();
}, []);

  if (!unlocked) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReduxProvider>
        <ThemeProvider >
          <AppDataProvider>
            <Stack>
              {/* Main Tabs */}
              <Stack.Screen
                name="(tabs)"
                options={{
                  header: () => <Header />,
                }}
              />

              {/* Modal screen */}
              <Stack.Screen
                name="modal"
                options={{
                  presentation: 'modal',
                  title: 'Modal',
                  header: () => <Header />,
                }}
              />
            </Stack>
          </AppDataProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
};