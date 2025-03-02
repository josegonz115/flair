import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' }, 
        animation: 'slide_from_right',
      }}
    >
    <Stack.Screen name="login" />
    <Stack.Screen name="register" /> 
    <Stack.Screen name="forget-password" /> 
    </Stack>
  );
}