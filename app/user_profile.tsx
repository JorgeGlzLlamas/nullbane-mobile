import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { AlertCircleIcon, EditIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { useAuth } from '@/src/context/AuthContext';
import { User, UserUpdate } from '@/src/types/api';
import { API_BASE_URL } from '@/src/config';

// Estado global para manejar el archivo de imagen seleccionado
interface NewAvatarFile {
    uri: string;
    type: string;
    name: string;
}

export default function EditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('info-profile');
    const { apiFetch } = useAuth();
    const toast = useToast();

    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState<string | undefined>('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [nameError, setNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await apiFetch('/api/v1/users/me');
                if (!response.ok) throw new Error(t('errorLoadingProfile'));

                const data: User = await response.json();

                setOriginalUser(data);
                setName(data.first_name);
                setLastName(data.last_name || '');
                setPhone(data.phone_number || '');
                setEmail(data.email);
                setUsername(data.username);

                if (data.avatar_url) {
                    setAvatarUrl(`${API_BASE_URL}${data.avatar_url}`);
                }
            } catch (e) {
                setFormError(t('errorLoadingProfile'));
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadUserData();
    }, [apiFetch, t]);

    const uploadAvatar = async (fileState: NewAvatarFile): Promise<void> => {

        setIsAvatarUploading(true);
        const AVATAR_ENDPOINT = '/api/v1/users/me/avatar';

        const formData = new FormData();
        formData.append('file', {
            uri: fileState.uri,
            type: fileState.type,
            name: fileState.name,
        } as any);

        try {
            const response = await apiFetch(AVATAR_ENDPOINT, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) throw new Error(t('errorUploadingAvatar'));

            const updatedUser: User = await response.json();

            if (updatedUser.avatar_url) {
                setAvatarUrl(`${API_BASE_URL}${updatedUser.avatar_url}?t=${Date.now()}`);
            }
            toast.show({
                placement: "top",
                render: ({ id }) => {
                    return (
                        <Toast nativeID={id} action="success" variant="solid">
                            <ToastTitle>{t('avatarSuccess')}</ToastTitle>
                        </Toast>
                    );
                }
            });
        } catch (e: unknown) {
            toast.show({
                placement: "top",
                render: ({ id }) => {
                    return (
                        <Toast nativeID={id} action="error" variant="solid">
                            <ToastTitle>{t('uploadFailed')}</ToastTitle>
                        </Toast>
                    );
                }
            });
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert(t('permissionNeeded'));
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!pickerResult.canceled && pickerResult.assets.length > 0) {
            const { uri } = pickerResult.assets[0];
            const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

            setAvatarUrl(uri);

            const fileData: NewAvatarFile = {
                uri,
                type: mimeType,
                name: `avatar-${Date.now()}.${fileExtension}`,
            };

            await uploadAvatar(fileData);
        }
    };

    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setFormError(null);

        let isValid = true;
        if (name === '') { setNameError(t('nameRequired')); isValid = false; } else { setNameError(''); }
        if (lastName === '') { setLastNameError(t('lastNameRequired')); isValid = false; } else { setLastNameError(''); }
        if (!isValid) { setIsSubmitting(false); return; }

        try {
            const updates: UserUpdate = {};
            if (originalUser && name !== originalUser.first_name) updates.first_name = name;
            if (originalUser && lastName !== originalUser.last_name) updates.last_name = lastName;
            if (originalUser && phone !== originalUser.phone_number) updates.phone_number = phone;

            if (Object.keys(updates).length > 0) {
                const response = await apiFetch('/api/v1/users/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });

                if (!response.ok) throw new Error(t('errorUpdatingData'));
                setOriginalUser(prev => ({ ...prev!, ...updates }));
                router.back();
            } else {
                setFormError(t('noChangesSaved'));
            }
        } catch (e: any) {
            setFormError(`Error: ${e.message || t('errorUpdatingData')}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isInitialLoading) {
        return (
            <Box className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </Box>
        );
    }

    const fullNameFallback = [name, lastName].filter(Boolean).join(' ');

    return (
        <ScrollView 
            className="flex-1 bg-background-0"
            style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
        >
            <Box className="p-6 items-center gap-y-8">
                <Pressable 
                    onPress={handlePickImage} 
                    className="items-center"
                    disabled={isSubmitting || isAvatarUploading}
                >
                    <Avatar size="2xl">
                        {isAvatarUploading ? (
                            <ActivityIndicator size="small" style={{ position: 'absolute' }} />
                        ) : avatarUrl ? (
                            <AvatarImage source={{ uri: avatarUrl }} alt={fullNameFallback} />
                        ) : (
                            <AvatarFallbackText>{fullNameFallback.substring(0, 2).toUpperCase()}</AvatarFallbackText>
                        )}
                    </Avatar>
                    <Text size="md" className="text-typography-500 mt-1">
                        @{username}
                    </Text>
                    <Box className="flex-row items-center gap-x-1 mt-2">
                        <Icon as={EditIcon} size="sm" className="text-primary-950" />
                        <Text size="md" bold className="text-primary-950">
                            {isAvatarUploading ? t('uploading') : t('photo')}
                        </Text>
                    </Box>
                </Pressable>

                {formError && (
                    <Box className="w-full bg-red-100 border border-red-500 p-3 rounded-lg flex-row items-center gap-x-2">
                        <Icon as={AlertCircleIcon} size="sm" className="text-red-600" />
                        <Text size="sm" className="text-red-700">{formError}</Text>
                    </Box>
                )}

                {/* Nombre */}
                <FormControl className="w-full" isInvalid={!!nameError} isRequired>
                    <FormControlLabel>
                        <FormControlLabelText>{t('nameLabel')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input variant="underlined" size="xl">
                        <InputField
                            value={name}
                            onChangeText={(text) => { setName(text); if (nameError) setNameError(''); }}
                            placeholder={t('namePlaceholder')}
                        />
                    </Input>
                    <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                        <FormControlErrorText>{nameError}</FormControlErrorText>
                    </FormControlError>
                </FormControl>

                {/* Apellido */}
                <FormControl className="w-full" isInvalid={!!lastNameError} isRequired>
                    <FormControlLabel>
                        <FormControlLabelText>{t('lastNameLabel')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input variant="underlined" size="xl">
                        <InputField
                            value={lastName}
                            onChangeText={(text) => { setLastName(text); if (lastNameError) setLastNameError(''); }}
                            placeholder={t('lastNamePlaceholder')}
                        />
                    </Input>
                    <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                        <FormControlErrorText>{lastNameError}</FormControlErrorText>
                    </FormControlError>
                </FormControl>

                {/* Teléfono */}
                <FormControl className="w-full">
                    <FormControlLabel>
                        <FormControlLabelText>{t('phoneLabel')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input variant="underlined" size="xl">
                        <InputField value={phone} onChangeText={setPhone} placeholder="Ej: + 52 123457890" keyboardType="phone-pad" />
                    </Input>
                    <FormControlHelper>
                        <FormControlHelperText>Opcional</FormControlHelperText>
                    </FormControlHelper>
                </FormControl>

                {/* Email (ReadOnly) */}
                <FormControl className="w-full" isRequired>
                    <FormControlLabel>
                        <FormControlLabelText>{t('emailLabel')}</FormControlLabelText>
                    </FormControlLabel>
                    <Input variant="underlined" size="xl" isReadOnly>
                        <InputField value={email} />
                    </Input>
                </FormControl>

                <Button
                    className="w-full h-[40px] bg-primary-500 active:!bg-secondary-500 mt-4 rounded-full"
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <ButtonText className="text-xl text-background-0">{t('saveChanges')}</ButtonText>}
                </Button>
            </Box>
        </ScrollView>
    );
}
