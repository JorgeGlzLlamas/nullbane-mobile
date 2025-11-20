import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';

// Imports de API
import { ChatListItem as ChatItemType } from '../src/types/api'; // Asegúrate de tener este tipo
import { API_BASE_URL } from '../src/config';

type ChatListItemProps = {
    chat: ChatItemType; // Ahora recibe el objeto completo
};

export function ChatListItem({ chat }: ChatListItemProps) {
    const router = useRouter();
    const [loadFailed, setLoadFailed] = useState(false);
    
    const user = chat.other_user;
    const avatarUrl = user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : null;
    const hasValidAvatar = !!avatarUrl;

    const handlePress = () => {
        router.push({
            pathname: "/chat/[id]",
            params: { 
                id: chat.friendship_id,
                name: chat.other_user.full_name,
                avatarUrl: chat.other_user.avatar_url || '' 
            } 
        });
    };

    // Formato de fecha simple
    const formatDate = (isoString: string | null) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Si es hoy, mostrar hora, si no, mostrar fecha
        const isToday = new Date().toDateString() === date.toDateString();
        return isToday 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString();
    };

    return (
        <Pressable 
            className="flex-row items-center pt-3 pb-3 active:bg-secondary-100 px-6 border-b border-outline-50"
            onPress={handlePress}
        >
            <Avatar size="md" className="mr-3">
                { (hasValidAvatar && !loadFailed) ? (
                    <AvatarImage 
                        source={{ uri: avatarUrl! }} 
                        alt={user.full_name}
                        onError={() => setLoadFailed(true)}
                    />
                ) : (
                    <AvatarFallbackText>{user.full_name.substring(0, 2).toUpperCase()}</AvatarFallbackText>
                )}
            </Avatar>

            <Box className="flex-1">
                <Heading size="md" numberOfLines={1}>
                    {user.full_name}
                </Heading>
                <Text size="sm" numberOfLines={1} className="text-typography-500 mt-1">
                    {chat.last_message_content || 'Iniciar conversación'}
                </Text>
            </Box>
            
            {chat.last_message_at && (
                <Text size="xs" className="text-typography-400 ml-2 self-start mt-1">
                    {formatDate(chat.last_message_at)}
                </Text>
            )}
        </Pressable>
    );
}