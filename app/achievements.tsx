import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// UI Components
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Icon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { TrophyIcon, LockIcon, UnlockIcon, CalendarIcon } from 'lucide-react-native';

// Logic & API
import { useAuth } from '../src/context/AuthContext';
import { AchievementWithStatus } from '../src/types/api';

// --- COMPONENTE: ACHIEVEMENT ITEM ---
const AchievementItem = React.memo(({ 
    item, 
    onUnlock 
}: { 
    item: AchievementWithStatus, 
    onUnlock: (id: number) => Promise<void> 
}) => {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const { t } = useTranslation('achievements');

    // Manejador para el desbloqueo manual (Botón DEV)
    const handleManualUnlock = async () => {
        if (item.is_unlocked) return;
        setIsUnlocking(true);
        await onUnlock(item.id);
        setIsUnlocking(false); 
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return '';
        return format(new Date(isoString), 'dd MMM yyyy');
    };

    return (
        <Box 
            className={`
                p-4 rounded-xl border mb-3
                ${item.is_unlocked 
                    ? 'bg-background-50 border-outline-100' // <--- ESTILO ORIGINAL RESTAURADO
                    : 'bg-background-100 border-dashed border-outline-300 opacity-90'
                }
            `}
        >
            <HStack className="items-start gap-4">
                
                {/* ICONO */}
                <Box 
                    className={`
                        p-3 rounded-full items-center justify-center
                        ${item.is_unlocked ? 'bg-amber-100' : 'bg-background-200'}
                    `}
                >
                    {item.is_unlocked ? (
                        <Icon as={TrophyIcon} size="xl" className="text-amber-500" />
                    ) : (
                        <Icon as={LockIcon} size="xl" className="text-typography-400" />
                    )}
                </Box>

                {/* CONTENIDO */}
                <VStack className="flex-1 gap-1">
                    <HStack className="justify-between items-center">
                        <Heading 
                            size="sm" 
                            className={item.is_unlocked ? 'text-typography-900' : 'text-typography-500'}
                        >
                            {item.name}
                        </Heading>
                        
                        {item.is_unlocked && (
                            <Box className="bg-green-100 px-2 py-0.5 rounded">
                                <Text size="2xs" className="text-green-700 font-bold uppercase">{t('unlocked')}</Text>
                            </Box>
                        )}
                    </HStack>

                    <Text size="sm" className="text-typography-500 leading-snug">
                        {item.description}
                    </Text>

                    {/* FOOTER DE LA TARJETA */}
                    <Box className="mt-3">
                        {item.is_unlocked ? (
                            <HStack className="items-center gap-1">
                                <Icon as={CalendarIcon} size="xs" className="text-typography-400" />
                                <Text size="xs" className="text-typography-400">
                                    {t('unlockedIn')} {formatDate(item.earned_at)}
                                </Text>
                            </HStack>
                        ) : (
                            // Botón para desbloquear (Lógica DEV)
                            <Button 
                                size="xs" 
                                variant="outline" 
                                action="primary"
                                onPress={handleManualUnlock}
                                isDisabled={isUnlocking}
                                className="self-start border-primary-300"
                            >
                                {isUnlocking ? (
                                    <ButtonSpinner color="$primary500" />
                                ) : (
                                    <>
                                        <Icon as={UnlockIcon} className="text-primary-500 mr-1" />
                                        <ButtonText className="text-primary-600 uppercase">{t('unlockButton')}</ButtonText>
                                    </>
                                )}
                            </Button>
                        )}
                    </Box>
                </VStack>
            </HStack>
        </Box>
    );
});

// --- PANTALLA PRINCIPAL ---
export default function AchievementsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('achievements');
    const { apiFetch } = useAuth();

    const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Mis Logros',
            headerShadowVisible: false,
        });
    }, [navigation]);

    // --- 1. CARGA DE DATOS ---
    const fetchAchievements = useCallback(async () => {
        try {
            // Solo cargamos el catálogo, ya que no necesitamos permisos de admin
            const response = await apiFetch('/api/v1/achievements/');

            if (!response.ok) throw new Error('Error al cargar catálogo.');
            
            const data: AchievementWithStatus[] = await response.json();
            setAchievements(data);
            setError(null);

        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [apiFetch]);

    // --- 2. FUNCIÓN DE DESBLOQUEO (DEV) ---
    const unlockAchievement = useCallback(async (id: number) => {
        try {
            const response = await apiFetch(`/api/v1/achievements/${id}/unlock`, {
                method: 'POST'
            });
            
            if (response.status === 201) {
                // Recargamos para actualizar la barra de progreso y el estado
                await fetchAchievements(); 
            } else {
                console.error("Error al desbloquear logro");
            }
        } catch (e) {
            console.error("Error de red al desbloquear", e);
        }
    }, [apiFetch, fetchAchievements]);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchAchievements();
    };

    // Cálculos para el progreso
    const totalAchievements = achievements.length;
    const unlockedCount = achievements.filter(a => a.is_unlocked).length;
    const progressPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

    // --- RENDERIZADO ---

    if (isLoading) {
        return (
            <Box className="flex-1 justify-center items-center bg-background-0">
                <ActivityIndicator size="large" />
            </Box>
        );
    }
    
    if (error && achievements.length === 0) {
        return (
             <Box className="flex-1 justify-center items-center p-6">
                <Text className="text-red-500 mb-4">{error}</Text>
                <Button onPress={fetchAchievements}>
                    <ButtonText>Reintentar</ButtonText>
                </Button>
            </Box>
        );
    }

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
                paddingTop: insets.top + 16,
            }}
        >
            <Heading size="2xl" className="mx-6 mb-4">
                {t('title')}
            </Heading>
            
            <ScrollView 
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                }
            >
                <VStack className="gap-6">
                    
                    {/* --- HEADER CON PROGRESO --- */}
                    <Box className="bg-secondary-500 p-5 rounded-2xl border border-primary-100 shadow-sm">
                        <HStack className="justify-between items-end mb-3">
                            <VStack>
                                <Text size="md" className="text-white font-medium uppercase tracking-wider">
                                    {t('totalProgress')}
                                </Text>
                                <Heading size="2xl" className="text-white">
                                    {unlockedCount}<Text className="text-white text-xl">/{totalAchievements}</Text>
                                </Heading>
                            </VStack>
                            <Icon as={TrophyIcon} size="xl" className="text-white mb-1 opacity-90" />
                        </HStack>

                        {/* Barra de progreso */}
                        <Progress value={progressPercentage} size="md" className="bg-background-200 h-3 rounded-full">
                            <ProgressFilledTrack className="bg-primary-500 rounded-full" />
                        </Progress>
                        
                        <Text size="sm" className="text-right mt-2 text-typography-500">
                            {Math.round(progressPercentage)}% {t('unlocked')}
                        </Text>
                    </Box>

                    {/* --- LISTA DE LOGROS --- */}
                    <VStack>
                        <Heading size="xl" className="text-primary-500 mb-4">
                            {t('listAchievements')}
                        </Heading>
                        
                        {achievements.length > 0 ? (
                            achievements.map((item) => (
                                <AchievementItem 
                                    key={item.id} 
                                    item={item} 
                                    onUnlock={unlockAchievement} 
                                />
                            ))
                        ) : (
                             <Text className="text-center text-typography-400 italic mt-4">
                                No hay logros disponibles.
                            </Text>
                        )}
                    </VStack>

                </VStack>
            </ScrollView>
        </Box>
    );
}44