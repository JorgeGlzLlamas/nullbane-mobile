import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const baseBarHeight = 70;
    const { t } = useTranslation('tabs');

    const activeColor = colorScheme === 'dark' 
        ? '#CDD9BA'
        : '#1A261A';
    const inactiveColor = Colors[colorScheme ?? 'light'].tabIconDefault || '#8E8E93';
    const barBackground = Colors[colorScheme ?? 'light'].background;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,

                tabBarStyle: {
                    backgroundColor: barBackground,
                    borderTopWidth: 0,
                    elevation: 0,
                    height: baseBarHeight + insets.bottom,
                    paddingTop: 10,
                    paddingBottom: insets.bottom + 5,
                },

                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 2,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: t('home'),
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="chats"
                options={{
                    title: t('chats'),
                    tabBarIcon: ({ color }) => <Entypo name="chat" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('profile'),
                    tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}