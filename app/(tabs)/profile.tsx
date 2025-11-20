import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileHeader } from '@/components/ProfileHeader';
import { MenuLinkItem } from '@/components/MenuLinkAchievements';
import { useRouter, useFocusEffect } from 'expo-router'; 
import { SettingsSwitchItem } from '@/components/SettingsSwitchItem';
import { useTranslation } from 'react-i18next';
import { Button, ButtonText } from '@/components/ui/button';
import { ActivityIndicator, Alert } from 'react-native';
import { Text } from '@/components/ui/text';

import { useTheme, useLanguage } from '../_layout';
import { useAuth } from '../../src/context/AuthContext';
// AGREGADO: AchievementWithStatus
import { User, UserSettings, ThemeOptions, LanguageOptions, AchievementWithStatus } from '../../src/types/api';
import { API_BASE_URL } from '../../src/config';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation('profile'); 

    const { setColorScheme } = useTheme(); 
    const { setLanguage: setGlobalLanguage } = useLanguage();
    const { apiFetch, logout } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    
    // --- NUEVO: Estado para el contador de logros ---
    const [achievementsSubtitle, setAchievementsSubtitle] = useState("-/-");
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    // --- MODIFICADO: Agregamos apiFetch de logros ---
                    const [userResp, settingsResp, achievementsResp] = await Promise.all([
                        apiFetch('/api/v1/users/me'),
                        apiFetch('/api/v1/settings/me'),
                        apiFetch('/api/v1/achievements/')
                    ]);

                    if (!userResp.ok || !settingsResp.ok) throw new Error('Error al cargar datos');

                    const userData: User = await userResp.json();
                    const settingsData: UserSettings = await settingsResp.json();

                    setUser(userData);
                    setSettings(settingsData);

                    // --- NUEVO: Calcular logros desbloqueados ---
                    if (achievementsResp.ok) {
                        const achievementsData: AchievementWithStatus[] = await achievementsResp.json();
                        const total = achievementsData.length;
                        const unlocked = achievementsData.filter(a => a.is_unlocked).length;
                        setAchievementsSubtitle(`${unlocked}/${total}`);
                    }

                    i18n.changeLanguage(settingsData.language);
                    setGlobalLanguage(settingsData.language);
                    setColorScheme(settingsData.theme);
                } catch (e) {
                    setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido');
                } finally {
                    setIsLoading(false);
                }
            };

            loadData();
        }, [apiFetch, setColorScheme, setGlobalLanguage])
    );

    const toggleTheme = async () => {
        if (!settings) return;
        const newTheme: ThemeOptions = settings.theme === 'dark' ? 'light' : 'dark';
        const oldSettings = settings;
        setSettings({ ...settings, theme: newTheme });

        try {
            await apiFetch('/api/v1/settings/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme })
            });
            setColorScheme(newTheme);
        } catch (e) {
            setError('Error al cambiar el tema');
            setSettings(oldSettings);
        }
    };

    const toggleLanguage = async () => {
        if (!settings) return;
        const newLang: LanguageOptions = settings.language === 'es' ? 'en' : 'es';
        const oldSettings = settings;
        setSettings({ ...settings, language: newLang });

        try {
            await apiFetch('/api/v1/settings/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: newLang })
            });
            setGlobalLanguage(newLang);
        } catch (e) {
            setError('Error al cambiar el idioma');
            setSettings(oldSettings);
        }
    };

    const handleLogout = () => logout();
    const handleEditProfileButton = () => router.push('/user_profile');
    const getFullName = () => user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : '';

    if (isLoading) {
        return (
            <Box className="flex-1 justify-center items-center bg-background-0">
                <ActivityIndicator size="large" />
            </Box>
        );
    }

    if (error || !user || !settings) {
        return (
            <Box className="flex-1 justify-center items-center p-6">
                <Text>Error: {error || 'No se pudieron cargar los datos.'}</Text>
                <Button onPress={handleLogout} className="mt-5">
                    <ButtonText>Cerrar Sesión</ButtonText>
                </Button>
            </Box>
        );
    }

    const isDarkMode = settings.theme === 'dark';
    const isSpanish = settings.language === 'es';
    const absoluteAvatarUrl = user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : '';

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ paddingTop: insets.top + 16, paddingLeft: 24, paddingRight: 24 }}
        >
            <Heading size="2xl" className="mb-4">{t('title')}</Heading>

            <ProfileHeader
                userName={getFullName()}
                userHandle={user.username}
                avatarUrl={absoluteAvatarUrl}
                onEditPress={handleEditProfileButton}
            />

            {/* --- MODIFICADO: Subtítulo dinámico --- */}
            <MenuLinkItem title={t('achievements')} subtitle={achievementsSubtitle} />

            <Box className="flex-1">
                <Heading size="xl" className="mt-10">{t('settings')}</Heading>
                <SettingsSwitchItem
                    title={t('themeLabel')}
                    currentValue={isDarkMode ? t('dark') : t('light')}
                    isEnabled={isDarkMode}
                    onToggle={toggleTheme}
                />
                <SettingsSwitchItem
                    title={t('languageLabel')}
                    currentValue={isSpanish ? t('spanish') : t('english')}
                    isEnabled={isSpanish}
                    onToggle={toggleLanguage}
                />
            </Box>

            <Box className="w-full gap-y-3 mt-4 mb-8">
                <Button
                    className="flex-row gap-x-2 bg-secondary-500 active:!bg-primary-500 h-[40px]"
                    onPress={() => router.push('/change_password')}
                >
                    <ButtonText className="text-white text-lg">{t('changePassword')}</ButtonText>
                </Button>

                <Button
                    className="w-full bg-red-600 active:!bg-red-700 flex-row gap-x-2 h-[40px]"
                    onPress={handleLogout}
                >
                    <ButtonText className="text-white text-lg">{t('logout')}</ButtonText>
                </Button>
            </Box>
        </Box>
    );
}