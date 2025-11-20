import React, { useState, useCallback } from 'react'; // Agregamos useCallback
import { ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; // Agregamos useFocusEffect
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PlusIcon, SearchIcon } from 'lucide-react-native';

// UI Components
import { Box } from '@/components/ui/box';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';

// Custom Components
import { ChatListItem } from '@/components/ChatListItem';

// API & Context
import { useAuth } from '../../src/context/AuthContext';
import { ChatListItem as ChatItemType } from '../../src/types/api';

// Hook Debounce (asegúrate que este hook esté definido o importado)
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function Chats() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('chats');
    const { apiFetch } = useAuth();

    // Estados
    const [chatList, setChatList] = useState<ChatItemType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // --- CAMBIO CLAVE: USAR useFocusEffect ---
    useFocusEffect(
        useCallback(() => {
            let isActive = true; // Para evitar actualizar estado si el componente se desmonta

            const fetchChats = async () => {
                // Solo mostramos loading si la lista está vacía para evitar parpadeos al volver
                if (chatList.length === 0) setIsLoading(true);
                
                try {
                    // Construir query string
                    const endpoint = debouncedSearchTerm.trim() === ''
                        ? '/api/v1/chats/'
                        : `/api/v1/chats/?search=${encodeURIComponent(debouncedSearchTerm)}`;

                    const response = await apiFetch(endpoint);
                    
                    if (response.ok && isActive) {
                        const data: ChatItemType[] = await response.json();
                        setChatList(data);
                    }
                } catch (e) {
                    console.error("Error cargando chats", e);
                } finally {
                    if (isActive) setIsLoading(false);
                }
            };

            fetchChats();

            return () => {
                isActive = false;
            };
        }, [debouncedSearchTerm, apiFetch]) // Se ejecuta al enfocar Y si cambia la búsqueda
    );

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 16,
            }}
        >
            <Heading size="2xl" className="mb-6 mx-6">
                Chats
            </Heading>

            <Input size="xl" className="mb-4 rounded-full mx-6 border-primary-500">
                <InputSlot className="pl-5">
                    <InputIcon as={SearchIcon} className='text-primary-500' />
                </InputSlot>
                <InputField
                    placeholder={t('placeholder') || "Buscar..."}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </Input>

            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {isLoading ? (
                    <Box className="mt-10 justify-center items-center">
                        <ActivityIndicator size="large" />
                    </Box>
                ) : chatList.length > 0 ? (
                    <Box>
                        {chatList.map((chat) => (
                            <ChatListItem
                                key={chat.friendship_id}
                                chat={chat} 
                            />
                        ))}
                    </Box>
                ) : (
                    <Box className="mt-10 justify-center items-center opacity-50 px-6">
                        <Text className="text-center italic">
                            {searchTerm ? "No se encontraron chats." : "No tienes chats activos. ¡Agrega amigos para empezar!"}
                        </Text>
                    </Box>
                )}
            </ScrollView>

            <Fab
                size="lg"
                placement="bottom right"
                onPress={() => { router.push('/chat/add-friends'); }}
                className="bg-primary-500 active:!bg-primary-600 mb-4 mr-4"
            >
                <FabIcon as={PlusIcon} size="xl" />
                <FabLabel bold>{t('fabLabel') || "Nuevo Chat"}</FabLabel>
            </Fab>
        </Box>
    );
}