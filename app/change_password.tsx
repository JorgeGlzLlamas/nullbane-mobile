import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
} from '@/components/ui/form-control';

import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon, AlertCircleIcon } from 'lucide-react-native';

import { useAuth } from '@/src/context/AuthContext';
import { ActivityIndicator } from 'react-native';
import { Icon } from '@/components/ui/icon';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('change_password');

    const { apiFetch } = useAuth();

    const [actualPassword, setActualPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showActual, setShowActual] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(''); 
    const [actualError, setActualError] = useState('');
    const [newError, setNewError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const handleSavePassword = async () => {
        setActualError('');
        setNewError('');
        setConfirmError('');
        setFormError('');
        
        setIsSubmitting(true);
        try {
            const body = {
                old_password: actualPassword,
                new_password: newPassword,
                confirm_new_password: confirmPassword,
            };

            const response = await apiFetch('/api/v1/users/me/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.status === 204) {
                router.back();
                return;
            }

            const errorData = await response.json();

            let errorMessage = t('unknownError');
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail) && errorData.detail[0]?.msg) {
                    errorMessage = errorData.detail[0].msg; 
                }
            }

            if (errorMessage.includes('Contraseña actual incorrecta')) {
                setActualError(errorMessage);
            } else if (errorMessage.includes('no coinciden')) {
                setConfirmError(errorMessage);
            } else if (errorMessage.includes('mínimo 8 caracteres')) {
                setNewError(errorMessage);
            } else {
                setFormError(errorMessage);
            }

        } catch (e) {
            let errorMsg = t('unknownNetworkError');
            if (e instanceof Error) {
                errorMsg = e.message;
            }
            setFormError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Box 
            className="flex-1 bg-background-0"
            style={{ 
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
                paddingLeft: 24,
                paddingRight: 24
            }}
        >
            <Box className="flex-1 justify-center items-center gap-y-[30px]">
                <Heading size="3xl" className="text-center leading-normal">
                    {t('title')}
                </Heading>
                
                <Box className="items-center gap-y-4 w-full">

                    {formError && (
                        <Box className="w-full bg-red-100 border border-red-500 p-3 rounded-lg flex-row items-center gap-x-2">
                            <Icon as={AlertCircleIcon} size="sm" className="text-red-600" />
                            <Text size="sm" className="text-red-700">{formError}</Text>
                        </Box>
                    )}

                    <FormControl 
                        isRequired={true}
                        isInvalid={!!actualError}
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">{t('currentPassword')}</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showActual ? "text" : "password"}
                                placeholder="••••••••"
                                value={actualPassword}
                                onChangeText={(text) => {
                                    setActualPassword(text);
                                    if (actualError) setActualError('');
                                }}
                            />
                            <InputSlot onPress={() => setShowActual(!showActual)} className="pr-4">
                                <InputIcon
                                    as={showActual ? EyeOffIcon : EyeIcon}
                                    size="xl"
                                />
                            </InputSlot>
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{actualError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl 
                        isRequired={true}
                        isInvalid={!!newError}
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">{t('newPassword')}</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    if (newError) setNewError('');
                                }}
                            />
                            <InputSlot onPress={() => setShowNew(!showNew)} className="pr-4">
                                <InputIcon
                                    as={showNew ? EyeOffIcon : EyeIcon}
                                    size="xl"
                                />
                            </InputSlot>
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{newError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl 
                        isRequired={true}
                        isInvalid={!!confirmError}
                        className="w-full"
                        isDisabled={isSubmitting}
                    >
                        <FormControlLabel>
                            <FormControlLabelText className="text-lg">{t('confirmNewPassword')}</FormControlLabelText>
                        </FormControlLabel>
                        <Input size="xl">
                            <InputField
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (confirmError) setConfirmError('');
                                }}
                            />
                            <InputSlot onPress={() => setShowConfirm(!showConfirm)} className="pr-4">
                                <InputIcon
                                    as={showConfirm ? EyeOffIcon : EyeIcon}
                                    size="xl"
                                />
                            </InputSlot>
                        </Input>
                        <FormControlError>
                            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                            <FormControlErrorText>{confirmError}</FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                </Box>

                <Box className="w-full items-center gap-y-3 mt-4">
                    <Button
                        onPress={handleSavePassword}
                        className="w-full h-[45px] bg-primary-500 active:!bg-secondary-500"
                        isDisabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ButtonText className="text-2xl text-background-0">{t('saveChanges')}</ButtonText>
                        )}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
