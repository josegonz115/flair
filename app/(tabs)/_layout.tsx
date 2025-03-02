import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Foundation from '@expo/vector-icons/Foundation';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
            backgroundColor: '#F3F3F3',
          },
          default: {
            backgroundColor: '#F3F3F3',
          }
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarLabel: '', tabBarIcon: ({ color }) => <Foundation name="home" size={30} color='#222222' />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          tabBarLabel: '', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="wardrobe-outline" size={30} color='#222222' />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: '', tabBarIcon: ({ color }) => <AntDesign name="plus" size={30} color='#222222' />,
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          tabBarLabel: '', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={30} color='#222222' />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: '', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" size={30} color='#222222' />,
        }}
      />
    </Tabs>
  );
}