import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import '../services/i18n';
import i18next from 'i18next';

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// --- Contextos ---
type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  setColorScheme: (scheme: 'light' | 'dark') => void;
};
export const ThemeContext = createContext<ThemeContextType | null>(null);
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  return context;
}

type LanguageContextType = {
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
};
export const LanguageContext = createContext<LanguageContextType | null>(null);
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  return context;
}

// --- Componente de navegación principal ---
function RootLayoutNav() {
  const { accessToken, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation('info-profile');

  const { colorScheme, setColorScheme } = useTheme();
  const { language, setLanguage: setGlobalLanguage } = useLanguage();

  // Redirección según Auth
  useEffect(() => {
    if (isLoading) return;

    if (!accessToken) {
      router.replace('/');
    } else {
      router.replace('/(tabs)');
    }
  }, [accessToken, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GluestackUIProvider mode={colorScheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Auth */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="forgot_password" options={{ headerShown: false }} />
          <Stack.Screen name="change_password" options={{ headerShown: false }} />

          {/* Recuperar contraseña */}
          <Stack.Screen name="forgot-password/index" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password/reset" options={{ headerShown: false }} />
          <Stack.Screen name="forgot-password/verify" options={{ headerShown: false }} />

          {/* Protegidas */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="user_profile" options={{ title: t('title') }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: true, title: 'Publicacion' }} />
          <Stack.Screen name="post/create" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="chat/add-friends" options={{ headerShown: false }} />
          <Stack.Screen name="achievements" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  const [colorScheme, setColorSchemeState] = useState<'light' | 'dark'>('dark');
  const [language, _setLanguage] = useState<'en' | 'es'>(i18next.language as 'en' | 'es');

  // --- Memoizar setters para evitar loop ---
  const setColorScheme = useCallback((scheme: 'light' | 'dark') => {
    setColorSchemeState(scheme);
  }, []);

  const setLanguage = useCallback((lang: 'en' | 'es') => {
    i18next.changeLanguage(lang);
    _setLanguage(lang);
  }, []);

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <RootLayoutNav />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </AuthProvider>
  );
}
