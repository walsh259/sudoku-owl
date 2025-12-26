import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../contexts';
import { loadSounds, unloadSounds } from '../utils/sounds';
import { initializeAds } from '../utils/ads';

function RootLayoutContent() {
  const { colors, nightMode } = useTheme();

  // Load sounds and initialize ads on app startup
  useEffect(() => {
    loadSounds();
    initializeAds();
    return () => {
      unloadSounds();
    };
  }, []);

  return (
    <>
      <StatusBar style={nightMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Sudoku Owl',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="game"
          options={{
            title: 'Play',
            headerBackTitle: 'Menu',
          }}
        />
        <Stack.Screen
          name="stats"
          options={{
            title: 'Statistics',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
