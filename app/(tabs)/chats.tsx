import { useRouter } from 'expo-router';
import React from 'react';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { PlusIcon } from 'lucide-react-native';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react-native';
import { ScrollView } from '@/components/ui/scroll-view'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatListItem } from '@/components/ChatListItem';

const chats = [
    { id: '1', name: 'Luis', lastMessage: 'Este es el último mensaje de esta conversación', date: '10:33 p. m.', avatarUrl: 'https://static.wikia.nocookie.net/dragonball/images/8/8a/Tortuga.png/revision/latest/thumbnail/width/360/height/360?cb=20130220073534&path-prefix=es' },
    { id: '2', name: 'Jorge Luis', lastMessage: 'Este es el último mensaje de esta conversación', date: '10:33 p. m.', avatarUrl: '' },
    { id: '3', name: 'Llamas', lastMessage: 'Este es el último mensaje de esta conversación', date: '10:33 p. m.', avatarUrl: 'https://media.minutouno.com/p/957cdf129df00cff51ae490fc98bc6ad/adjuntos/150/imagenes/041/499/0041499750/goku.jpg' },
];

export default function Chats() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
                <InputField className='text-primary-500'
                    placeholder="Buscar chats..."
                />
            </Input>
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <Box>
                    {chats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            id={chat.id}
                            name={chat.name}
                            lastMessage={chat.lastMessage}
                            date={chat.date}
                            avatarUrl={chat.avatarUrl}
                        />
                    ))}
                </Box>
            </ScrollView>

            <Fab
                size="lg"
                placement="bottom right"
                onPress={() => { router.push('/(tabs)'); }}
                className="bg-primary-500 active:!bg-primary-600"
            >
                <FabIcon as={PlusIcon} size="xl" />
                <FabLabel bold>Amigos</FabLabel>
            </Fab>
        </Box>
    );
}