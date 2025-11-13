import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
    const colorScheme = useColorScheme();

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
                    height: 110,
                    paddingTop: 10,
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 2,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="chats"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color }) => <Entypo name="chat" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}