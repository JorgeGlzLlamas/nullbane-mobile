import { useRouter } from 'expo-router';
import React from 'react';

import { Box } from '@/components/ui/box';

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { PlusIcon } from 'lucide-react-native';

import { ScrollView } from '@/components/ui/scroll-view'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 16,
                paddingLeft: 24,
                paddingRight: 24
            }}
        >
            <Heading size="2xl" className="mb-4">
                Publicaciones
            </Heading>
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <Box className="gap-y-4 pb-4">
                    <Pressable
                        onPress={() => { router.push('/(tabs)/chats'); }}
                        className="active:opacity-80"
                    >
                        <Card size="md" variant="filled" className="w-full h-[290px] bg-secondary-500 rounded-xl">
                            <Image
                                source={{
                                    uri: 'https://gluestack.github.io/public-blog-video-assets/yoga.png',
                                }}
                                className="mb-4 h-[180px] w-full rounded-md"
                                alt="image"
                            />
                            <Heading size="lg" className="mb-1 text-white" numberOfLines={1}>
                                Quick Start, este es un texto muy largo que debería truncar!
                            </Heading>
                            <Text size="sm" numberOfLines={2} className="text-typography-500">
                                Start building your next project in minutes, Start building your next project in minutes, Start building your next project in minutes
                            </Text>
                        </Card>
                    </Pressable>

                    <Pressable
                        onPress={() => { router.push('/(tabs)/chats'); }}
                        className="active:opacity-80"
                    >
                        <Card size="md" variant="filled" className="w-full h-[290px] bg-secondary-500 rounded-xl">
                            <Image
                                source={{
                                    uri: 'https://gluestack.github.io/public-blog-video-assets/yoga.png',
                                }}
                                className="mb-4 h-[180px] w-full rounded-md"
                                alt="image"
                            />
                            <Heading size="lg" className="mb-1 text-white" numberOfLines={1}>
                                Quick Start, este es un texto muy largo que debería truncar!
                            </Heading>
                            <Text size="sm" numberOfLines={2} className="text-typography-500">
                                Start building your next project in minutes, Start building your next project in minutes, Start building your next project in minutes
                            </Text>
                        </Card>
                    </Pressable>

                    <Pressable
                        onPress={() => { router.push('/(tabs)/chats'); }}
                        className="active:opacity-80"
                    >
                        <Card size="md" variant="filled" className="w-full h-[290px] bg-secondary-500 rounded-xl">
                            <Image
                                source={{
                                    uri: 'https://gluestack.github.io/public-blog-video-assets/yoga.png',
                                }}
                                className="mb-4 h-[180px] w-full rounded-md"
                                alt="image"
                            />
                            <Heading size="lg" className="mb-1 text-white" numberOfLines={1}>
                                Quick Start, este es un texto muy largo que debería truncar!
                            </Heading>
                            <Text size="sm" numberOfLines={2} className="text-typography-500">
                                Start building your next project in minutes, Start building your next project in minutes, Start building your next project in minutes
                            </Text>
                        </Card>
                    </Pressable>
                </Box>
            </ScrollView>

            <Fab
                size="lg"
                placement="bottom right"
                onPress={() => { router.push('/(tabs)/chats'); }}
                className="bg-primary-500 active:!bg-primary-600"
            >
                <FabIcon as={PlusIcon} size="xl" />
                <FabLabel>Publicación</FabLabel>
            </Fab>
        </Box>
    );
}