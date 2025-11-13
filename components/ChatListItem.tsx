import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';

type ChatListItemProps = {
    id: string;
    name: string;
    lastMessage: string;
    date: string;
    avatarUrl: string;
};

export function ChatListItem({ id, name, lastMessage, date, avatarUrl }: ChatListItemProps) {
    const router = useRouter();
    const [loadFailed, setLoadFailed] = useState(false);
    const hasValidAvatar = !!avatarUrl;

    return (

        <Pressable 
            className="flex-row items-center pt-2 pb-2 active:bg-secondary-100 px-6"
            onPress={() => router.push(`/(tabs)`)}
        >
            <Avatar size="md" className="mr-3">
                { (hasValidAvatar && !loadFailed) ? (
                    <AvatarImage 
                        source={{ uri: avatarUrl }} 
                        alt={name}
                        onError={() => setLoadFailed(true)}
                    />
                ) : (
                    <AvatarFallbackText>{name.substring(0, 2).toUpperCase()}</AvatarFallbackText>
                )}
            </Avatar>

            <Box className="flex-1">
                <Heading size="md" numberOfLines={1}>
                    {name}
                </Heading>
                <Text size="lg" numberOfLines={1} className="text-typography-500">
                    {lastMessage}
                </Text>
            </Box>
            <Text size="sm" className="text-typography-500 ml-2">
                {date}
            </Text>
        </Pressable>
    );
}