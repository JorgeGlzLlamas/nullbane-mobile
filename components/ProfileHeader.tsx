import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

type ProfileHeaderProps = {
    userName: string;
    userHandle: string;
    avatarUrl: string;
    onEditPress?: () => void; 
};

export function ProfileHeader({ userName, userHandle, avatarUrl, onEditPress }: ProfileHeaderProps) {
    const router = useRouter();
    const { t } = useTranslation('profile');

    const [loadFailed, setLoadFailed] = useState(false);
    const hasValidAvatar = !!avatarUrl;

    const handleEditProfile = () => {
        if (onEditPress) {
            onEditPress();
        } else {
            router.push('/(tabs)'); 
        }
    };

    return (
        <Box className="flex-row items-center bg-secondary-500 p-5 rounded-2xl">
            <Avatar size="2xl" className="mr-4">
                { (hasValidAvatar && !loadFailed) ? (
                    <AvatarImage 
                        source={{ uri: avatarUrl }} 
                        alt={userName}
                        onError={() => setLoadFailed(true)}
                    />
                ) : (
                    <AvatarFallbackText>{userName.substring(0, 2).toUpperCase()}</AvatarFallbackText>
                )}

            </Avatar>

            <Box className="flex-1 justify-center gap-y-1">
                <Heading size="xl" numberOfLines={1} className="text-white">
                    {userName}
                </Heading>
                <Text size="md" className="text-typography-500 mb-2">
                    @{userHandle}
                </Text>
                <Button 
                    size="sm" 
                    variant="solid" 
                    className="bg-primary-500 w-3/4 rounded-full"
                    onPress={handleEditProfile}
                >
                    <ButtonText className="text-md">
                        {t('edit')}
                    </ButtonText>
                </Button>
            </Box>
        </Box>
    );
}