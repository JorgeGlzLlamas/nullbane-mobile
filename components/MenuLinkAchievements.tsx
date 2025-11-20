import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type MenuLinkItemProps = {
    title: string;
    subtitle: string;
};

export function MenuLinkItem({ title, subtitle }: MenuLinkItemProps) {
    const router = useRouter();

    return (
        <Pressable 
            className="flex-row items-center p-4 border border-primary-500 rounded-2xl mt-4 active:!opacity-80"
            onPress={() => router.push('/achievements')}
        >
            <FontAwesome5 name="trophy" size={42} color="#EFBF04" className="pr-6" />
            <Box className="flex-1 gap-y-1">
                <Heading size="lg" numberOfLines={1} className="text-primary-950">
                    {title}
                </Heading>
                <Text size="md" numberOfLines={1} bold className="text-typography-700">
                    {subtitle}
                </Text>
            </Box>
        </Pressable>
    );
}